import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar/Sidebar';
import { Toolbar } from './Toolbar/Toolbar';
import { CanvasArea } from './CanvasArea';
import { LayersPanel } from './Panels/LayersPanel';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export const Editor: React.FC = () => {
  const { fonts } = useEditor();

  // Dynamic Font Loading
  useEffect(() => {
    const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];
    
    // Filter out system fonts, as they don't need to be loaded from Google
    const googleFontsToLoad = fonts.filter(f => !systemFonts.includes(f.name));
    
    if (googleFontsToLoad.length === 0) return;

    // Construct Google Fonts URL
    // Format: family=Font1:wght@400;700&family=Font2...
    // We'll load regular and bold for simplicity, or allow all weights
    const families = googleFontsToLoad
      .map(f => `family=${f.family}:ital,wght@0,300;0,400;0,500;0,700;1,400`)
      .join('&');
    
    const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement;

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    link.href = url;

  }, [fonts]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">D</div>
          <h1 className="font-semibold text-gray-800">Dualite Editor</h1>
        </div>
        <div className="flex items-center gap-4">
            <Link to="/admin" className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-sm">
                <Settings size={16} /> Admin
            </Link>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">JD</div>
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Toolbar />
          <div className="flex-1 flex overflow-hidden">
            <CanvasArea />
            <LayersPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
