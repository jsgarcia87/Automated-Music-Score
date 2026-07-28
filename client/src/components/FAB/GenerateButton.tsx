import React from 'react';
import { Dices, Loader2 } from 'lucide-react';

interface GenerateButtonProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ onGenerate, isGenerating }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="group relative flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none border border-white/20"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Dices className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        )}
        <span>{isGenerating ? 'Generando...' : 'Generar nueva melodía'}</span>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-white/20 text-xs font-mono">
          G
        </span>
      </button>
    </div>
  );
};
