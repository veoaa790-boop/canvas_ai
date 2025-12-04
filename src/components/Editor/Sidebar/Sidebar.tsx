import React, { useState } from 'react';
import { useEditor } from '../../../context/EditorContext';
import { 
  Layout, Image as ImageIcon, Shapes, Upload, Type, 
  Heading1, Heading2, Type as TypeIcon, Sparkles, 
  Loader2, Mic, MicOff, Wand2, Video, Plus, Download,
  X, Camera
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { fabric } from 'fabric';
import { kieService } from '../../../services/kieService';
import { DynamicIcon } from '../../Common/DynamicIcon';
import { ICON_KEYS } from '../../../utils/constants';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const { canvas, templates, apiConfig, activeObject, uiConfig } = useEditor();
  
  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [isListeningGen, setIsListeningGen] = useState(false);

  // AI Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoImage, setVideoImage] = useState<string>('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState('');
  const [videoError, setVideoError] = useState('');
  const [isListeningVideo, setIsListeningVideo] = useState(false);

  // AI Edit State
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');
  const [isListeningEdit, setIsListeningEdit] = useState(false);

  const TABS = [
    { id: 'templates', icon: Layout, label: 'Templates', key: ICON_KEYS.SIDEBAR_TEMPLATES },
    { id: 'text', icon: Type, label: 'Text', key: ICON_KEYS.SIDEBAR_TEXT },
    { id: 'shapes', icon: Shapes, label: 'Shapes', key: ICON_KEYS.SIDEBAR_SHAPES },
    { id: 'images', icon: ImageIcon, label: 'Images', key: ICON_KEYS.SIDEBAR_IMAGES },
    { id: 'ai', icon: Sparkles, label: 'AI Studio', key: ICON_KEYS.SIDEBAR_AI },
    { id: 'ai-video', icon: Video, label: 'AI Video', key: ICON_KEYS.SIDEBAR_VIDEO },
    // Updated: Default to Camera icon for Magic Edit
    { id: 'magic-edit', icon: Camera, label: 'Magic Edit', key: ICON_KEYS.SIDEBAR_MAGIC },
  ];

  const loadTemplate = (json: string) => {
    if (!canvas) return;
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.renderAll();
    });
  };

  const addText = (text: string, options: any) => {
    if (!canvas) return;
    const textObj = new fabric.IText(text, {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Roboto',
      ...options
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  };

  const addImage = (url: string) => {
    if (!canvas) return;
    fabric.Image.fromURL(url, (img) => {
      img.scaleToWidth(200);
      canvas.add(img);
      canvas.centerObject(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const addVideoToCanvas = (url: string) => {
    if (!canvas) return;
    
    const videoEl = document.createElement('video');
    videoEl.src = url;
    videoEl.crossOrigin = 'anonymous';
    videoEl.width = 400;
    videoEl.height = 300;
    
    videoEl.addEventListener('loadedmetadata', () => {
        const videoObj = new fabric.Image(videoEl, {
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            objectCaching: false,
        });
        
        if (videoEl.videoWidth > 500) {
            videoObj.scaleToWidth(500);
        }

        canvas.add(videoObj);
        canvas.setActiveObject(videoObj);
        canvas.renderAll();
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result as string;
        fabric.Image.fromURL(data, (img) => {
          img.scaleToWidth(200);
          canvas.add(img);
          canvas.centerObject(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        setVideoImage(f.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceInput = (
    setPrompt: React.Dispatch<React.SetStateAction<string>>, 
    setIsListening: React.Dispatch<React.SetStateAction<boolean>>,
    isListening: boolean
  ) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Set language to Arabic (Saudi Arabia) to ensure accurate transcription
    recognition.lang = 'ar-SA'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.start();
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    if (!apiConfig.kieAiKey) {
        setAiError('Please configure API Key in Admin Panel');
        return;
    }

    setIsGenerating(true);
    setAiError('');

    try {
        const imageUrl = await kieService.generateImage(aiPrompt, apiConfig.kieAiKey);
        addImage(imageUrl);
    } catch (err) {
        setAiError('Failed to generate image. Check API Key.');
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleVideoGenerate = async () => {
    if (!videoPrompt.trim()) return;
    if (!apiConfig.kieAiKey) {
        setVideoError('Please configure KIE.ai API Key in Admin Panel');
        return;
    }
    if (videoImage && !apiConfig.imgbbKey) {
        setVideoError('ImgBB API Key required for Image-to-Video (Admin Panel)');
        return;
    }

    setIsGeneratingVideo(true);
    setVideoError('');
    setVideoResult('');

    try {
        const videoUrl = await kieService.generateVideo(
            videoPrompt, 
            apiConfig.kieAiKey, 
            apiConfig.imgbbKey, 
            videoImage
        );
        setVideoResult(videoUrl);
    } catch (err) {
        setVideoError('Failed to generate video. Try again later.');
        console.error(err);
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const handleAiEdit = async () => {
    if (!canvas || !activeObject || activeObject.type !== 'image') return;
    if (!editPrompt.trim()) return;
    if (!apiConfig.kieAiKey) {
        setEditError('Please configure KIE.ai API Key in Admin Panel');
        return;
    }
    if (!apiConfig.imgbbKey) {
        setEditError('Please configure ImgBB API Key in Admin Panel');
        return;
    }

    setIsEditing(true);
    setEditError('');

    try {
        const imageSrc = activeObject.toDataURL({ format: 'png', multiplier: 1 });
        const newImageUrl = await kieService.editImage(imageSrc, editPrompt, apiConfig.kieAiKey, apiConfig.imgbbKey);

        fabric.Image.fromURL(newImageUrl, (img) => {
            img.set({
                left: activeObject.left,
                top: activeObject.top,
                scaleX: activeObject.scaleX,
                scaleY: activeObject.scaleY,
                angle: activeObject.angle
            });
            
            canvas.remove(activeObject);
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            setEditPrompt('');
        }, { crossOrigin: 'anonymous' });

    } catch (err) {
        setEditError('Failed to edit image.');
        console.error(err);
    } finally {
        setIsEditing(false);
    }
  };

  const isImageSelected = activeObject && activeObject.type === 'image';

  return (
    <div className="flex h-full bg-white border-r border-gray-200">
      {/* Icons Rail */}
      <div className="w-16 flex flex-col items-center py-4 border-r border-gray-200 gap-4 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded w-full transition-colors",
              activeTab === tab.id ? "bg-indigo-50" : "hover:bg-gray-50"
            )}
          >
            <DynamicIcon 
                name={tab.key} 
                icon={tab.icon} 
                active={activeTab === tab.id}
            />
            <span className={cn(
                "text-[10px] font-medium text-center leading-tight",
                activeTab === tab.id ? "text-indigo-600" : "text-gray-500"
            )}>
                {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="w-64 flex flex-col bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4 capitalize">
            {TABS.find(t => t.id === activeTab)?.label || activeTab}
          </h2>
          
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 gap-3">
              {templates.map((t) => (
                <button 
                  key={t.id} 
                  onClick={() => loadTemplate(t.json)}
                  className="group relative aspect-video bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200"
                >
                  <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end p-2">
                    <span className="text-xs font-medium text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">{t.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <button 
                onClick={() => addText('Add a heading', { fontSize: 42, fontWeight: 'bold' })}
                className="w-full p-4 bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <DynamicIcon name={ICON_KEYS.SIDEBAR_TEXT_H1} icon={Heading1} size={24} className="text-gray-800" />
                <span className="text-lg font-bold text-gray-800">Add a heading</span>
              </button>
              
              <button 
                onClick={() => addText('Add a subheading', { fontSize: 28, fontWeight: '500' })}
                className="w-full p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <DynamicIcon name={ICON_KEYS.SIDEBAR_TEXT_H2} icon={Heading2} size={20} className="text-gray-700" />
                <span className="text-base font-medium text-gray-700">Add a subheading</span>
              </button>

              <button 
                onClick={() => addText('Add a little bit of body text', { fontSize: 16, fontWeight: 'normal' })}
                className="w-full p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <DynamicIcon name={ICON_KEYS.SIDEBAR_TEXT_BODY} icon={TypeIcon} size={18} className="text-gray-600" />
                <span className="text-sm text-gray-600">Add body text</span>
              </button>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <DynamicIcon name={ICON_KEYS.SIDEBAR_IMAGE_UPLOAD} icon={Upload} size={24} className="text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Upload Image</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['abstract', 'nature', 'tech', 'people'].map((cat, i) => (
                  <button 
                    key={i}
                    onClick={() => addImage(`https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/400x400?text=${cat}`)}
                    className="aspect-square bg-gray-200 rounded overflow-hidden hover:opacity-80"
                  >
                    <img src={`https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x200?text=${cat}`} alt={cat} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shapes' && (
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => {
                    if(!canvas) return;
                    const rect = new fabric.Rect({ width: 50, height: 50, fill: '#333', left: 100, top: 100 });
                    canvas.add(rect);
                    canvas.setActiveObject(rect);
                }}
                className="aspect-square bg-white border rounded flex items-center justify-center hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-800" />
              </button>
              <button 
                onClick={() => {
                    if(!canvas) return;
                    const circle = new fabric.Circle({ radius: 25, fill: '#333', left: 100, top: 100 });
                    canvas.add(circle);
                    canvas.setActiveObject(circle);
                }}
                className="aspect-square bg-white border rounded flex items-center justify-center hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-800 rounded-full" />
              </button>
              <button 
                onClick={() => {
                    if(!canvas) return;
                    const tri = new fabric.Triangle({ width: 50, height: 50, fill: '#333', left: 100, top: 100 });
                    canvas.add(tri);
                    canvas.setActiveObject(tri);
                }}
                className="aspect-square bg-white border rounded flex items-center justify-center hover:bg-gray-100"
              >
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] border-b-gray-800" />
              </button>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
                        <DynamicIcon name={ICON_KEYS.SIDEBAR_AI} icon={Sparkles} size={16} /> Text to Image
                    </div>
                    <div className="relative">
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Describe an image to generate..."
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none pr-8 text-right"
                            dir="auto"
                        />
                        <button 
                            onClick={() => toggleVoiceInput(setAiPrompt, setIsListeningGen, isListeningGen)}
                            className={cn(
                                "absolute bottom-2 right-2 p-1.5 rounded-full transition-colors",
                                isListeningGen ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            )}
                            title="Speak prompt (Arabic)"
                        >
                            {isListeningGen ? (
                                <Mic size={14} />
                            ) : (
                                <DynamicIcon name={ICON_KEYS.SIDEBAR_AI_MIC} icon={MicOff} size={14} />
                            )}
                        </button>
                    </div>
                    <button 
                        onClick={handleAiGenerate}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <DynamicIcon name={ICON_KEYS.SIDEBAR_AI_GENERATE} icon={Sparkles} size={16} className="text-white" />}
                        Generate Image
                    </button>
                    {aiError && <div className="text-xs text-red-500">{aiError}</div>}
                </div>
            </div>
          )}

          {activeTab === 'ai-video' && (
            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
                        <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO} icon={Video} size={16} /> Text to Video
                    </div>
                    <div className="relative">
                        <textarea 
                            value={videoPrompt}
                            onChange={(e) => setVideoPrompt(e.target.value)}
                            placeholder="Describe a video scene..."
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none pr-8 text-right"
                            dir="auto"
                        />
                        <button 
                            onClick={() => toggleVoiceInput(setVideoPrompt, setIsListeningVideo, isListeningVideo)}
                            className={cn(
                                "absolute bottom-2 right-2 p-1.5 rounded-full transition-colors",
                                isListeningVideo ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            )}
                            title="Speak prompt (Arabic)"
                        >
                            {isListeningVideo ? (
                                <Mic size={14} />
                            ) : (
                                <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO_MIC} icon={MicOff} size={14} />
                            )}
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">Reference Image (Optional)</label>
                        {!videoImage ? (
                            <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO_UPLOAD} icon={Upload} size={14} />
                                    <span className="text-xs">Upload Image</span>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleVideoImageUpload} />
                            </label>
                        ) : (
                            <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                <img src={videoImage} alt="Reference" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => setVideoImage('')}
                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO_CLEAR} icon={X} size={12} className="text-white" />
                                </button>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleVideoGenerate}
                        disabled={isGeneratingVideo || !videoPrompt.trim()}
                        className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        {isGeneratingVideo ? <Loader2 size={16} className="animate-spin" /> : <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO_GENERATE} icon={Video} size={16} className="text-white" />}
                        Generate Video
                    </button>
                    
                    {videoError && <div className="text-xs text-red-500">{videoError}</div>}

                    {videoResult && (
                        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
                                <video 
                                    src={videoResult} 
                                    controls 
                                    className="w-full h-auto max-h-[200px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => addVideoToCanvas(videoResult)}
                                    className="py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium flex items-center justify-center gap-1"
                                >
                                    <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO_ADD} icon={Plus} size={14} /> Add to Canvas
                                </button>
                                <a 
                                    href={videoResult} 
                                    download="generated-video.mp4"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium flex items-center justify-center gap-1"
                                >
                                    <DynamicIcon name={ICON_KEYS.SIDEBAR_VIDEO_DOWNLOAD} icon={Download} size={14} /> Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'magic-edit' && (
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
                    <DynamicIcon name={ICON_KEYS.SIDEBAR_MAGIC} icon={Wand2} size={16} /> Magic Edit
                </div>
                
                {!isImageSelected ? (
                    <div className="bg-gray-100 p-4 rounded text-xs text-gray-500 text-center border border-gray-200">
                        <p className="mb-2 font-medium">No Image Selected</p>
                        Select an image on the canvas to use Magic Edit.
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <textarea 
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                placeholder="e.g. Make it rainy, change coat to red..."
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 h-24 resize-none pr-8 text-right"
                                dir="auto"
                            />
                            <button 
                                onClick={() => toggleVoiceInput(setEditPrompt, setIsListeningEdit, isListeningEdit)}
                                className={cn(
                                    "absolute bottom-2 right-2 p-1.5 rounded-full transition-colors",
                                    isListeningEdit ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                                title="Speak prompt (Arabic)"
                            >
                                {isListeningEdit ? (
                                    <Mic size={14} />
                                ) : (
                                    <DynamicIcon name={ICON_KEYS.SIDEBAR_MAGIC_MIC} icon={MicOff} size={14} />
                                )}
                            </button>
                        </div>
                        <button 
                            onClick={handleAiEdit}
                            disabled={isEditing || !editPrompt.trim()}
                            className="w-full py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            {isEditing ? <Loader2 size={16} className="animate-spin" /> : <DynamicIcon name={ICON_KEYS.SIDEBAR_MAGIC_APPLY} icon={Wand2} size={16} className="text-white" />}
                            Apply Edit
                        </button>
                        {editError && <div className="text-xs text-red-500">{editError}</div>}
                    </>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
