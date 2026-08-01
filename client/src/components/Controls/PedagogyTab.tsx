import React from 'react';
import type { DifficultyLevel, PedagogyMode, ScoreConfig } from '../../types/index.js';
import { Award, BookOpen, Headphones, Sparkles, Sliders, CheckCircle2, Circle } from 'lucide-react';

interface PedagogyTabProps {
  config: ScoreConfig;
  onChange: (newConfig: Partial<ScoreConfig>) => void;
}

const MODES: { id: PedagogyMode; label: string; icon: any; desc: string }[] = [
  { id: 'standard', label: 'Estándar', icon: BookOpen, desc: 'Partitura melódica abierta para práctica general' },
  { id: 'sight-reading', label: 'Lectura a primera vista', icon: Award, desc: 'Optimizado con saltos y retos graduados por nivel' },
  { id: 'dictation', label: 'Dictado Melódico', icon: Headphones, desc: 'Oculta las notas para entrenamiento auditivo' },
];

const DIFFICULTIES: { id: DifficultyLevel; label: string; badge: string }[] = [
  { id: 'beginner', label: 'Principiante', badge: 'Grado 1º-2º' },
  { id: 'intermediate', label: 'Intermedio', badge: 'Grado 3º-4º' },
  { id: 'advanced', label: 'Avanzado', badge: 'Grado 5º-6º+' },
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
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>1. Tipo de Práctica Pedagógica</span>
        </label>
        <div className="space-y-2.5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = ped.mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleUpdatePedagogy({ mode: m.id })}
                className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm font-bold scale-[1.01]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                <div className={`p-2 rounded-xl ${active ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold">{m.label}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{m.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dificultad */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-indigo-500" />
          <span>2. Nivel de Dificultad</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {DIFFICULTIES.map((d) => {
            const active = ped.difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => handleUpdatePedagogy({ difficulty: d.id })}
                className={`py-2.5 px-3.5 rounded-xl border text-xs flex items-center justify-between transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-md shadow-indigo-500/25 scale-[1.01]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                <span>{d.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {d.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intervalos Permitidos */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-purple-500" />
          <span>3. Intervalos Melódicos Permitidos</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ALL_INTERVALS.map((interv) => {
            const active = ped.allowedIntervals.includes(interv);
            return (
              <button
                key={interv}
                onClick={() => handleToggleInterval(interv)}
                className={`py-2 rounded-xl border text-xs font-mono font-extrabold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-b from-indigo-500/15 to-indigo-600/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105'
                }`}
              >
                {interv}ª
              </button>
            );
          })}
        </div>
      </div>

      {/* Salto Máximo & Porcentaje de Movimiento Conjunto */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
            <span>Salto máximo en melodía</span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/50">
              {ped.maxJump}ª
            </span>
          </label>
          <input
            type="range"
            min="2"
            max="8"
            step="1"
            value={ped.maxJump}
            onChange={(e) => handleUpdatePedagogy({ maxJump: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
            <span>Movimiento conjunto</span>
            <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold border border-purple-200/50 dark:border-purple-800/50">
              {ped.stepwisePercentage}%
            </span>
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={ped.stepwisePercentage}
            onChange={(e) => handleUpdatePedagogy({ stepwisePercentage: parseInt(e.target.value, 10) })}
            className="w-full accent-purple-600 cursor-pointer"
          />
        </div>

        <div
          onClick={() => handleUpdatePedagogy({ usePassingNotes: !ped.usePassingNotes })}
          className="flex items-center justify-between p-3.5 rounded-xl border bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Uso de notas de paso y bordados</span>
          </span>
          {ped.usePassingNotes ? (
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          )}
        </div>
      </div>
    </div>
  );
};

