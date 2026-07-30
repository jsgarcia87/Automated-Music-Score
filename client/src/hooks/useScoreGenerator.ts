import { useState, useCallback, useEffect, useRef } from 'react';
import type { ScoreConfig, ScoreData, RhythmFigure, DynamicMark, Measure, NoteEvent } from '../types/index.js';
import { generateMelodyScore } from '../engine/melodyEngine.js';
import { validateScoreConfig, type ValidationResult } from '../engine/validator.js';
import { storageService } from '../services/storageService.js';
import { getNoteFigureDetails } from '../engine/rhythmEngine.js';
import { pitchToMidi } from '../engine/scaleResolver.js';

function createNoteEvent(
  id: string,
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
): NoteEvent {
  const isRest = pitch === 'rest' || figure === 'rest';
  const { beats, vexDuration } = getNoteFigureDetails(figure, isRest);

  let step = 'b';
  let octave = 4;
  let midiNote = 0;
  let acc: '#' | 'b' | 'n' | '' = '';

  if (!isRest) {
    const match = pitch.match(/^([a-gA-G])([#b]?)(-?\d+)$/);
    if (match) {
      step = match[1].toLowerCase();
      acc = (options?.accidental !== undefined ? options.accidental : (match[2] as '#' | 'b' | '')) || '';
      octave = parseInt(match[3], 10);
      midiNote = pitchToMidi(pitch);
    } else {
      step = 'c';
      octave = 4;
      midiNote = 60;
    }
  }

  return {
    id,
    pitch: isRest ? 'rest' : pitch,
    duration: figure,
    vexDuration,
    beats,
    isRest,
    step,
    octave,
    accidental: acc,
    staccato: options?.staccato,
    tenuto: options?.tenuto,
    accent: options?.accent,
    fermata: options?.fermata,
    dynamic: options?.dynamic || 'mf',
    midiNote,
  };
}

const DEFAULT_CONFIG: ScoreConfig = {
  clef: 'treble',
  keySignature: 'C',
  timeSignature: '4/4',
  bpm: 96,
  numMeasures: 8,
  minPitch: 'C4',
  maxPitch: 'G5',
  excludedPitches: [],
  allowedRhythms: ['quarter', 'eighth', 'half', 'rest'],
  symbols: {
    ties: false,
    fermata: true,
    repeats: false,
    accents: false,
    staccato: false,
    tenuto: false,
    dynamics: true,
  },
  pedagogy: {
    mode: 'standard',
    difficulty: 'beginner',
    allowedIntervals: [2, 3, 4],
    maxJump: 4,
    stepwisePercentage: 80,
    usePassingNotes: true,
  },
};

export function useScoreGenerator(initialConfig = DEFAULT_CONFIG) {
  const [config, setConfigState] = useState<ScoreConfig>(initialConfig);
  const [score, setScore] = useState<ScoreData | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedParams, setLockedParams] = useState<Set<string>>(new Set());
  const [isComposerMode, setIsComposerMode] = useState(false);

  // Validar configuración de forma reactiva al cambiar config
  useEffect(() => {
    const result = validateScoreConfig(config);
    setValidation(result);
  }, [config]);

  // Bloquear / Desbloquear parámetro específico para generación aleatoria
  const toggleLockParam = useCallback((paramKey: string) => {
    setLockedParams((prev) => {
      const next = new Set(prev);
      if (next.has(paramKey)) next.delete(paramKey);
      else next.add(paramKey);
      return next;
    });
  }, []);

  // Generar nueva partitura con semilla opcional
  const generateScore = useCallback(
    async (customSeed?: string): Promise<ScoreData | null> => {
      const result = validateScoreConfig(config);
      if (!result.isValid) {
        alert(result.errors.join('\n'));
        return null;
      }

      setIsGenerating(true);
      try {
        const newScore = generateMelodyScore(config, customSeed);
        setScore(newScore);
        setIsComposerMode(false);

        // 1. Guardar automáticamente en almacenamiento local offline (localStorage)
        storageService.saveScore(newScore);

        // 2. Opcional: intentar guardar en servidor REST/SQLite si está activo
        try {
          fetch('http://localhost:3001/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: newScore.id,
              title: newScore.title,
              seed: newScore.seed,
              config: newScore.config,
              notes: newScore.measures,
            }),
          }).catch(() => {});
        } catch (_) {}

        return newScore;
      } catch (err: any) {
        alert(`Error al generar melodía: ${err.message}`);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [config]
  );

  // Autogenerar partitura automáticamente cuando cambia la configuración
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isComposerMode) {
      return;
    }
    const timer = setTimeout(() => {
      const currentValidation = validateScoreConfig(config);
      if (currentValidation.isValid) {
        generateScore();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [config, generateScore, isComposerMode]);

  // Generar enlace compartible por hash (base64 de config + semilla)
  const generateShareLink = useCallback(() => {
    if (!score) return '';
    const payload = JSON.stringify({
      s: score.seed,
      c: score.config,
    });
    const base64 = btoa(encodeURIComponent(payload));
    const url = `${window.location.origin}${window.location.pathname}#share=${base64}`;
    navigator.clipboard.writeText(url);
    return url;
  }, [score]);

  // Cargar configuración desde enlace compartido al montar
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#share=')) {
      try {
        const base64 = hash.replace('#share=', '');
        const json = decodeURIComponent(atob(base64));
        const data = JSON.parse(json);
        if (data.c && data.s) {
          setConfigState(data.c);
          const sharedScore = generateMelodyScore(data.c, data.s);
          setScore(sharedScore);
        }
      } catch (err) {
        console.error('Error al decodificar enlace compartido:', err);
      }
    }
  }, []);

  const saveCustomScore = useCallback((updatedScore: ScoreData) => {
    setScore(updatedScore);
    setIsComposerMode(true);
    storageService.saveScore(updatedScore);
    try {
      fetch('http://localhost:3001/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedScore.id,
          title: updatedScore.title,
          seed: updatedScore.seed,
          config: updatedScore.config,
          notes: updatedScore.measures,
        }),
      }).catch(() => {});
    } catch (_) {}
  }, []);

  const createEmptyScore = useCallback((customConfig?: ScoreConfig) => {
    const activeConfig = customConfig || config;
    const measures: Measure[] = [];
    for (let m = 1; m <= activeConfig.numMeasures; m++) {
      measures.push({
        number: m,
        notes: [createNoteEvent(`note-${m}-0`, 'rest', 'whole')],
      });
    }
    const emptyScore: ScoreData = {
      id: `custom-${Date.now()}`,
      title: 'Mi Partitura Personalizada',
      seed: 'COMPOSER',
      config: activeConfig,
      measures,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    saveCustomScore(emptyScore);
    return emptyScore;
  }, [config, saveCustomScore]);

  const addNoteToMeasure = useCallback((
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
  ) => {
    const currentScore = score || createEmptyScore();
    const targetIdx = Math.min(Math.max(0, measureIndex), currentScore.measures.length - 1);
    const targetMeasure = currentScore.measures[targetIdx];
    const newNoteId = `note-${targetIdx + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNote = createNoteEvent(newNoteId, pitch, figure, options);

    const isPlaceholderRest =
      targetMeasure.notes.length === 1 &&
      targetMeasure.notes[0].isRest &&
      targetMeasure.notes[0].duration === 'whole';

    const nextNotes = isPlaceholderRest ? [newNote] : [...targetMeasure.notes, newNote];

    const updatedMeasures = currentScore.measures.map((m, idx) =>
      idx === targetIdx ? { ...m, notes: nextNotes } : m
    );

    const updatedScore: ScoreData = {
      ...currentScore,
      measures: updatedMeasures,
    };
    saveCustomScore(updatedScore);
    return newNote.id;
  }, [score, createEmptyScore, saveCustomScore]);

  const updateNoteInScore = useCallback((
    noteId: string,
    updates: Partial<NoteEvent>
  ) => {
    if (!score) return;
    const updatedMeasures = score.measures.map((m) => {
      const hasNote = m.notes.some((n) => n.id === noteId);
      if (!hasNote) return m;
      const newNotes = m.notes.map((n) => {
        if (n.id !== noteId) return n;
        const targetPitch = updates.pitch !== undefined ? updates.pitch : n.pitch;
        const targetDuration = updates.duration !== undefined ? updates.duration : n.duration;
        const targetAccidental = updates.accidental !== undefined ? updates.accidental : n.accidental;

        const isRest = targetPitch === 'rest' || targetDuration === 'rest';
        const { beats, vexDuration } = getNoteFigureDetails(targetDuration, isRest);

        let step = n.step;
        let octave = n.octave;
        let midiNote = n.midiNote;
        if (!isRest && (updates.pitch !== undefined || updates.accidental !== undefined)) {
          const match = targetPitch.match(/^([a-gA-G])([#b]?)(-?\d+)$/);
          if (match) {
            step = match[1].toLowerCase();
            octave = parseInt(match[3], 10);
          }
          midiNote = pitchToMidi(targetPitch);
        }

        return {
          ...n,
          ...updates,
          pitch: isRest ? 'rest' : targetPitch,
          duration: targetDuration,
          vexDuration,
          beats,
          isRest,
          step,
          octave,
          accidental: targetAccidental,
          midiNote,
        };
      });
      return { ...m, notes: newNotes };
    });

    saveCustomScore({
      ...score,
      measures: updatedMeasures,
    });
  }, [score, saveCustomScore]);

  const deleteNoteFromScore = useCallback((noteId: string) => {
    if (!score) return;
    const updatedMeasures = score.measures.map((m) => {
      const newNotes = m.notes.filter((n) => n.id !== noteId);
      if (newNotes.length === 0) {
        return {
          ...m,
          notes: [createNoteEvent(`note-${m.number}-0`, 'rest', 'whole')],
        };
      }
      return { ...m, notes: newNotes };
    });
    saveCustomScore({
      ...score,
      measures: updatedMeasures,
    });
  }, [score, saveCustomScore]);

  const addMeasureToScore = useCallback(() => {
    if (!score) {
      createEmptyScore();
      return;
    }
    const newMeasureNum = score.measures.length + 1;
    const newMeasure: Measure = {
      number: newMeasureNum,
      notes: [createNoteEvent(`note-${newMeasureNum}-0`, 'rest', 'whole')],
    };
    const updatedScore: ScoreData = {
      ...score,
      config: { ...score.config, numMeasures: newMeasureNum },
      measures: [...score.measures, newMeasure],
    };
    setConfigState(updatedScore.config);
    saveCustomScore(updatedScore);
  }, [score, createEmptyScore, saveCustomScore]);

  const removeLastMeasureFromScore = useCallback(() => {
    if (!score || score.measures.length <= 1) return;
    const nextMeasures = score.measures.slice(0, -1);
    const updatedScore: ScoreData = {
      ...score,
      config: { ...score.config, numMeasures: nextMeasures.length },
      measures: nextMeasures,
    };
    setConfigState(updatedScore.config);
    saveCustomScore(updatedScore);
  }, [score, saveCustomScore]);

  const clearMeasureNotes = useCallback((measureIndex: number) => {
    if (!score) return;
    const targetIdx = Math.min(Math.max(0, measureIndex), score.measures.length - 1);
    const updatedMeasures = score.measures.map((m, idx) =>
      idx === targetIdx
        ? { ...m, notes: [createNoteEvent(`note-${m.number}-${Date.now()}`, 'rest', 'whole')] }
        : m
    );
    saveCustomScore({
      ...score,
      measures: updatedMeasures,
    });
  }, [score, saveCustomScore]);

  return {
    config,
    setConfig: setConfigState,
    score,
    setScore,
    validation,
    isGenerating,
    generateScore,
    lockedParams,
    toggleLockParam,
    generateShareLink,
    isComposerMode,
    setIsComposerMode,
    createEmptyScore,
    addNoteToMeasure,
    updateNoteInScore,
    deleteNoteFromScore,
    addMeasureToScore,
    removeLastMeasureFromScore,
    clearMeasureNotes,
  };
}

