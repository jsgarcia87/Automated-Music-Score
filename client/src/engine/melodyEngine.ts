import type { Measure, NoteEvent, ScoreConfig, ScoreData } from '../types/index.js';
import { SeededPRNG } from './prng.js';
import { generateMeasureRhythm } from './rhythmEngine.js';
import { getAllowedPitches, pitchToMidi, type PitchInfo } from './scaleResolver.js';

// Convierte intervalo (ej. 2ª, 3ª, 4ª, 5ª, 8ª) a semitonos aproximados de límite de salto
function intervalToSemitones(interval: number): number {
  switch (interval) {
    case 2: return 2;
    case 3: return 4;
    case 4: return 5;
    case 5: return 7;
    case 6: return 9;
    case 7: return 11;
    case 8: return 12;
    default: return (interval - 1) * 2;
  }
}

// Genera una melodía completa y coherente basada en todas las restricciones
export function generateMelodyScore(config: ScoreConfig, customSeed?: string): ScoreData {
  const seed = customSeed && customSeed.trim() !== '' ? customSeed : SeededPRNG.generateRandomSeed();
  const prng = new SeededPRNG(seed);

  const allowedPitches = getAllowedPitches(
    config.keySignature,
    config.minPitch,
    config.maxPitch,
    config.excludedPitches
  );

  if (allowedPitches.length === 0) {
    throw new Error('El rango seleccionado y las notas excluidas no dejan ninguna altura disponible.');
  }

  const measures: Measure[] = [];
  let previousPitchIndex = Math.floor(allowedPitches.length / 2); // Empezar en el centro de tesitura
  let lastNoteEvent: NoteEvent | null = null;

  // Límite máximo de salto en semitonos según la configuración pedagógica
  const maxJumpSemitones = intervalToSemitones(config.pedagogy.maxJump || 5);
  const stepwiseProb = (config.pedagogy.stepwisePercentage || 70) / 100;

  // Si se ha especificado nota inicial, buscar su índice en allowedPitches
  if (config.startPitch) {
    const startMidi = pitchToMidi(config.startPitch);
    const foundIdx = allowedPitches.findIndex((p) => p.midiNote === startMidi);
    if (foundIdx !== -1) {
      previousPitchIndex = foundIdx;
    }
  }

  // Iterar por cada compás
  for (let m = 1; m <= config.numMeasures; m++) {
    const rhythmTokens = generateMeasureRhythm(config.timeSignature, config.allowedRhythms, prng);
    const measureNotes: NoteEvent[] = [];

    const isFirstMeasure = m === 1;
    const isLastMeasure = m === config.numMeasures;

    for (let idx = 0; idx < rhythmTokens.length; idx++) {
      const token = rhythmTokens[idx];
      const isFirstNoteOfScore = isFirstMeasure && idx === 0;
      const isLastNoteOfScore = isLastMeasure && idx === rhythmTokens.length - 1;

      if (token.isRest) {
        // Generar un evento de silencio
        const restEvent: NoteEvent = {
          id: `note-${m}-${idx}`,
          pitch: 'rest',
          duration: token.figure,
          vexDuration: token.vexDuration,
          beats: token.beats,
          isRest: true,
          step: 'b',
          octave: 4,
          accidental: '',
          midiNote: 0,
        };
        measureNotes.push(restEvent);
        continue;
      }

      let chosenPitchInfo: PitchInfo;

      if (isFirstNoteOfScore && config.startPitch) {
        // Respetar escrupulosamente la Nota Inicial indicada
        const targetMidi = pitchToMidi(config.startPitch);
        const match = allowedPitches.find((p) => p.midiNote === targetMidi);
        chosenPitchInfo = match || allowedPitches[previousPitchIndex];
      } else if (isLastNoteOfScore && config.endPitch) {
        // Respetar escrupulosamente la Nota Final indicada
        const targetMidi = pitchToMidi(config.endPitch);
        const match = allowedPitches.find((p) => p.midiNote === targetMidi);
        chosenPitchInfo = match || allowedPitches[previousPitchIndex];
      } else {
        // Seleccionar siguiente nota respetando saltos e intervalos pedagógicos
        const prevInfo = allowedPitches[previousPitchIndex];
        const candidates = allowedPitches.filter((p) => {
          const diff = Math.abs(p.midiNote - prevInfo.midiNote);
          return diff <= maxJumpSemitones;
        });

        if (candidates.length > 0) {
          if (prng.chance(stepwiseProb)) {
            // Movimiento conjunto predominante (intervalo de 2ª o nota contigua en la escala)
            const stepCandidates = candidates.filter((p) => {
              const diffIdx = Math.abs(allowedPitches.indexOf(p) - previousPitchIndex);
              return diffIdx === 1 || diffIdx === 0;
            });
            chosenPitchInfo = stepCandidates.length > 0
              ? prng.choice(stepCandidates)
              : prng.choice(candidates);
          } else {
            // Salto melódico dentro del rango pedagógico permitido
            chosenPitchInfo = prng.choice(candidates);
          }
        } else {
          chosenPitchInfo = prng.choice(allowedPitches);
        }
      }

      // Actualizar índice para el siguiente salto
      previousPitchIndex = allowedPitches.indexOf(chosenPitchInfo);
      if (previousPitchIndex === -1) previousPitchIndex = 0;

      // Símbolos musicales opcionales
      let staccato = false;
      let tenuto = false;
      let accent = false;
      let fermata = false;
      let dynamicMark: 'p' | 'mp' | 'mf' | 'f' | 'ff' | undefined = undefined;

      if (config.symbols.staccato && token.beats <= 0.5 && prng.chance(0.25)) {
        staccato = true;
      }
      if (config.symbols.tenuto && token.beats >= 1.0 && prng.chance(0.15)) {
        tenuto = true;
      }
      if (config.symbols.accents && idx === 0 && prng.chance(0.3)) {
        accent = true;
      }
      if (config.symbols.fermata && isLastNoteOfScore && prng.chance(0.8)) {
        fermata = true;
      }
      if (config.symbols.dynamics && isFirstNoteOfScore) {
        const dynamicsList: ('p' | 'mp' | 'mf' | 'f' | 'ff')[] = ['mf', 'f', 'p', 'mp'];
        dynamicMark = prng.choice(dynamicsList);
      }

      const noteEvent: NoteEvent = {
        id: `note-${m}-${idx}`,
        pitch: chosenPitchInfo.pitch,
        duration: token.figure,
        vexDuration: token.vexDuration,
        beats: token.beats,
        isRest: false,
        step: chosenPitchInfo.step,
        octave: chosenPitchInfo.octave,
        accidental: chosenPitchInfo.accidental,
        midiNote: chosenPitchInfo.midiNote,
        staccato,
        tenuto,
        accent,
        fermata,
        dynamic: dynamicMark,
      };

      // Ligaduras (ties) si el símbolo está activo y la nota es de misma altura
      if (config.symbols.ties && lastNoteEvent && !lastNoteEvent.isRest && lastNoteEvent.pitch === noteEvent.pitch && prng.chance(0.2)) {
        lastNoteEvent.tieToNext = true;
      }

      measureNotes.push(noteEvent);
      lastNoteEvent = noteEvent;
    }

    const measure: Measure = {
      number: m,
      notes: measureNotes,
      isRepeatStart: config.symbols.repeats && m === 1,
      isRepeatEnd: config.symbols.repeats && m === config.numMeasures,
    };

    measures.push(measure);
  }

  const scoreData: ScoreData = {
    id: `score-${Date.now()}-${seed}`,
    title: `Opus ${config.keySignature} (${config.timeSignature})`,
    seed: seed,
    config: config,
    measures: measures,
    createdAt: new Date().toISOString(),
    isFavorite: false,
  };

  return scoreData;
}
