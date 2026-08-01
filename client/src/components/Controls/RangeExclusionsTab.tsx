import React from 'react';
import type { ScoreConfig } from '../../types/index.js';
import { Ban, SlidersHorizontal } from 'lucide-react';

interface RangeExclusionsTabProps {
  config: ScoreConfig;
  onChange: (newConfig: Partial<ScoreConfig>) => void;
}

const COMMON_PITCH_CLASSES = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E',
  'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'Bb', 'B'
];

export const RangeExclusionsTab: React.FC<RangeExclusionsTabProps> = ({ config, onChange }) => {
  const handleToggleExclude = (pitchClass: string) => {
    const current = new Set(config.excludedPitches);
    if (current.has(pitchClass)) {
      current.delete(pitchClass);
    } else {
      current.add(pitchClass);
    }
    onChange({ excludedPitches: Array.from(current) });
  };

  return (
    <div className="space-y-6">
      {/* Selector de Rango / Tesitura */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>1. Tesitura (Rango Permitido)</span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Nota más grave (Mín)
            </label>
            <input
              type="text"
              value={config.minPitch}
              onChange={(e) => onChange({ minPitch: e.target.value.trim() })}
              placeholder="C4"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Ejemplo: C3, G3, C4</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Nota más aguda (Máx)
            </label>
            <input
              type="text"
              value={config.maxPitch}
              onChange={(e) => onChange({ maxPitch: e.target.value.trim() })}
              placeholder="G5"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Ejemplo: E5, G5, C6</span>
          </div>
        </div>
      </div>

      {/* Exclusión de Notas */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Ban className="w-4 h-4 text-rose-500" />
            <span>2. Excluir Notas / Alteraciones</span>
          </label>
          {config.excludedPitches.length > 0 && (
            <button
              onClick={() => onChange({ excludedPitches: [] })}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline transition-all"
            >
              Limpiar todas ({config.excludedPitches.length})
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
          Haz clic en cualquier nota o alteración cromática que desees excluir de la melodía generada:
        </p>

        <div className="grid grid-cols-4 gap-2">
          {COMMON_PITCH_CLASSES.map((pc) => {
            const isExcluded = config.excludedPitches.includes(pc);
            return (
              <button
                key={pc}
                onClick={() => handleToggleExclude(pc)}
                className={`py-2 px-1.5 rounded-xl border text-xs font-mono font-extrabold transition-all duration-200 ${
                  isExcluded
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25 scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02]'
                }`}
              >
                {isExcluded ? `🚫 ${pc}` : pc}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

