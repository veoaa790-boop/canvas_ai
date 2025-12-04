import React, { useEffect, useState } from 'react';
import { useEditor } from '../../../context/EditorContext';
import { Eye, EyeOff, Lock, Unlock, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { fabric } from 'fabric';

interface LayersPanelProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ onClose, isMobile = false }) => {
  const { canvas, activeObject, setActiveObject } = useEditor();
  const [layers, setLayers] = useState<fabric.Object[]>([]);
  const [_, setTick] = useState(0);

  useEffect(() => {
    if (!canvas) return;

    const updateLayers = () => {
      setLayers([...canvas.getObjects()].reverse());
      setTick(t => t + 1);
    };

    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);

    updateLayers();

    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const toggleVisible = (obj: fabric.Object) => {
    obj.visible = !obj.visible;
    canvas?.renderAll();
    setTick(t => t + 1);
  };

  const toggleLock = (obj: fabric.Object) => {
    obj.lockMovementX = !obj.lockMovementX;
    obj.lockMovementY = !obj.lockMovementY;
    obj.lockRotation = !obj.lockRotation;
    obj.lockScalingX = !obj.lockScalingX;
    obj.lockScalingY = !obj.lockScalingY;
    canvas?.renderAll();
    setTick(t => t + 1);
  };

  const deleteLayer = (obj: fabric.Object) => {
    canvas?.remove(obj);
    canvas?.renderAll();
  };

  const selectLayer = (obj: fabric.Object) => {
    canvas?.setActiveObject(obj);
    canvas?.renderAll();
    setActiveObject(obj);
  };

  const moveLayer = (obj: fabric.Object, direction: 'up' | 'down') => {
    if (direction === 'up') obj.bringForward();
    else obj.sendBackwards();
    canvas?.renderAll();
    setLayers([...(canvas?.getObjects() || [])].reverse());
  };

  return (
    <div className="w-64 sm:w-72 lg:w-80 bg-white border-l border-gray-200 flex flex-col h-full max-h-screen">
      <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <span className="font-semibold text-sm text-gray-700">Layers</span>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {layers.map((obj, i) => {
            const isLocked = obj.lockMovementX;
            const isSelected = activeObject === obj;

            return (
                <div
                    key={i}
                    className={`flex items-center gap-1 sm:gap-2 p-2 rounded border text-xs sm:text-sm ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}`}
                    onClick={() => selectLayer(obj)}
                >
                    <div className="flex-1 truncate font-medium text-gray-600 min-w-0">
                        {obj.type} {i}
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-gray-400 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); moveLayer(obj, 'up'); }} className="hover:text-gray-700 p-0.5 sm:p-1"><ChevronUp size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveLayer(obj, 'down'); }} className="hover:text-gray-700 p-0.5 sm:p-1"><ChevronDown size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); toggleVisible(obj); }} className="hover:text-gray-700 p-0.5 sm:p-1">
                            {obj.visible ? <Eye size={12} className="sm:w-3.5 sm:h-3.5" /> : <EyeOff size={12} className="sm:w-3.5 sm:h-3.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleLock(obj); }} className="hover:text-gray-700 p-0.5 sm:p-1">
                            {isLocked ? <Lock size={12} className="sm:w-3.5 sm:h-3.5" /> : <Unlock size={12} className="sm:w-3.5 sm:h-3.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteLayer(obj); }} className="hover:text-red-500 p-0.5 sm:p-1">
                            <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                    </div>
                </div>
            );
        })}
        {layers.length === 0 && (
            <div className="text-center text-gray-400 text-xs py-4">No layers yet</div>
        )}
      </div>
    </div>
  );
};
