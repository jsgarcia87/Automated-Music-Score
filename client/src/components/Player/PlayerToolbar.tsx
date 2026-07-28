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
    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
      {/* Controles del Transport (Play / Pause / Stop / Metrónomo) */}
      <div className="flex items-center gap-3">
        {isPlaying ? (
          <button
            onClick={onPause}
            disabled={!score}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all disabled:opacity-40"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pausar
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={!score}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-md transition-all disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-current" />
            Reproducir
          </button>
        )}

        <button
          onClick={onStop}
          disabled={!score}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
          title="Detener y volver al inicio"
        >
          <Square className="w-4 h-4 fill-current" />
        </button>

        {/* Metrónomo opcional */}
        <button
          onClick={onMetronomeToggle}
          disabled={!score}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            metronome
              ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Metrónomo acústico"
        >
          <Volume2 className="w-3.5 h-3.5" />
          Metrónomo {metronome ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Selector de velocidad de reproducción (x0.5 - x1.5) y Menú de Exportación */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Sliders className="w-3 h-3" /> Vel:
          </span>
          {[0.5, 0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => onSpeedChange(rate)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                speed === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-30">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-red-400" />
                Documento PDF (.pdf)
              </button>
              <button
                onClick={() => handleExport('png')}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Image className="w-4 h-4 text-emerald-400" />
                Imagen Alta Res (.png)
              </button>
              <button
                onClick={() => handleExport('midi')}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Music className="w-4 h-4 text-indigo-400" />
                Archivo Audio MIDI (.mid)
              </button>
              <button
                onClick={() => handleExport('xml')}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                MusicXML 3.1 (.musicxml)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
