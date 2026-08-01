import React from 'react';
import type { ClefType, KeySignature, TimeSignature, ScoreConfig } from '../../types/index.js';
import { Lock, Unlock, Music4, Compass, Gauge, Hash, Sparkles } from 'lucide-react';

interface MusicalConfigTabProps {
  config: ScoreConfig;
  onChange: (newConfig: Partial<ScoreConfig>) => void;
  lockedParams: Set<string>;
  onToggleLock: (paramKey: string) => void;
}

const CLEFS: { value: ClefType; label: string; icon: string }[] = [
  { value: 'treble', label: 'Clave de Sol', icon: '𝄞' },
  { value: 'bass', label: 'Clave de Fa', icon: '𝄢' },
  { value: 'alto', label: 'Clave de Do', icon: '𝄡' },
];

const MAJOR_KEYS: KeySignature[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
const MINOR_KEYS: KeySignature[] = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
const METERS: TimeSignature[] = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8'];

export const MusicalConfigTab: React.FC<MusicalConfigTabProps> = ({
  config,
  onChange,
  lockedParams,
  onToggleLock,
}) => {
  return (
    <div className="space-y-6">
      {/* Selector de Clave */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Music4 className="w-4 h-4 text-indigo-500" />
            <span>1. Clave Musical</span>
          </label>
          <button
            onClick={() => onToggleLock('clef')}
            className={`p-1.5 rounded-xl text-xs transition-all flex items-center gap-1 ${
              lockedParams.has('clef')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Bloquear clave al generar"
          >
            {lockedParams.has('clef') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {CLEFS.map((c) => {
            const isActive = config.clef === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onChange({ clef: c.value })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-indigo-500/15 to-indigo-600/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-md shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02]'
                }`}
              >
                <span className="text-2xl leading-none drop-shadow-sm">{c.icon}</span>
                <span className="text-xs mt-1.5">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Tonalidad (Mayores y Menores) */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-500" />
            <span>2. Tonalidad &amp; Armadura</span>
          </label>
          <button
            onClick={() => onToggleLock('keySignature')}
            className={`p-1.5 rounded-xl text-xs transition-all flex items-center gap-1 ${
              lockedParams.has('keySignature')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Bloquear tonalidad"
          >
            {lockedParams.has('keySignature') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
              Modo Mayor
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MAJOR_KEYS.map((k) => {
                const isActive = config.keySignature === k;
                return (
                  <button
                    key={k}
                    onClick={() => onChange({ keySignature: k })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-500/25 scale-105'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">
              Modo Menor
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MINOR_KEYS.map((k) => {
                const isActive = config.keySignature === k;
                return (
                  <button
                    key={k}
                    onClick={() => onChange({ keySignature: k })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white font-extrabold shadow-md shadow-purple-500/25 scale-105'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Compás (2/4 a 12/8) */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-500" />
            <span>3. Compás &amp; Métrica</span>
          </label>
          <button
            onClick={() => onToggleLock('timeSignature')}
            className={`p-1.5 rounded-xl text-xs transition-all flex items-center gap-1 ${
              lockedParams.has('timeSignature')
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lockedParams.has('timeSignature') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {METERS.map((m) => {
            const isActive = config.timeSignature === m;
            return (
              <button
                key={m}
                onClick={() => onChange({ timeSignature: m })}
                className={`py-2.5 px-3 rounded-xl border text-sm font-mono transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-indigo-500/15 to-indigo-600/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-md shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02]'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tempo y Compases */}
      <div className="grid grid-cols-2 gap-4 bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tempo</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/50">
              {config.bpm} BPM
            </span>
          </label>
          <input
            type="range"
            min="40"
            max="220"
            step="4"
            value={config.bpm}
            onChange={(e) => onChange({ bpm: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Compases</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-200/50 dark:border-amber-800/50">
              {config.numMeasures}
            </span>
          </label>
          <input
            type="range"
            min="2"
            max="16"
            step="2"
            value={config.numMeasures}
            onChange={(e) => onChange({ numMeasures: parseInt(e.target.value, 10) })}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Nota Inicial y Nota Final (Opcional) */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Nota Inicial <span className="text-[10px] text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Ej: C4, G4..."
            value={config.startPitch || ''}
            onChange={(e) => onChange({ startPitch: e.target.value.trim() || undefined })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Nota Final <span className="text-[10px] text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder="Ej: C4, C5..."
            value={config.endPitch || ''}
            onChange={(e) => onChange({ endPitch: e.target.value.trim() || undefined })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

