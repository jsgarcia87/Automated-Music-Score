import React from 'react';
import type { RhythmFigure, ScoreConfig, SymbolsConfig } from '../../types/index.js';
import { Clock, Sparkles, CheckCircle2, Circle } from 'lucide-react';

interface RhythmSymbolsTabProps {
  config: ScoreConfig;
  onChange: (newConfig: Partial<ScoreConfig>) => void;
}

const RHYTHM_ITEMS: { id: RhythmFigure; label: string; icon: string }[] = [
  { id: 'whole', label: 'Redonda (w)', icon: '𝅝' },
  { id: 'half', label: 'Blanca (h)', icon: '𝅗𝅥' },
  { id: 'quarter', label: 'Negra (q)', icon: '𝅘𝅥' },
  { id: 'eighth', label: 'Corchea (8)', icon: '𝅘𝅥𝅮' },
  { id: 'sixteenth', label: 'Semicorchea (16)', icon: '𝅘𝅥𝅯' },
  { id: 'triplet', label: 'Tresillo de corcheas', icon: '3' },
  { id: 'dotted-quarter', label: 'Negra con puntillo', icon: '𝅘𝅥.' },
  { id: 'rest', label: 'Silencios (qr, hr...)', icon: '𝄽' },
];

const SYMBOL_ITEMS: { id: keyof SymbolsConfig; label: string; description: string }[] = [
  { id: 'ties', label: 'Ligaduras', description: 'Une la duración de notas consecutivas de misma altura' },
  { id: 'fermata', label: 'Calderón (Fermata)', description: 'Calderón de reposo al final de frases' },
  { id: 'repeats', label: 'Barras de repetición', description: 'Añade repetición en el primer y último compás' },
  { id: 'accents', label: 'Acentos (>)', description: 'Enfatiza tiempos fuertes del compás' },
  { id: 'staccato', label: 'Staccato (.)', description: 'Articulación breve y picada en notas cortas' },
  { id: 'tenuto', label: 'Tenuto (-)', description: 'Prolonga el valor entero de la nota' },
  { id: 'dynamics', label: 'Dinámicas (p - ff)', description: 'Marcas de expresión de intensidad y volumen' },
];

export const RhythmSymbolsTab: React.FC<RhythmSymbolsTabProps> = ({ config, onChange }) => {
  const handleToggleRhythm = (figure: RhythmFigure) => {
    const exists = config.allowedRhythms.includes(figure);
    if (exists) {
      if (config.allowedRhythms.length === 1) {
        alert('Debes mantener al menos una figura rítmica activa.');
        return;
      }
      onChange({ allowedRhythms: config.allowedRhythms.filter((r) => r !== figure) });
    } else {
      onChange({ allowedRhythms: [...config.allowedRhythms, figure] });
    }
  };

  const handleToggleSymbol = (symbolKey: keyof SymbolsConfig) => {
    onChange({
      symbols: {
        ...config.symbols,
        [symbolKey]: !config.symbols[symbolKey],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Figuras rítmicas permitidas */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-1.5">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>1. Figuras Rítmicas Permitidas</span>
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5">
          El algoritmo construirá compases exactos combinando únicamente las figuras activas:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {RHYTHM_ITEMS.map((item) => {
            const active = config.allowedRhythms.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggleRhythm(item.id)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm scale-[1.02]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02]'
                }`}
              >
                <span className="text-xl w-7 text-center drop-shadow-xs">{item.icon}</span>
                <span className="text-xs truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Símbolos y articulaciones */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>2. Símbolos Musicales &amp; Articulaciones</span>
        </label>

        <div className="space-y-2.5">
          {SYMBOL_ITEMS.map((symbol) => {
            const active = config.symbols[symbol.id];
            return (
              <div
                key={symbol.id}
                onClick={() => handleToggleSymbol(symbol.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent border-indigo-500/80 shadow-xs scale-[1.01]'
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    {symbol.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {symbol.description}
                  </p>
                </div>

                <div className="ml-3 flex-shrink-0">
                  {active ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

