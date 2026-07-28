import React from 'react';
import type { ScoreConfig } from '../../types/index.js';
import { Ban } from 'lucide-react';

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
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
          1. Tesitura (Rango Permitido)
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Nota más grave (Mín)
            </label>
            <input
              type="text"
              value={config.minPitch}
              onChange={(e) => onChange({ minPitch: e.target.value.trim() })}
              placeholder="C4"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm"
            />
            <span className="text-[10px] text-slate-400">Ejemplo: C3, G3, C4</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Nota más aguda (Máx)
            </label>
            <input
              type="text"
              value={config.maxPitch}
              onChange={(e) => onChange({ maxPitch: e.target.value.trim() })}
              placeholder="G5"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm"
            />
            <span className="text-[10px] text-slate-400">Ejemplo: E5, G5, C6</span>
          </div>
        </div>
      </div>

      {/* Exclusión de Notas */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Ban className="w-4 h-4 text-red-500" />
            2. Excluir Notas / Alteraciones
          </label>
          {config.excludedPitches.length > 0 && (
            <button
              onClick={() => onChange({ excludedPitches: [] })}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Limpiar todas ({config.excludedPitches.length})
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Haz clic en cualquier nota o alteración cromática que desees excluir de la melodía generada:
        </p>

        <div className="grid grid-cols-4 gap-2">
          {COMMON_PITCH_CLASSES.map((pc) => {
            const isExcluded = config.excludedPitches.includes(pc);
            return (
              <button
                key={pc}
                onClick={() => handleToggleExclude(pc)}
                className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                  isExcluded
                    ? 'bg-red-50 border-red-500 text-red-700 dark:bg-red-950/70 dark:border-red-400 dark:text-red-300 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
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
