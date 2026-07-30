import React, { useEffect, useRef, useState } from 'react';
import Vex from 'vexflow';
import type { ScoreData, NoteEvent } from '../../types/index.js';
import { ZoomIn, ZoomOut, Maximize2, FileText, Share2, Check } from 'lucide-react';

interface VexScoreCanvasProps {
  score: ScoreData | null;
  activeNoteId?: string | null;
  selectedNoteId?: string | null;
  onSelectNote?: (noteId: string, measureIndex: number, noteIndex: number) => void;
  darkMode?: boolean;
  paperMode?: boolean;
  onShareLink?: () => void;
}

const { Renderer, Stave, StaveNote, Accidental, Formatter, Articulation, StaveTie, Barline } = (Vex as any).Flow || Vex;

export const VexScoreCanvas: React.FC<VexScoreCanvasProps> = ({
  score,
  activeNoteId,
  selectedNoteId,
  onSelectNote,
  darkMode = false,
  paperMode = true,
  onShareLink,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [copiedLink, setCopiedLink] = useState(false);
  const noteElementsMapRef = useRef<Record<string, Element>>({});

  // Renderizar la partitura cada vez que cambie el score o el zoom
  useEffect(() => {
    if (!containerRef.current || !score) return;

    const container = containerRef.current;
    container.innerHTML = '';
    noteElementsMapRef.current = {};

    const containerWidth = Math.max(container.clientWidth || 800, 310);
    const scale = zoom;
    const measuresPerSystem = containerWidth > 900 ? 4 : containerWidth > 620 ? 3 : containerWidth > 420 ? 2 : 1;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    const systemsCount = Math.ceil(score.measures.length / measuresPerSystem);
    const systemHeight = 160;
    const canvasWidth = Math.max((containerWidth - 20) * scale, 300);
    const canvasHeight = Math.max(systemsCount * systemHeight + 100, 260) * scale;

    renderer.resize(canvasWidth, canvasHeight);
    const context = renderer.getContext();
    context.scale(scale, scale);

    // Color principal para VexFlow (Blanco en oscuro, Negro en claro)
    const textColor = darkMode && !paperMode ? '#e2e8f0' : '#1e293b';
    context.setFillStyle(textColor);
    context.setStrokeStyle(textColor);

    const marginLeft = 30;
    const firstMeasureWidthExtra = 70; // Espacio extra para clave y armadura
    const availableWidth = (containerWidth - 60) / scale;

    let x = marginLeft;
    let y = 40;
    const allTies: { firstNote: any; secondNote: any }[] = [];
    let prevStaveNote: any = null;
    let prevEvent: NoteEvent | null = null;

    score.measures.forEach((measure, idx) => {
      const isFirstOfSystem = idx % measuresPerSystem === 0;

      if (isFirstOfSystem && idx > 0) {
        x = marginLeft;
        y += systemHeight;
      }

      // Calcular anchura proporcional
      const measureWidth = isFirstOfSystem
        ? (availableWidth / measuresPerSystem) + firstMeasureWidthExtra
        : availableWidth / measuresPerSystem;

      const stave = new Stave(x, y, measureWidth);

      // Estilos del pentagrama
      stave.setStyle({ fillStyle: textColor, strokeStyle: textColor });

      // Añadir Clave, Tonalidad y Compás en el primer compás
      if (idx === 0) {
        stave.addClef(score.config.clef);
        stave.addKeySignature(score.config.keySignature);
        stave.addTimeSignature(score.config.timeSignature);
      } else if (isFirstOfSystem) {
        stave.addClef(score.config.clef);
        stave.addKeySignature(score.config.keySignature);
      }

      // Añadir líneas de repetición si corresponden
      if (measure.isRepeatStart) {
        stave.setBegBarType(Barline.type.REPEAT_BEGIN);
      }
      if (measure.isRepeatEnd) {
        stave.setEndBarType(Barline.type.REPEAT_END);
      }

      stave.setContext(context).draw();

      // Construir notas del compás
      const staveNotes: any[] = [];

      measure.notes.forEach((noteEvent) => {
        let keys: string[] = ['b/4']; // Valor por defecto si es silencio
        if (!noteEvent.isRest) {
          const step = noteEvent.step.toLowerCase();
          const oct = noteEvent.octave;
          keys = [`${step}/${oct}`];
        }

        const staveNote = new StaveNote({
          keys: keys,
          duration: noteEvent.vexDuration,
          clef: score.config.clef,
          auto_stem: true,
        });

        staveNote.setStyle({ fillStyle: textColor, strokeStyle: textColor });

        // Añadir alteración accidental si es necesario
        if (!noteEvent.isRest && Boolean(noteEvent.accidental)) {
          staveNote.addModifier(new Accidental(noteEvent.accidental!), 0);
        }

        // Articulaciones musicales (Staccato, Tenuto, Acento, Calderón)
        if (noteEvent.staccato) {
          staveNote.addModifier(new Articulation('a.').setPosition(3), 0);
        }
        if (noteEvent.tenuto) {
          staveNote.addModifier(new Articulation('a-').setPosition(3), 0);
        }
        if (noteEvent.accent) {
          staveNote.addModifier(new Articulation('a>').setPosition(3), 0);
        }
        if (noteEvent.fermata) {
          staveNote.addModifier(new Articulation('a@a').setPosition(3), 0);
        }

        staveNotes.push(staveNote);

        // Guardar referencia para ligaduras
        if (prevEvent && prevEvent.tieToNext && prevStaveNote && !noteEvent.isRest) {
          allTies.push({ firstNote: prevStaveNote, secondNote: staveNote });
        }

        prevStaveNote = staveNote;
        prevEvent = noteEvent;
      });

      // Formatear y dibujar las notas dentro de este compás
      if (staveNotes.length > 0) {
        const noteAreaWidth = measureWidth - (isFirstOfSystem && idx === 0 ? 110 : 35);
        Formatter.FormatAndDraw(context, stave, staveNotes, Math.max(noteAreaWidth, 80));

        // Asignar los elementos SVG generados al mapa por ID para resaltado de nota
        measure.notes.forEach((ev, nIdx) => {
          const sNote = staveNotes[nIdx];
          const el = sNote?.getAttribute('el') || sNote?.getSVGElement?.();
          if (el) {
            noteElementsMapRef.current[ev.id] = el;
            if (onSelectNote) {
              const svgEl = el as HTMLElement;
              svgEl.style.cursor = 'pointer';
              svgEl.onclick = (e) => {
                e.stopPropagation();
                onSelectNote(ev.id, idx, nIdx);
              };
            }
          }
        });
      }

      x += measureWidth;
    });

    // Dibujar ligaduras
    allTies.forEach((tie) => {
      const staveTie = new StaveTie({
        first_note: tie.firstNote,
        last_note: tie.secondNote,
        first_indices: [0],
        last_indices: [0],
      });
      staveTie.setContext(context).draw();
    });
  }, [score, zoom, darkMode, paperMode, onSelectNote]);

  // Resaltado visual en tiempo real de la nota que está sonando o seleccionada
  useEffect(() => {
    const activeColor = '#6366f1'; // Índigo neón (reproduciendo)
    const selectedColor = '#f59e0b'; // Ámbar brillante (seleccionada para editar)
    const normalColor = darkMode && !paperMode ? '#e2e8f0' : '#1e293b';

    Object.entries(noteElementsMapRef.current).forEach(([id, element]) => {
      if (!element) return;
      const svgEl = element as HTMLElement;
      if (id === activeNoteId) {
        svgEl.style.fill = activeColor;
        svgEl.style.stroke = activeColor;
        svgEl.style.transition = 'all 0.1s ease';
        svgEl.style.filter = 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.6))';
      } else if (id === selectedNoteId) {
        svgEl.style.fill = selectedColor;
        svgEl.style.stroke = selectedColor;
        svgEl.style.transition = 'all 0.15s ease';
        svgEl.style.filter = 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.85))';
      } else {
        svgEl.style.fill = normalColor;
        svgEl.style.stroke = normalColor;
        svgEl.style.filter = 'none';
      }
    });
  }, [activeNoteId, selectedNoteId, darkMode, paperMode]);

  const handleShare = () => {
    if (onShareLink) {
      onShareLink();
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 p-8 text-center">
        <FileText className="w-12 h-12 text-slate-400 mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Ninguna partitura generada
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Ajusta los parámetros musicales en el panel izquierdo y pulsa &quot;Generar nueva melodía&quot; para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Cabecera de la Partitura (Título, Opus, Semilla y Botones de acción) */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 rounded-t-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {score.title}
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Seed: {score.seed}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clave de {score.config.clef === 'treble' ? 'Sol' : score.config.clef === 'bass' ? 'Fa' : 'Do'} • Compás {score.config.timeSignature} • {score.config.bpm} BPM • {score.config.numMeasures} compases
          </p>
        </div>

        {/* Barra de Herramientas del Lienzo (Zoom + Compartir enlace) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-slate-700 dark:text-slate-300 font-mono">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1.0)}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
              title="Tamaño original"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {onShareLink && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              {copiedLink ? '¡Enlace copiado!' : 'Compartir'}
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del Lienzo de Partitura (Estilo Papel Musical Premium o Modo Oscuro) */}
      <div
        className={`w-full overflow-x-auto p-2 sm:p-6 md:p-8 flex justify-center transition-colors duration-300 ${
          paperMode
            ? 'bg-[#fcfbf7] text-slate-900 shadow-inner'
            : darkMode
            ? 'bg-slate-900 text-slate-100'
            : 'bg-white text-slate-900'
        }`}
      >
        <div
          ref={containerRef}
          id="vexflow-canvas-export"
          className="min-h-[220px] w-full max-w-5xl flex justify-center items-start"
        />
      </div>
    </div>
  );
};
