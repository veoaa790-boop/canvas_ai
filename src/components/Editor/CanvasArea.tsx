import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { useEditor } from '../../context/EditorContext';

export const CanvasArea: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, setActiveObject, canvasSize } = useEditor();
  const canvasInstanceRef = useRef<fabric.Canvas | null>(null);

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
  }, [setCanvas, setActiveObject]); // Run once on mount

  // Handle Size Updates
  useEffect(() => {
    if (canvasInstanceRef.current) {
      canvasInstanceRef.current.setWidth(canvasSize.width);
      canvasInstanceRef.current.setHeight(canvasSize.height);
      canvasInstanceRef.current.renderAll();
    }
  }, [canvasSize]);

  return (
    <div ref={containerRef} className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-12 relative">
      <div className="shadow-2xl relative transition-all duration-300 ease-in-out" style={{ width: canvasSize.width, height: canvasSize.height }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
