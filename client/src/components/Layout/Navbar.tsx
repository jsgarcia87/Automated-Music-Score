import React from 'react';
import { Music, Moon, Sun, History, Keyboard, Award, Sparkles } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenShortcutsModal: () => void;
  isPedagogyActive: boolean;
  isComposerMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenHistory,
  onOpenShortcutsModal,
  isPedagogyActive,
  isComposerMode,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo y Marca */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-300 bg-clip-text text-transparent">
                Cadenza Studio
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
                Pro
              </span>
              {isPedagogyActive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modo Ejercicios</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                </span>
              )}
              {isComposerMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-800/80 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
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

