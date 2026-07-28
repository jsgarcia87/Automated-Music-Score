import React, { useState } from 'react';
import { Eye, EyeOff, Volume2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DictationOverlayProps {
  isDictationMode: boolean;
  onPlayScore: () => void;
  children: React.ReactNode;
}

export const DictationOverlay: React.FC<DictationOverlayProps> = ({
  isDictationMode,
  onPlayScore,
  children,
}) => {
  const [isHidden, setIsHidden] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isDictationMode) {
    return <>{children}</>;
  }

  const handleReveal = () => {
    setIsHidden(false);
  };

  const handleHide = () => {
    setIsHidden(true);
    setIsCompleted(false);
  };

  const handleSuccess = () => {
    setIsCompleted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20">
      {/* Banner de Modo Dictado Melódico */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-300" />
          <span>Modo Dictado Melódico — Escucha la melodía y escríbela antes de revelar la solución</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayScore}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            Escuchar de nuevo
          </button>
          {isHidden ? (
            <button
              onClick={handleReveal}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white text-indigo-700 hover:bg-slate-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Revelar partitura
            </button>
          ) : (
            <button
              onClick={handleHide}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Ocultar de nuevo
            </button>
          )}
        </div>
      </div>

      {/* Área del lienzo de partitura con difuminado si está oculto */}
      <div className="relative w-full">
        <div className={`transition-all duration-300 ${isHidden ? 'blur-xl select-none pointer-events-none opacity-40' : ''}`}>
          {children}
        </div>

        {isHidden && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/60 backdrop-blur-sm z-10">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-3">
                <Volume2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                Partitura oculta para dictado
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Escucha la melodía tantas veces como necesites y anótala en tu papel o cuaderno de música.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onPlayScore}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  ▶ Reproducir audio
                </button>
                <button
                  onClick={handleReveal}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all"
                >
                  Revelar solución
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isHidden && (
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ¿Has completado el dictado con éxito?
          </span>
          <button
            onClick={handleSuccess}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            {isCompleted ? '🎉 ¡Enhorabuena! Logrado' : '✔ Marcar como logrado'}
          </button>
        </div>
      )}
    </div>
  );
};
