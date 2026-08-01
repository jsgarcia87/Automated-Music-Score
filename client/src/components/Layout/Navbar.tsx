import React from 'react';
import { Music, Moon, Sun, History, Keyboard, Award, Sparkles, Wand2 } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenShortcutsModal: () => void;
  isPedagogyActive: boolean;
  isComposerMode?: boolean;
  onOpenGestureModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenHistory,
  onOpenShortcutsModal,
  isPedagogyActive,
  isComposerMode,
  onOpenGestureModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y Marca */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                CADENZA
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
                STUDIO PRO
              </span>
              {isPedagogyActive && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 shadow-2xs animate-pulse">
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>Modo Ejercicios</span>
                </span>
              )}
              {isComposerMode && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300/80 dark:border-purple-700/80 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Estudio Propio</span>
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Generador Inteligente de Partituras &amp; Composición Algorítmica
            </p>
          </div>
        </div>

        {/* Acciones del Navbar */}
        <div className="flex items-center gap-2">
          {onOpenGestureModal && (
            <button
              onClick={onOpenGestureModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-500/20 border border-white/20 animate-pulse"
              title="Abrir Synth &amp; Theremin Gestual (Webcam IA)"
            >
              <Wand2 className="w-4 h-4 text-pink-200" />
              <span>✨ Synth Gestual</span>
            </button>
          )}

          <button
            onClick={onOpenShortcutsModal}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Atajos de teclado ( ? )"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 hover:bg-indigo-600 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md shadow-slate-900/10 dark:shadow-slate-950/30 border border-slate-700/50"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Historial &amp; Guardados</span>
          </button>
        </div>
      </div>
    </header>
  );
};
