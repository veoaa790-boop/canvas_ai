import axios from 'axios';
import { KIE_MODELS } from '../utils/constants';

const BASE_URL = 'https://api.kie.ai/api/v1/jobs';

interface TaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface PollResponse {
  code: number;
  data: {
    state: 'waiting' | 'running' | 'success' | 'fail';
    resultJson?: string; // Stringified JSON containing resultUrls
    failMsg?: string;
  };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const kieService = {
  /**
   * Upload image to ImgBB to get a public URL
   */
  uploadToImgbb: async (base64: string, imgbbKey: string): Promise<string> => {
    if (!imgbbKey) throw new Error('ImgBB API Key is required. Please add it in Admin Panel.');
    
    // Strip the data:image/png;base64, header
    const imageData = base64.replace(/^data:image\/\w+;base64,/, "");
    
    const formData = new FormData();
    formData.append('image', imageData);

    try {
        const res = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, formData);
        if (res.data && res.data.data && res.data.data.url) {
            return res.data.data.url;
        }
        throw new Error('Invalid response from ImgBB');
    } catch (error) {
        console.error('ImgBB Upload Error:', error);
        throw new Error('Failed to upload image to hosting service.');
    }
  },

  /**
   * Generic method to create a task and poll for results
   */
  runTask: async (model: string, input: any, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error('KIE.ai API Key is missing');

    // 1. Create Task
    console.log(`[KIE.ai] Creating task for model: ${model}`);
    const createRes = await axios.post<TaskResponse>(
      `${BASE_URL}/createTask`,
      {
        model,
        input
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (createRes.data.code !== 200 || !createRes.data.data?.taskId) {
      throw new Error(`Failed to create task: ${createRes.data.msg}`);
    }

    const taskId = createRes.data.data.taskId;
    console.log(`[KIE.ai] Task created: ${taskId}`);

    // 2. Poll for completion
    let attempts = 0;
    const maxAttempts = 120; // Extended timeout for video (approx 4 mins)
    
    while (attempts < maxAttempts) {
      await sleep(2000); // Wait 2s between polls
      attempts++;

      const pollRes = await axios.get<PollResponse>(
        `${BASE_URL}/recordInfo?taskId=${taskId}`,
        {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        }
      );

      const { state, resultJson, failMsg } = pollRes.data.data;
      console.log(`[KIE.ai] Polling ${taskId}: ${state}`);

      if (state === 'fail') {
        throw new Error(`Task failed: ${failMsg || 'Unknown error'}`);
      }

      if (state === 'success' && resultJson) {
        try {
          const results = JSON.parse(resultJson);
          
          // Video Response Handling
          if (results.video_url) return results.video_url;
          if (results.videos && results.videos.length > 0) return results.videos[0];
          
          // Image Response Handling
          if (results.resultUrls && results.resultUrls.length > 0) return results.resultUrls[0];
          if (results.images && results.images.length > 0) return results.images[0];
          if (results.output && results.output.length > 0) return results.output[0];

          throw new Error('No content URL found in success response');
        } catch (e) {
          throw new Error('Failed to parse result JSON');
        }
      }
    }

    throw new Error('Task timed out');
  },

  /**
   * Generate an image from a text prompt using nano-banana-pro
   */
  generateImage: async (prompt: string, apiKey: string): Promise<string> => {
    return kieService.runTask(
      KIE_MODELS.PRO,
      {
        prompt: prompt,
        num_inference_steps: 25,
        guidance_scale: 7.5
      },
      apiKey
    );
  },

  /**
   * Generate a video from a text prompt using Sora2
   * Optionally accepts an imageBase64 to use as a reference
   */
  generateVideo: async (prompt: string, apiKey: string, imgbbKey?: string, imageBase64?: string): Promise<string> => {
    const input: any = {
      prompt: prompt,
      duration: 5 // Default duration if supported
    };

    // If an image is provided, upload it first
    if (imageBase64) {
      if (!imgbbKey) throw new Error('ImgBB API Key is required for Image-to-Video.');
      const publicUrl = await kieService.uploadToImgbb(imageBase64, imgbbKey);
      input.image_url = publicUrl;
    }

    return kieService.runTask(
      KIE_MODELS.VIDEO,
      input,
      apiKey
    );
  },

  /**
   * Edit an image using nano-banana-edit with a custom prompt
   */
  editImage: async (imageBase64: string, prompt: string, apiKey: string, imgbbKey: string): Promise<string> => {
    // 1. Upload to ImgBB to get public URL
    const publicUrl = await kieService.uploadToImgbb(imageBase64, imgbbKey);
    console.log(`[KIE.ai] Image uploaded to: ${publicUrl}`);

    // 2. Send public URL to KIE.ai
    return kieService.runTask(
      KIE_MODELS.EDIT,
      {
        prompt: prompt,
        image_urls: [publicUrl],
        output_format: "png",
        image_size: "1:1"
      },
      apiKey
    );
  },

  /**
   * Background Removal specific wrapper
   */
  removeBackground: async (imageBase64: string, apiKey: string, imgbbKey: string): Promise<string> => {
    return kieService.editImage(imageBase64, "remove background, transparent background, high quality", apiKey, imgbbKey);
  }
};
