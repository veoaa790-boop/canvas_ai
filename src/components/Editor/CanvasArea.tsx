import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useEditor } from '../../context/EditorContext';

export const CanvasArea: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setActiveObject, canvasSize } = useEditor();
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);
  const [scale, setScale] = useState(1);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });

    canvasInstanceRef.current = canvasInstance;
    setCanvas(canvasInstance);

    // Event Listeners
    const handleSelection = (e: fabric.IEvent) => {
        setActiveObject(e.selected?.[0] || null);
    };

    canvasInstance.on('selection:created', handleSelection);
    canvasInstance.on('selection:updated', handleSelection);
    canvasInstance.on('selection:cleared', () => setActiveObject(null));

    return () => {
      canvasInstance.dispose();
      canvasInstanceRef.current = null;
    };
  }, [setCanvas, setActiveObject]);

  // Handle Size Updates
  useEffect(() => {
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.setWidth(canvasSize.width);
      canvasInstanceRef.current.setHeight(canvasSize.height);
      canvasInstanceRef.current.renderAll();
    }
  }, [canvasSize]);

  // Handle Responsive Scaling
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const padding = window.innerWidth < 640 ? 16 : window.innerWidth < 1024 ? 24 : 48;
      const availableWidth = containerWidth - padding * 2;
      const availableHeight = containerHeight - padding * 2;

      const scaleX = availableWidth / canvasSize.width;
      const scaleY = availableHeight / canvasSize.height;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasSize]);

  return (
    <div ref={containerRef} className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12 relative">
      <div
        className="shadow-2xl relative transition-all duration-300 ease-in-out bg-white"
        style={{
          width: canvasSize.width * scale,
          height: canvasSize.height * scale,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: canvasSize.width, height: canvasSize.height }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
};
