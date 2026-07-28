import React from 'react';
import type { ClefType, KeySignature, TimeSignature, ScoreConfig } from '../../types/index.js';
import { Lock, Unlock } from 'lucide-react';

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
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Clave
          </label>
          <button
            onClick={() => onToggleLock('clef')}
            className={`p-1 rounded text-xs transition-colors ${
              lockedParams.has('clef') ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Bloquear clave al generar"
          >
            {lockedParams.has('clef') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CLEFS.map((c) => (
            <button
              key={c.value}
              onClick={() => onChange({ clef: c.value })}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                config.clef === c.value
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-400 dark:text-indigo-300 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span className="text-xl leading-none">{c.icon}</span>
              <span className="text-xs mt-1">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selector de Tonalidad (Mayores y Menores) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Tonalidad &amp; Armadura
          </label>
          <button
            onClick={() => onToggleLock('keySignature')}
            className={`p-1 rounded text-xs transition-colors ${
              lockedParams.has('keySignature') ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Bloquear tonalidad"
          >
            {lockedParams.has('keySignature') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Mayores</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {MAJOR_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => onChange({ keySignature: k })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    config.keySignature === k
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Menores</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {MINOR_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => onChange({ keySignature: k })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    config.keySignature === k
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compás (2/4 a 12/8) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Compás
          </label>
          <button
            onClick={() => onToggleLock('timeSignature')}
            className={`p-1 rounded text-xs transition-colors ${
              lockedParams.has('timeSignature') ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {lockedParams.has('timeSignature') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {METERS.map((m) => (
            <button
              key={m}
              onClick={() => onChange({ timeSignature: m })}
              className={`py-2 px-3 rounded-xl border text-sm font-mono transition-all ${
                config.timeSignature === m
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-400 dark:text-indigo-300 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tempo y Compases */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Tempo (BPM): <span className="text-indigo-600 dark:text-indigo-400 font-mono">{config.bpm}</span>
          </label>
          <input
            type="range"
            min="40"
            max="220"
            step="4"
            value={config.bpm}
            onChange={(e) => onChange({ bpm: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Nº Compases: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{config.numMeasures}</span>
          </label>
          <input
            type="range"
            min="2"
            max="16"
            step="2"
            value={config.numMeasures}
            onChange={(e) => onChange({ numMeasures: parseInt(e.target.value, 10) })}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      {/* Nota Inicial y Nota Final (Opcional) */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700/60">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Nota Inicial (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: C4, G4..."
            value={config.startPitch || ''}
            onChange={(e) => onChange({ startPitch: e.target.value.trim() || undefined })}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Nota Final (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: C4, C5..."
            value={config.endPitch || ''}
            onChange={(e) => onChange({ endPitch: e.target.value.trim() || undefined })}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
};
