import React, { createContext, useContext, useState } from 'react';
import { fabric } from 'fabric';
import { Template, Font } from '../types';
import { DEFAULT_TEMPLATES } from '../utils/templates';
import { DEFAULT_FONTS, DEFAULT_MAGIC_EDIT_ICON, DEFAULT_ICON_COLOR } from '../utils/constants';

interface CanvasSize {
  width: number;
  height: number;
}

interface ApiConfig {
  kieAiKey: string;
  imgbbKey: string;
}

interface UiConfig {
  magicEditIcon: string; // Kept for backward compat, though Sidebar now uses hardcoded default
  iconColor: string;
  customIcons: Record<string, string>;
  iconColors: Record<string, string>; // New: Per-icon color overrides
}

interface EditorContextType {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas) => void;
  activeObject: fabric.Object | null;
  setActiveObject: (obj: fabric.Object | null) => void;
  
  // Templates
  templates: Template[];
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  saveTemplate: (name: string) => void;
  
  // Fonts
  fonts: Font[];
  addFont: (font: Font) => void;
  removeFont: (name: string) => void;

  // Canvas Config
  canvasSize: CanvasSize;
  setCanvasSize: (size: CanvasSize) => void;

  // API Config
  apiConfig: ApiConfig;
  updateApiConfig: (config: Partial<ApiConfig>) => void;

  // UI Config
  uiConfig: UiConfig;
  updateUiConfig: (config: Partial<UiConfig>) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [fonts, setFonts] = useState<Font[]>(DEFAULT_FONTS);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 800, height: 600 });
  
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    kieAiKey: localStorage.getItem('dualite_kie_key') || '',
    imgbbKey: localStorage.getItem('dualite_imgbb_key') || ''
  });

  // UI Config Initialization
  const savedCustomIcons = localStorage.getItem('dualite_custom_icons');
  const savedIconColors = localStorage.getItem('dualite_icon_colors');
  const savedIconColor = localStorage.getItem('dualite_icon_color');
  
  const [uiConfig, setUiConfig] = useState<UiConfig>({
    magicEditIcon: localStorage.getItem('dualite_magic_icon') || DEFAULT_MAGIC_EDIT_ICON,
    iconColor: savedIconColor || DEFAULT_ICON_COLOR,
    customIcons: savedCustomIcons ? JSON.parse(savedCustomIcons) : {},
    iconColors: savedIconColors ? JSON.parse(savedIconColors) : {}
  });

  const updateApiConfig = (config: Partial<ApiConfig>) => {
    setApiConfig(prev => {
      const newConfig = { ...prev, ...config };
      if (config.kieAiKey !== undefined) localStorage.setItem('dualite_kie_key', config.kieAiKey);
      if (config.imgbbKey !== undefined) localStorage.setItem('dualite_imgbb_key', config.imgbbKey);
      return newConfig;
    });
  };

  const updateUiConfig = (config: Partial<UiConfig>) => {
    setUiConfig(prev => {
      const newConfig = { ...prev, ...config };
      
      if (config.magicEditIcon !== undefined) {
        localStorage.setItem('dualite_magic_icon', config.magicEditIcon);
      }
      if (config.iconColor !== undefined) {
        localStorage.setItem('dualite_icon_color', config.iconColor);
      }
      if (config.customIcons !== undefined) {
        localStorage.setItem('dualite_custom_icons', JSON.stringify(config.customIcons));
      }
      if (config.iconColors !== undefined) {
        localStorage.setItem('dualite_icon_colors', JSON.stringify(config.iconColors));
      }
      
      return newConfig;
    });
  };

  const addTemplate = (template: Template) => {
    setTemplates(prev => [...prev, template]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const saveTemplate = (name: string) => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    const newTemplate: Template = {
      id: Date.now().toString(),
      name,
      thumbnail: canvas.toDataURL({ format: 'png', multiplier: 0.5 }),
      json
    };
    addTemplate(newTemplate);
  };

  const addFont = (font: Font) => {
    if (!fonts.find(f => f.name === font.name)) {
      setFonts(prev => [...prev, font]);
    }
  };

  const removeFont = (name: string) => {
    setFonts(prev => prev.filter(f => f.name !== name));
  };

  return (
    <EditorContext.Provider value={{
      canvas,
      setCanvas,
      activeObject,
      setActiveObject,
      templates,
      addTemplate,
      deleteTemplate,
      saveTemplate,
      fonts,
      addFont,
      removeFont,
      canvasSize,
      setCanvasSize,
      apiConfig,
      updateApiConfig,
      uiConfig,
      updateUiConfig
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
};
