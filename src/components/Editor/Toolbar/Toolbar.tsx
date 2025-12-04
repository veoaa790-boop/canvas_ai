import React, { useEffect, useState } from 'react';
import { useEditor } from '../../../context/EditorContext';
import { HexColorPicker } from 'react-colorful';
import { 
  Trash2, Copy, AlignCenter, AlignLeft, AlignRight, 
  Bold, Italic, Underline, MoveHorizontal, 
  Undo, Redo, Download, Mic, MicOff, Plus, Minus,
  Crop, Eraser, Loader2
} from 'lucide-react';
import { useHistory } from '../../../hooks/useHistory';
import { useVoiceCommands } from '../../../hooks/useVoiceCommands';
import jsPDF from 'jspdf';
import { cn } from '../../../utils/cn';
import { fabric } from 'fabric';
import { CropModal } from '../../Modals/CropModal';
import { kieService } from '../../../services/kieService';
import { DynamicIcon } from '../../Common/DynamicIcon';
import { ICON_KEYS } from '../../../utils/constants';

export const Toolbar: React.FC = () => {
  const { canvas, activeObject, fonts, apiConfig } = useEditor();
  const { saveHistory, undo, redo, canUndo, canRedo } = useHistory(canvas);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [charSpacing, setCharSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);

  useEffect(() => {
    if (!activeObject) return;

    if (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox') {
      // @ts-ignore
      setFontFamily(activeObject.fontFamily || 'Arial');
      // @ts-ignore
      setFontSize(activeObject.fontSize || 24);
      // @ts-ignore
      setIsBold(activeObject.fontWeight === 'bold');
      // @ts-ignore
      setIsItalic(activeObject.fontStyle === 'italic');
      // @ts-ignore
      setIsUnderline(!!activeObject.underline);
      // @ts-ignore
      setTextAlign(activeObject.textAlign || 'left');
      // @ts-ignore
      setCharSpacing(activeObject.charSpacing || 0);
      // @ts-ignore
      setLineHeight(activeObject.lineHeight || 1.2);
    }
  }, [activeObject]);

  const updateObject = (key: string, value: any) => {
    if (!canvas || !activeObject) return;
    activeObject.set(key as any, value);
    canvas.requestRenderAll();
    saveHistory();
  };

  const handleFontFamily = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFontFamily(value);
    updateObject('fontFamily', value);
  };

  const toggleBold = () => {
    const newValue = !isBold;
    setIsBold(newValue);
    updateObject('fontWeight', newValue ? 'bold' : 'normal');
  };

  const toggleItalic = () => {
    const newValue = !isItalic;
    setIsItalic(newValue);
    updateObject('fontStyle', newValue ? 'italic' : 'normal');
  };

  const toggleUnderline = () => {
    const newValue = !isUnderline;
    setIsUnderline(newValue);
    updateObject('underline', newValue);
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFontSize(value);
    updateObject('fontSize', value);
  };

  const handleTextAlign = (align: string) => {
    setTextAlign(align);
    updateObject('textAlign', align);
  };

  const handleCharSpacing = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCharSpacing(value);
    updateObject('charSpacing', value);
  };

  const handleLineHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLineHeight(value);
    updateObject('lineHeight', value);
  };

  const deleteActive = () => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    saveHistory();
  };

  const duplicateActive = () => {
    if (!canvas || !activeObject) return;
    activeObject.clone((cloned: any) => {
      canvas.discardActiveObject();
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
        evented: true,
      });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject((obj: any) => canvas.add(obj));
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      saveHistory();
    });
  };

  const changeColor = (color: string) => {
    if (!canvas || !activeObject) return;
    activeObject.set('fill', color);
    canvas.renderAll();
    saveHistory();
  };

  const exportDesign = (format: 'png' | 'jpg' | 'pdf') => {
    if (!canvas) return;
    if (format === 'pdf') {
      const imgData = canvas.toDataURL({ format: 'png', multiplier: 1 });
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width || 800, canvas.height || 600]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width || 800, canvas.height || 600);
      pdf.save('design.pdf');
    } else {
      const dataURL = canvas.toDataURL({ format, multiplier: 2 });
      const link = document.createElement('a');
      link.download = `design.${format}`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRemoveBackground = async () => {
    if (!canvas || !activeObject || activeObject.type !== 'image') return;
    if (!apiConfig.kieAiKey) {
        alert('Please configure KIE.ai API Key in Admin Panel');
        return;
    }
    if (!apiConfig.imgbbKey) {
        alert('Please configure ImgBB API Key in Admin Panel (Required for image processing)');
        return;
    }
    
    setIsRemovingBg(true);
    try {
        const imageSrc = activeObject.toDataURL({
            format: 'png',
            multiplier: 1
        });
        
        const newImageBase64 = await kieService.removeBackground(imageSrc, apiConfig.kieAiKey, apiConfig.imgbbKey);
        
        fabric.Image.fromURL(newImageBase64, (img) => {
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
            saveHistory();
            setIsRemovingBg(false);
        }, { crossOrigin: 'anonymous' });

    } catch (error) {
        console.error('Background removal failed:', error);
        alert('Failed to remove background. Check API Keys or console.');
        setIsRemovingBg(false);
    }
  };

  const initCrop = () => {
    if (!activeObject || activeObject.type !== 'image') return;
    const src = activeObject.toDataURL({ format: 'png' });
    setCropImageSrc(src);
    setShowCropModal(true);
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (!canvas || !activeObject) return;

    fabric.Image.fromURL(croppedUrl, (img) => {
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
        saveHistory();
    }, { crossOrigin: 'anonymous' });
  };

  const { isListening, startListening, supported } = useVoiceCommands({
    canvas, 
    addText: (t) => {
        if(!canvas) return;
        const text = new fabric.IText(t, { left: 100, top: 100 });
        canvas.add(text);
        canvas.setActiveObject(text);
    }, 
    addShape: (t) => {
        if(!canvas) return;
        if(t === 'rect') canvas.add(new fabric.Rect({ width: 100, height: 100, fill: 'blue', left: 100, top: 100 }));
        if(t === 'circle') canvas.add(new fabric.Circle({ radius: 50, fill: 'red', left: 100, top: 100 }));
    }, 
    deleteActive, 
    changeColor
  });

  const isText = activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text' || activeObject.type === 'textbox');
  const isImage = activeObject && activeObject.type === 'image';

  return (
    <>
    <div className="flex flex-col z-20 relative">
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
            <DynamicIcon name={ICON_KEYS.TOOLBAR_UNDO} icon={Undo} size={18} />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-gray-100 rounded disabled:opacity-50">
            <DynamicIcon name={ICON_KEYS.TOOLBAR_REDO} icon={Redo} size={18} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {isText && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <select 
                value={fontFamily} 
                onChange={handleFontFamily}
                className="h-9 border border-gray-300 rounded px-2 text-sm w-32 focus:outline-none focus:border-indigo-500"
                style={{ fontFamily: fontFamily }}
              >
                {fonts.map(font => (
                  <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>{font.name}</option>
                ))}
              </select>

              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                 <button onClick={() => updateObject('fontSize', fontSize - 1)} className="w-8 h-9 hover:bg-gray-100 flex items-center justify-center border-r border-gray-300">
                    <DynamicIcon name={ICON_KEYS.TOOLBAR_FONT_MINUS} icon={Minus} size={12} />
                 </button>
                 <input 
                    type="number" 
                    value={fontSize} 
                    onChange={handleFontSize}
                    className="w-10 h-9 text-center text-sm focus:outline-none"
                 />
                 <button onClick={() => updateObject('fontSize', fontSize + 1)} className="w-8 h-9 hover:bg-gray-100 flex items-center justify-center border-l border-gray-300">
                    <DynamicIcon name={ICON_KEYS.TOOLBAR_FONT_PLUS} icon={Plus} size={12} />
                 </button>
              </div>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              <button onClick={toggleBold} className={cn("p-2 rounded hover:bg-gray-100", isBold && "bg-gray-200")}>
                <DynamicIcon name={ICON_KEYS.TOOLBAR_BOLD} icon={Bold} size={18} active={isBold} />
              </button>
              <button onClick={toggleItalic} className={cn("p-2 rounded hover:bg-gray-100", isItalic && "bg-gray-200")}>
                <DynamicIcon name={ICON_KEYS.TOOLBAR_ITALIC} icon={Italic} size={18} active={isItalic} />
              </button>
              <button onClick={toggleUnderline} className={cn("p-2 rounded hover:bg-gray-100", isUnderline && "bg-gray-200")}>
                <DynamicIcon name={ICON_KEYS.TOOLBAR_UNDERLINE} icon={Underline} size={18} active={isUnderline} />
              </button>
              
              <div className="w-px h-6 bg-gray-300 mx-1" />

              <button onClick={() => handleTextAlign('left')} className={cn("p-2 rounded hover:bg-gray-100", textAlign === 'left' && "bg-gray-200")}>
                <DynamicIcon name={ICON_KEYS.TOOLBAR_ALIGN_LEFT} icon={AlignLeft} size={18} active={textAlign === 'left'} />
              </button>
              <button onClick={() => handleTextAlign('center')} className={cn("p-2 rounded hover:bg-gray-100", textAlign === 'center' && "bg-gray-200")}>
                <DynamicIcon name={ICON_KEYS.TOOLBAR_ALIGN_CENTER} icon={AlignCenter} size={18} active={textAlign === 'center'} />
              </button>
              <button onClick={() => handleTextAlign('right')} className={cn("p-2 rounded hover:bg-gray-100", textAlign === 'right' && "bg-gray-200")}>
                <DynamicIcon name={ICON_KEYS.TOOLBAR_ALIGN_RIGHT} icon={AlignRight} size={18} active={textAlign === 'right'} />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1" />
              
              <div className="group relative">
                <button className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-gray-600" title="Spacing">
                    <DynamicIcon name={ICON_KEYS.TOOLBAR_SPACING} icon={MoveHorizontal} size={18} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white shadow-xl rounded p-4 border border-gray-100 hidden group-hover:block z-50">
                    <div className="mb-2">
                        <label className="text-xs text-gray-500 block mb-1">Letter Spacing</label>
                        <input 
                            type="range" min="-50" max="500" step="10" 
                            value={charSpacing} onChange={handleCharSpacing}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Line Height</label>
                        <input 
                            type="range" min="0.5" max="3" step="0.1" 
                            value={lineHeight} onChange={handleLineHeight}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                </div>
              </div>
            </div>
          )}

          {isImage && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                    onClick={handleRemoveBackground} 
                    disabled={isRemovingBg}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 text-sm font-medium disabled:opacity-50"
                >
                    {isRemovingBg ? <Loader2 size={16} className="animate-spin" /> : <DynamicIcon name={ICON_KEYS.TOOLBAR_REMOVE_BG} icon={Eraser} size={16} active />}
                    <span>{isRemovingBg ? 'Processing...' : 'Remove BG'}</span>
                </button>
                <button 
                    onClick={initCrop}
                    className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 text-gray-700 rounded text-sm font-medium"
                >
                    <DynamicIcon name={ICON_KEYS.TOOLBAR_CROP} icon={Crop} size={16} />
                    <span>Crop</span>
                </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeObject && (
            <>
              <div className="relative">
                <div 
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: activeObject.fill as string }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute top-full mt-2 right-0 z-50 bg-white shadow-xl rounded p-2 border border-gray-100">
                    <HexColorPicker color={activeObject.fill as string} onChange={changeColor} />
                  </div>
                )}
              </div>
              <button onClick={duplicateActive} className="p-2 hover:bg-gray-100 rounded" title="Duplicate">
                <DynamicIcon name={ICON_KEYS.TOOLBAR_DUPLICATE} icon={Copy} size={18} />
              </button>
              <button onClick={deleteActive} className="p-2 hover:bg-red-50 rounded" title="Delete">
                <DynamicIcon name={ICON_KEYS.TOOLBAR_DELETE} icon={Trash2} size={18} className="text-red-500" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-2 ml-2">
          {supported && (
            <button 
              onClick={startListening} 
              className={`p-2 rounded-full ${isListening ? 'bg-red-100 animate-pulse' : 'hover:bg-gray-100'}`}
              title="Voice Commands"
            >
              {isListening ? (
                <Mic size={18} className="text-red-600" />
              ) : (
                <DynamicIcon name={ICON_KEYS.TOOLBAR_MIC} icon={MicOff} size={18} />
              )}
            </button>
          )}
          <div className="group relative">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 font-medium text-sm">
              <DynamicIcon name={ICON_KEYS.TOOLBAR_DOWNLOAD} icon={Download} size={16} className="text-white" /> 
              Export
            </button>
            <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-50">
              <button onClick={() => exportDesign('png')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">PNG</button>
              <button onClick={() => exportDesign('jpg')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">JPG</button>
              <button onClick={() => exportDesign('pdf')} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <CropModal 
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
    />
    </>
  );
};
