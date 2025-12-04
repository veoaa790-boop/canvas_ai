import { useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useHistory = (canvas: fabric.Canvas | null) => {
  const [history, setHistory] = useState<string[]>([]);
  const [index, setIndex] = useState(-1);
  const [locked, setLocked] = useState(false);

  const saveHistory = useCallback(() => {
    if (!canvas || locked) return;
    
    const json = JSON.stringify(canvas.toJSON());
    
    // If we are in the middle of the history stack, remove future states
    if (index < history.length - 1) {
      const newHistory = history.slice(0, index + 1);
      newHistory.push(json);
      setHistory(newHistory);
      setIndex(newHistory.length - 1);
    } else {
      setHistory(prev => [...prev, json]);
      setIndex(prev => prev + 1);
    }
  }, [canvas, history, index, locked]);

  const undo = useCallback(() => {
    if (!canvas || index <= 0) return;
    setLocked(true);
    const prevState = history[index - 1];
    canvas.loadFromJSON(JSON.parse(prevState), () => {
      canvas.renderAll();
      setIndex(index - 1);
      setLocked(false);
    });
  }, [canvas, index, history]);

  const redo = useCallback(() => {
    if (!canvas || index >= history.length - 1) return;
    setLocked(true);
    const nextState = history[index + 1];
    canvas.loadFromJSON(JSON.parse(nextState), () => {
      canvas.renderAll();
      setIndex(index + 1);
      setLocked(false);
    });
  }, [canvas, index, history]);

  return { saveHistory, undo, redo, canUndo: index > 0, canRedo: index < history.length - 1 };
};
