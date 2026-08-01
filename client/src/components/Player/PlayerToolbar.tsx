import React, { useState } from 'react';
import { Play, Pause, Square, Volume2, Download, FileText, Music, Image, Sliders } from 'lucide-react';
import type { ScoreData } from '../../types/index.js';
import { exportToPdf } from '../../export/pdfExporter.js';
import { exportToMidi } from '../../export/midiExporter.js';
import { exportToMusicXML } from '../../export/xmlExporter.js';
import { exportToPng } from '../../export/imageExporter.js';

interface PlayerToolbarProps {
  score: ScoreData | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  speed: number;
  onSpeedChange: (newSpeed: number) => void;
  metronome: boolean;
  onMetronomeToggle: () => void;
}

export const PlayerToolbar: React.FC<PlayerToolbarProps> = ({
  score,
  isPlaying,
  onPlay,
  onPause,
  onStop,
  speed,
  onSpeedChange,
  metronome,
  onMetronomeToggle,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format: 'pdf' | 'midi' | 'xml' | 'png') => {
    if (!score) return;
    setShowExportMenu(false);

    switch (format) {
      case 'pdf':
        await exportToPdf(score);
        break;
      case 'midi':
        exportToMidi(score);
        break;
      case 'xml':
        exportToMusicXML(score);
        break;
      case 'png':
        await exportToPng(score);
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-slate-900/90 dark:bg-slate-900/80 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-slate-800/80 transition-all">
      {/* Controles del Transport (Play / Pause / Stop / Metrónomo) */}
      <div className="flex items-center gap-3">
        {isPlaying ? (
          <button
            onClick={onPause}
            disabled={!score}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <Pause className="w-4 h-4 fill-current" />
            <span>Pausar</span>
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={!score}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Reproducir</span>
          </button>
        )}

        <button
          onClick={onStop}
          disabled={!score}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40 border border-slate-700/60"
          title="Detener y volver al inicio (Espacio)"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Metrónomo acústico */}
        <button
          onClick={onMetronomeToggle}
          disabled={!score}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            metronome
              ? 'bg-indigo-950/90 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/20'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Metrónomo acústico (M)"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Metrónomo</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${metronome ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
            {metronome ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Selector de velocidad de reproducción (x0.5 - x1.5) y Menú de Exportación */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700/80">
          <span className="text-xs text-slate-400 px-2.5 flex items-center gap-1 font-medium">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Vel:
          </span>
          {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => onSpeedChange(rate)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                speed === rate
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Menú Desplegable de Exportación */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            disabled={!score}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Exportar</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl py-1.5 z-30 divide-y divide-slate-700/60">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Formato de Exportación
              </div>
              <div className="py-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/70 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-400" />
                    Partitura PDF (.pdf)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Print</span>
                </button>
                <button
                  onClick={() => handleExport('png')}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/70 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-400" />
                    Imagen Alta Res (.png)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">HD</span>
                </button>
                <button
                  onClick={() => handleExport('midi')}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/70 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-indigo-400" />
                    Audio MIDI (.mid)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DAW</span>
                </button>
                <button
                  onClick={() => handleExport('xml')}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/70 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    MusicXML 3.1 (.musicxml)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">XML</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
