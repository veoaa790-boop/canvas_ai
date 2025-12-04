// Mock data for templates
export const DEFAULT_TEMPLATES = [
  {
    id: '1',
    name: 'Modern Business Card',
    thumbnail: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/2563eb/ffffff?text=Business+Card',
    json: JSON.stringify({
      version: "5.3.0",
      objects: [
        { type: 'rect', left: 0, top: 0, width: 800, height: 600, fill: '#f3f4f6' },
        { type: 'rect', left: 50, top: 50, width: 700, height: 150, fill: '#2563eb' },
        { type: 'i-text', left: 70, top: 80, text: 'Creative Design', fontSize: 60, fill: '#ffffff', fontFamily: 'Arial' },
        { type: 'i-text', left: 70, top: 250, text: 'John Doe', fontSize: 40, fill: '#1f2937', fontFamily: 'Arial' },
        { type: 'i-text', left: 70, top: 300, text: 'Senior Designer', fontSize: 24, fill: '#6b7280', fontFamily: 'Arial' }
      ]
    })
  },
  {
    id: '2',
    name: 'Social Media Post',
    thumbnail: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/db2777/ffffff?text=Social+Post',
    json: JSON.stringify({
      version: "5.3.0",
      objects: [
        { type: 'rect', left: 0, top: 0, width: 800, height: 600, fill: '#111827' },
        { type: 'circle', left: 300, top: 100, radius: 150, fill: '#db2777' },
        { type: 'i-text', left: 200, top: 450, text: 'BIG SALE', fontSize: 80, fill: '#ffffff', fontWeight: 'bold', fontFamily: 'Arial' }
      ]
    })
  }
];
