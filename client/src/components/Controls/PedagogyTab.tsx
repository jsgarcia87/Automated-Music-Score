import React from 'react';
import type { DifficultyLevel, PedagogyMode, ScoreConfig } from '../../types/index.js';
import { Award, BookOpen, Headphones } from 'lucide-react';

interface PedagogyTabProps {
  config: ScoreConfig;
  onChange: (newConfig: Partial<ScoreConfig>) => void;
}

const MODES: { id: PedagogyMode; label: string; icon: any; desc: string }[] = [
  { id: 'standard', label: 'Estándar', icon: BookOpen, desc: 'Partitura melódica abierta para práctica general' },
  { id: 'sight-reading', label: 'Lectura a primera vista', icon: Award, desc: 'Optimizado con saltos y retos graduados por nivel' },
  { id: 'dictation', label: 'Dictado Melódico', icon: Headphones, desc: 'Oculta las notas para entrenamiento auditivo' },
];

const DIFFICULTIES: { id: DifficultyLevel; label: string }[] = [
  { id: 'beginner', label: 'Principiante (Grado 1º-2º)' },
  { id: 'intermediate', label: 'Intermedio (Grado 3º-4º)' },
  { id: 'advanced', label: 'Avanzado (Grado 5º-6º+)' },
];

const ALL_INTERVALS = [2, 3, 4, 5, 6, 7, 8];

export const PedagogyTab: React.FC<PedagogyTabProps> = ({ config, onChange }) => {
  const ped = config.pedagogy;

  const handleUpdatePedagogy = (partial: Partial<typeof ped>) => {
    onChange({
      pedagogy: { ...ped, ...partial },
    });
  };

  const handleToggleInterval = (interval: number) => {
    const exists = ped.allowedIntervals.includes(interval);
    if (exists) {
      if (ped.allowedIntervals.length === 1) {
        alert('Debes permitir al menos un intervalo.');
        return;
      }
      handleUpdatePedagogy({
        allowedIntervals: ped.allowedIntervals.filter((i) => i !== interval),
      });
    } else {
      handleUpdatePedagogy({
        allowedIntervals: [...ped.allowedIntervals, interval].sort((a, b) => a - b),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de Modo de Práctica */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          1. Tipo de Práctica Pedagógica
        </label>
        <div className="space-y-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = ped.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleUpdatePedagogy({ mode: m.id })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/60 dark:border-amber-500 dark:text-amber-200 shadow-sm font-semibold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-xs font-bold">{m.label}</h4>
                  <p className="text-[11px] opacity-80">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dificultad */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          2. Nivel de Dificultad
        </label>
        <div className="grid grid-cols-1 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              onClick={() => handleUpdatePedagogy({ difficulty: d.id })}
              className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                ped.difficulty === d.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intervalos Permitidos */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          3. Intervalos Melódicos Permitidos
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ALL_INTERVALS.map((interv) => {
            const active = ped.allowedIntervals.includes(interv);
            return (
              <button
                key={interv}
                onClick={() => handleToggleInterval(interv)}
                className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                  active
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-400 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300'
                }`}
              >
                {interv}ª
              </button>
            );
          })}
        </div>
      </div>

      {/* Salto Máximo & Porcentaje de Movimiento Conjunto */}
      <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Salto máximo en la melodía: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{ped.maxJump}ª</span>
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={ped.maxJump}
            onChange={(e) => handleUpdatePedagogy({ maxJump: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Movimiento conjunto (grados contiguos): <span className="text-indigo-600 dark:text-indigo-400 font-mono">{ped.stepwisePercentage}%</span>
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={ped.stepwisePercentage}
            onChange={(e) => handleUpdatePedagogy({ stepwisePercentage: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <label
          onClick={() => handleUpdatePedagogy({ usePassingNotes: !ped.usePassingNotes })}
          className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <span className="text-xs font-semibold text-slate-800 dark:text-white">
            Uso de notas de paso y bordados
          </span>
          <input
            type="checkbox"
            checked={ped.usePassingNotes}
            onChange={() => {}}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </label>
      </div>
    </div>
  );
};
