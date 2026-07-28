import React from 'react';
import type { RhythmFigure, ScoreConfig, SymbolsConfig } from '../../types/index.js';

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
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          1. Figuras Rítmicas Permitidas
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          El algoritmo construirá compases exactos combinando únicamente las figuras activas:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {RHYTHM_ITEMS.map((item) => {
            const active = config.allowedRhythms.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggleRhythm(item.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  active
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-400 dark:text-indigo-300 font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className="text-lg w-6 text-center">{item.icon}</span>
                <span className="text-xs truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Símbolos y articulaciones */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/60">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
          2. Símbolos Musicales &amp; Articulaciones
        </label>

        <div className="space-y-2">
          {SYMBOL_ITEMS.map((symbol) => {
            const active = config.symbols[symbol.id];
            return (
              <label
                key={symbol.id}
                onClick={() => handleToggleSymbol(symbol.id)}
                className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  active
                    ? 'bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    {symbol.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {symbol.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => {}} // Manejado por onClick en label
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
