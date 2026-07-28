import React from 'react';
import { X, Keyboard, Play, Dices, Volume2, Undo2, Redo2 } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Espacio (Space)', label: 'Reproducir / Pausar melodía', icon: Play },
    { key: 'G', label: '🎲 Generar nueva melodía', icon: Dices },
    { key: 'M', label: 'Activar / Desactivar Metrónomo', icon: Volume2 },
    { key: 'Ctrl + Z (o ⌘Z)', label: 'Deshacer último cambio de parámetro', icon: Undo2 },
    { key: 'Ctrl + Y (o ⇧⌘Z)', label: 'Rehacer cambio de parámetro', icon: Redo2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo oscurecido */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Atajos de Teclado
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {s.label}
                  </span>
                </div>
                <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm">
                  {s.key}
                </kbd>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
