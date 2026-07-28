import { useState, useCallback } from 'react';

export function useUndoRedo<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prevHistory) => {
      const current = prevHistory[currentIndex];
      const resolved = typeof newState === 'function'
        ? (newState as (prev: T) => T)(current)
        : newState;

      const newHistory = prevHistory.slice(0, currentIndex + 1);
      return [...newHistory, resolved];
    });
    setCurrentIndex((idx) => idx + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex((idx) => Math.max(0, idx - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((idx) => Math.min(history.length - 1, idx + 1));
  }, [history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return { state, set, undo, redo, canUndo, canRedo };
}
