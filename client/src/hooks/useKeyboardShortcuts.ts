import { useEffect } from 'react';

interface ShortcutHandlers {
  onPlayPause: () => void;
  onGenerate: () => void;
  onToggleMetronome: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onGenerate,
  onToggleMetronome,
  onUndo,
  onRedo,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input, textarea o contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        onGenerate();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onToggleMetronome();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          onRedo?.();
        } else {
          e.preventDefault();
          onUndo?.();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        onRedo?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, onGenerate, onToggleMetronome, onUndo, onRedo]);
}
