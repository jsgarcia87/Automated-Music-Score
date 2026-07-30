import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  FilePlus,
  ChevronLeft,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import type {
  RhythmFigure,
  DynamicMark,
  ScoreData,
  NoteEvent,
} from '../../types/index.js';
import { soundEngine } from '../../audio/soundEngine.js';
import { pitchToMidi, midiToPitch } from '../../engine/scaleResolver.js';

interface ComposerStudioProps {
  score: ScoreData | null;
  selectedNoteId?: string | null;
  activeMeasureIndex: number;
  onSelectMeasure: (idx: number) => void;
  onAddNote: (
    measureIndex: number,
    pitch: string,
    figure: RhythmFigure,
    options?: {
      accidental?: '#' | 'b' | 'n' | '';
      staccato?: boolean;
      tenuto?: boolean;
      accent?: boolean;
      fermata?: boolean;
      dynamic?: DynamicMark;
    }
  ) => void;
  onUpdateNote: (noteId: string, updates: Partial<NoteEvent>) => void;
  onDeleteNote: (noteId: string) => void;
  onAddMeasure: () => void;
  onRemoveLastMeasure: () => void;
  onClearMeasure: (measureIndex: number) => void;
  onCreateEmptyScore: () => void;
}

const RHYTHM_FIGURES: { id: RhythmFigure; label: string; symbol: string; sub: string }[] = [
  { id: 'whole', label: 'Redonda', symbol: '𝅝', sub: '4 tiempos' },
  { id: 'half', label: 'Blanca', symbol: '𝅗𝅥', sub: '2 tiempos' },
  { id: 'quarter', label: 'Negra', symbol: '𝅘𝅥', sub: '1 tiempo' },
  { id: 'eighth', label: 'Corchea', symbol: '𝅘𝅥𝅮', sub: '1/2 tiempo' },
  { id: 'sixteenth', label: 'Semicorchea', symbol: '𝅘𝅥𝅯', sub: '1/4 tiempo' },
  { id: 'rest', label: 'Silencio', symbol: '𝄽', sub: 'Silencio negra' },
];

const ACCIDENTALS: { id: '#' | 'b' | 'n' | ''; label: string; symbol: string }[] = [
  { id: '', label: 'Natural / Ninguna', symbol: '—' },
  { id: '#', label: 'Sostenido', symbol: '♯' },
  { id: 'b', label: 'Bemol', symbol: '♭' },
  { id: 'n', label: 'Becuadro', symbol: '♮' },
];

const DYNAMICS: DynamicMark[] = ['p', 'mp', 'mf', 'f', 'ff'];

export const ComposerStudio: React.FC<ComposerStudioProps> = ({
  score,
  selectedNoteId,
  activeMeasureIndex,
  onSelectMeasure,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onAddMeasure,
  onRemoveLastMeasure,
  onClearMeasure,
  onCreateEmptyScore,
}) => {
  const [selectedFigure, setSelectedFigure] = useState<RhythmFigure>('quarter');
  const [selectedAccidental, setSelectedAccidental] = useState<'#' | 'b' | 'n' | ''>('');
  const [selectedDynamic, setSelectedDynamic] = useState<DynamicMark>('mf');
  const [activeArticulations, setActiveArticulations] = useState({
    staccato: false,
    tenuto: false,
    accent: false,
    fermata: false,
  });
  const [editMode, setEditMode] = useState<'add' | 'replace'>('add');

  // Nota actualmente seleccionada por su ID en el score
  const selectedNote = useMemo(() => {
    if (!score || !selectedNoteId) return null;
    for (const measure of score.measures) {
      const found = measure.notes.find((n) => n.id === selectedNoteId);
      if (found) return found;
    }
    return null;
  }, [score, selectedNoteId]);

  // Si se selecciona una nota, sincronizar el formulario o alternar modo adecuadamente
  React.useEffect(() => {
    if (selectedNote) {
      setSelectedFigure(selectedNote.duration);
      setSelectedAccidental(selectedNote.accidental || '');
      if (selectedNote.dynamic) setSelectedDynamic(selectedNote.dynamic);
      setActiveArticulations({
        staccato: !!selectedNote.staccato,
        tenuto: !!selectedNote.tenuto,
        accent: !!selectedNote.accent,
        fermata: !!selectedNote.fermata,
      });
    }
  }, [selectedNoteId]);

  const totalMeasures = score?.measures.length || 0;
  const currentMeasureNum = activeMeasureIndex + 1;

  const toggleArticulation = (key: keyof typeof activeArticulations) => {
    setActiveArticulations((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (selectedNote) {
        onUpdateNote(selectedNote.id, { [key]: next[key] });
      }
      return next;
    });
  };

  const handleFigureChange = (figure: RhythmFigure) => {
    setSelectedFigure(figure);
    if (selectedNote) {
      onUpdateNote(selectedNote.id, { duration: figure });
    }
  };

  const handleAccidentalChange = (acc: '#' | 'b' | 'n' | '') => {
    setSelectedAccidental(acc);
    if (selectedNote && !selectedNote.isRest) {
      onUpdateNote(selectedNote.id, { accidental: acc });
    }
  };

  const handlePianoKeyClick = (pitchName: string) => {
    // 1. Reproducir sonido en tiempo real
    soundEngine.playNote(pitchName, 0.45);

    // 2. Si estamos en modo de inserción O no hay nota seleccionada -> añadir al compás activo
    if (editMode === 'add' || !selectedNote) {
      onAddNote(activeMeasureIndex, pitchName, selectedFigure, {
        accidental: selectedAccidental,
        staccato: activeArticulations.staccato,
        tenuto: activeArticulations.tenuto,
        accent: activeArticulations.accent,
        fermata: activeArticulations.fermata,
        dynamic: selectedDynamic,
      });
    } else {
      // Reemplazar altura de la nota seleccionada
      onUpdateNote(selectedNote.id, {
        pitch: pitchName,
        duration: selectedFigure,
        accidental: selectedAccidental,
        staccato: activeArticulations.staccato,
        tenuto: activeArticulations.tenuto,
        accent: activeArticulations.accent,
        fermata: activeArticulations.fermata,
        dynamic: selectedDynamic,
      });
    }
  };

  const handleAddRest = () => {
    onAddNote(activeMeasureIndex, 'rest', selectedFigure, {
      dynamic: selectedDynamic,
    });
  };

  const handleShiftSemitone = (delta: number) => {
    if (!selectedNote || selectedNote.isRest) return;
    const currentMidi = pitchToMidi(selectedNote.pitch);
    const nextMidi = currentMidi + delta;
    const nextPitch = midiToPitch(nextMidi);
    soundEngine.playNote(nextPitch, 0.4);
    onUpdateNote(selectedNote.id, { pitch: nextPitch });
  };

  const handleShiftOctave = (delta: number) => {
    if (!selectedNote || selectedNote.isRest) return;
    const currentMidi = pitchToMidi(selectedNote.pitch);
    const nextMidi = currentMidi + delta * 12;
    const nextPitch = midiToPitch(nextMidi);
    soundEngine.playNote(nextPitch, 0.4);
    onUpdateNote(selectedNote.id, { pitch: nextPitch });
  };

  // Teclado virtual 3 octavas: 3, 4, 5
  const octaves = [3, 4, 5];
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  // Teclas negras con su offset en porcentaje respecto al ancho de una tecla blanca
  const blackKeysConfig: { note: string; offset: string }[] = [
    { note: 'C#', offset: '10%' },
    { note: 'D#', offset: '24%' },
    { note: 'F#', offset: '53%' },
    { note: 'G#', offset: '67%' },
    { note: 'A#', offset: '81%' },
  ];

  return (
    <div className="w-full max-w-5xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 p-6 space-y-6">
      {/* Cabecera del Editor y Control de Compás */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Estudio de Composición &amp; Edición
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                Crear tu Partitura
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pulsa en las teclas o en la partitura para añadir y editar notas en tiempo real.
            </p>
          </div>
        </div>

        {/* Controles del Compás Activo */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-slate-700">
          <span className="text-xs text-slate-300 font-medium mr-1">
            Compás:
          </span>
          <button
            onClick={() => onSelectMeasure(Math.max(0, activeMeasureIndex - 1))}
            disabled={activeMeasureIndex <= 0}
            className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Compás anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-white px-2 py-0.5 bg-slate-900 rounded-lg border border-slate-700">
            {currentMeasureNum} / {totalMeasures || 1}
          </span>
          <button
            onClick={() => onSelectMeasure(Math.min(totalMeasures - 1, activeMeasureIndex + 1))}
            disabled={activeMeasureIndex >= totalMeasures - 1}
            className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Compás siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={onAddMeasure}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-colors"
            title="Añadir nuevo compás al final"
          >
            <Plus className="w-3.5 h-3.5" />
            Compás
          </button>

          <button
            onClick={onRemoveLastMeasure}
            disabled={totalMeasures <= 1}
            className="p-1 rounded-lg hover:bg-red-950/50 text-slate-400 hover:text-red-400 disabled:opacity-30 transition-colors"
            title="Eliminar último compás"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onClearMeasure(activeMeasureIndex)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
            title="Vaciar notas del compás activo"
          >
            Vaciar compás
          </button>

          <button
            onClick={onCreateEmptyScore}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors ml-1"
            title="Crear una nueva partitura limpia"
          >
            <FilePlus className="w-3.5 h-3.5" />
            Nueva partitura vacía
          </button>
        </div>
      </div>

      {/* Paleta Superior: Figuras Rítmicas, Alteraciones y Articulaciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector de Figura Rítmica */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Figura y Duración
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {RHYTHM_FIGURES.map((fig) => {
              const isSelected = selectedFigure === fig.id;
              return (
                <button
                  key={fig.id}
                  onClick={() => handleFigureChange(fig.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="text-xl leading-none font-serif mb-0.5">{fig.symbol}</span>
                  <span className="text-[11px] font-semibold">{fig.label}</span>
                  <span className="text-[9px] text-slate-400">{fig.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alteraciones (Accidentals) & Articulaciones */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Alteración y Articulación
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ACCIDENTALS.map((acc) => {
              const isSelected = selectedAccidental === acc.id;
              return (
                <button
                  key={acc.label}
                  onClick={() => handleAccidentalChange(acc.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-md scale-[1.02]'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base font-bold leading-none mb-0.5">{acc.symbol}</span>
                  <span className="text-[10px] font-medium">{acc.id || 'Natural'}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => toggleArticulation('staccato')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeArticulations.staccato
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              • Staccato
            </button>
            <button
              onClick={() => toggleArticulation('tenuto')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeArticulations.tenuto
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              — Tenuto
            </button>
            <button
              onClick={() => toggleArticulation('accent')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeArticulations.accent
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              &gt; Acento
            </button>
            <button
              onClick={() => toggleArticulation('fermata')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                activeArticulations.fermata
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              𝄐 Calderón
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 mr-1">Dinámica:</span>
            {DYNAMICS.map((dyn) => (
              <button
                key={dyn}
                onClick={() => setSelectedDynamic(dyn)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                  selectedDynamic === dyn
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {dyn}
              </button>
            ))}
          </div>
        </div>

        {/* Modo de Acción y Controles de la Nota Seleccionada */}
        <div className="space-y-2 flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              3. Modo de clic en teclado
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setEditMode('add')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editMode === 'add'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                + Añadir al compás
              </button>
              <button
                onClick={() => setEditMode('replace')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editMode === 'replace'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                ✏️ Reemplazar
              </button>
            </div>
          </div>

          {/* Panel para editar la Nota Seleccionada en la Partitura */}
          {selectedNote ? (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  Nota: {selectedNote.pitch} ({selectedNote.duration})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleShiftSemitone(1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  title="Subir 1 semitono (#)"
                >
                  +1 st
                </button>
                <button
                  onClick={() => handleShiftSemitone(-1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  title="Bajar 1 semitono (b)"
                >
                  -1 st
                </button>
                <button
                  onClick={() => handleShiftOctave(1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  title="Subir octava (8va)"
                >
                  +8va
                </button>
                <button
                  onClick={() => handleShiftOctave(-1)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  title="Bajar octava (8vb)"
                >
                  -8vb
                </button>
                <button
                  onClick={() => onDeleteNote(selectedNote.id)}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-red-200 transition-colors"
                  title="Eliminar nota"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400">
              <span>Haz clic en una nota de la partitura para seleccionarla o pulsa en el piano para añadir.</span>
              <button
                onClick={handleAddRest}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
              >
                + Añadir Silencio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Teclado Musical de Piano Interactivo (3 Octavas: C3 a B5) */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            Teclado Musical Interactivo (C3 - B5) • Haz clic en una tecla para {editMode === 'add' ? 'añadir una nota al compás' : 'reemplazar la nota seleccionada'}
          </label>
        </div>

        <div className="relative overflow-x-auto pb-4 pt-1 flex justify-center">
          <div className="inline-flex gap-0.5 bg-slate-950 p-3 rounded-3xl border-2 border-slate-800 shadow-2xl min-w-[700px] select-none">
            {octaves.map((oct) => (
              <div key={oct} className="relative inline-flex gap-0.5">
                {whiteKeys.map((step) => {
                  const pitchName = `${step}${oct}`;
                  const isNoteSelected = selectedNote?.pitch === pitchName;
                  return (
                    <button
                      key={pitchName}
                      onClick={() => handlePianoKeyClick(pitchName)}
                      className={`relative w-11 h-40 rounded-b-xl border border-slate-300/40 font-mono text-[11px] font-bold flex flex-col justify-end pb-2 items-center transition-all duration-75 active:scale-95 shadow-md ${
                        isNoteSelected
                          ? 'bg-amber-400 text-slate-950 shadow-amber-400/50 scale-[1.03] z-10'
                          : 'bg-gradient-to-b from-white via-slate-50 to-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-900'
                      }`}
                      title={`Tocar ${pitchName}`}
                    >
                      <span className="opacity-90">{pitchName}</span>
                    </button>
                  );
                })}

                {/* Teclas Negras de la Octava (posicionadas absolutamente por encima) */}
                <div className="absolute top-0 left-0 w-full h-24 pointer-events-none">
                  {blackKeysConfig.map((bk) => {
                    const pitchName = `${bk.note}${oct}`;
                    const isNoteSelected = selectedNote?.pitch === pitchName;
                    return (
                      <button
                        key={pitchName}
                        onClick={() => handlePianoKeyClick(pitchName)}
                        style={{ left: bk.offset }}
                        className={`absolute w-7 h-24 rounded-b-lg border border-slate-900 font-mono text-[9px] font-bold flex flex-col justify-end pb-1.5 items-center transition-all duration-75 active:scale-95 pointer-events-auto shadow-lg z-20 ${
                          isNoteSelected
                            ? 'bg-amber-500 text-slate-950 shadow-amber-400/50 scale-[1.05]'
                            : 'bg-gradient-to-b from-slate-800 to-slate-950 text-slate-300 hover:bg-slate-700'
                        }`}
                        title={`Tocar ${pitchName}`}
                      >
                        <span>{bk.note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
