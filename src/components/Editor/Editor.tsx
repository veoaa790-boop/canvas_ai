import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar/Sidebar';
import { Toolbar } from './Toolbar/Toolbar';
import { CanvasArea } from './CanvasArea';
import { LayersPanel } from './Panels/LayersPanel';
import { Link } from 'react-router-dom';
import { Settings, Menu, X, Layers } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export const Editor: React.FC = () => {
  const { fonts } = useEditor();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setLayersOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic Font Loading
  useEffect(() => {
    const systemFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'];

    const googleFontsToLoad = fonts.filter(f => !systemFonts.includes(f.name));

    if (googleFontsToLoad.length === 0) return;

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
      <header className="h-12 md:h-14 bg-white border-b border-gray-200 flex items-center px-2 md:px-4 justify-between shrink-0 z-30">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="w-6 h-6 md:w-8 md:h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm md:text-base">D</div>
          <h1 className="font-semibold text-gray-800 text-sm md:text-base">Dualite Editor</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            <Link to="/admin" className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 text-xs md:text-sm">
                <Settings size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Admin</span>
            </Link>
            <button
              onClick={() => setLayersOpen(!layersOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded"
            >
              <Layers size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">JD</div>
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300' : 'relative'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Toolbar />
          <div className="flex-1 flex overflow-hidden relative">
            <CanvasArea />

            {/* Layers Panel - Desktop always visible, Mobile overlay */}
            <div className={`${isMobile ? 'fixed inset-y-0 right-0 z-50 transform transition-transform duration-300' : 'relative'} ${isMobile && !layersOpen ? 'translate-x-full' : 'translate-x-0'}`}>
              <LayersPanel onClose={() => setLayersOpen(false)} isMobile={isMobile} />
            </div>

            {/* Mobile Layers Overlay */}
            {isMobile && layersOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setLayersOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
