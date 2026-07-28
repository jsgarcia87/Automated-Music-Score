import type { KeySignature } from '../types/index.js';

export interface PitchInfo {
  pitch: string;       // 'C4', 'F#5', 'Bb3'
  step: string;        // 'c', 'f', 'b'
  octave: number;      // 4, 5, 3
  accidental: '#' | 'b' | '' | 'n';
  midiNote: number;    // 60 para C4
  scaleDegree: number; // 1 a 7 (I a VII)
}

// Mapa de notas a sus intervalos en semitonos respecto a C (do)
const NOTE_TO_SEMITONE: Record<string, number> = {
  'c': 0, 'c#': 1, 'db': 1,
  'd': 2, 'd#': 3, 'eb': 3,
  'e': 4, 'fb': 4, 'e#': 5,
  'f': 5, 'f#': 6, 'gb': 6,
  'g': 7, 'g#': 8, 'ab': 8,
  'a': 9, 'a#': 10, 'bb': 10,
  'b': 11, 'cb': 11, 'b#': 0
};

// Pasos diatópicos y alteraciones típicas por tonalidad (Mayor y Menor natural/armónica)
export const KEY_SCALE_PITCH_CLASSES: Record<KeySignature, { steps: string[]; accidentals: Record<string, '#' | 'b' | ''> }> = {
  'C':   { steps: ['c', 'd', 'e', 'f', 'g', 'a', 'b'], accidentals: { 'c': '', 'd': '', 'e': '', 'f': '', 'g': '', 'a': '', 'b': '' } },
  'G':   { steps: ['g', 'a', 'b', 'c', 'd', 'e', 'f'], accidentals: { 'g': '', 'a': '', 'b': '', 'c': '', 'd': '', 'e': '', 'f': '#' } },
  'D':   { steps: ['d', 'e', 'f', 'g', 'a', 'b', 'c'], accidentals: { 'd': '', 'e': '', 'f': '#', 'g': '', 'a': '', 'b': '', 'c': '#' } },
  'A':   { steps: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], accidentals: { 'a': '', 'b': '', 'c': '#', 'd': '', 'e': '', 'f': '#', 'g': '#' } },
  'E':   { steps: ['e', 'f', 'g', 'a', 'b', 'c', 'd'], accidentals: { 'e': '', 'f': '#', 'g': '#', 'a': '', 'b': '', 'c': '#', 'd': '#' } },
  'B':   { steps: ['b', 'c', 'd', 'e', 'f', 'g', 'a'], accidentals: { 'b': '', 'c': '#', 'd': '#', 'e': '', 'f': '#', 'g': '#', 'a': '#' } },
  'F#':  { steps: ['f', 'g', 'a', 'b', 'c', 'd', 'e'], accidentals: { 'f': '#', 'g': '#', 'a': '#', 'b': '', 'c': '#', 'd': '#', 'e': '#' } },
  'F':   { steps: ['f', 'g', 'a', 'b', 'c', 'd', 'e'], accidentals: { 'f': '', 'g': '', 'a': '', 'b': 'b', 'c': '', 'd': '', 'e': '' } },
  'Bb':  { steps: ['b', 'c', 'd', 'e', 'f', 'g', 'a'], accidentals: { 'b': 'b', 'c': '', 'd': '', 'e': 'b', 'f': '', 'g': '', 'a': '' } },
  'Eb':  { steps: ['e', 'f', 'g', 'a', 'b', 'c', 'd'], accidentals: { 'e': 'b', 'f': '', 'g': '', 'a': 'b', 'b': 'b', 'c': '', 'd': '' } },
  'Ab':  { steps: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], accidentals: { 'a': 'b', 'b': 'b', 'c': '', 'd': 'b', 'e': 'b', 'f': '', 'g': '' } },
  'Db':  { steps: ['d', 'e', 'f', 'g', 'a', 'b', 'c'], accidentals: { 'd': 'b', 'e': 'b', 'f': '', 'g': 'b', 'a': 'b', 'b': 'b', 'c': '' } },
  'Gb':  { steps: ['g', 'a', 'b', 'c', 'd', 'e', 'f'], accidentals: { 'g': 'b', 'a': 'b', 'b': 'b', 'c': 'b', 'd': 'b', 'e': 'b', 'f': '' } },
  // Menores
  'Am':  { steps: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], accidentals: { 'a': '', 'b': '', 'c': '', 'd': '', 'e': '', 'f': '', 'g': '' } },
  'Em':  { steps: ['e', 'f', 'g', 'a', 'b', 'c', 'd'], accidentals: { 'e': '', 'f': '#', 'g': '', 'a': '', 'b': '', 'c': '', 'd': '' } },
  'Bm':  { steps: ['b', 'c', 'd', 'e', 'f', 'g', 'a'], accidentals: { 'b': '', 'c': '#', 'd': '', 'e': '', 'f': '#', 'g': '', 'a': '' } },
  'F#m': { steps: ['f', 'g', 'a', 'b', 'c', 'd', 'e'], accidentals: { 'f': '#', 'g': '#', 'a': '', 'b': '', 'c': '#', 'd': '', 'e': '' } },
  'C#m': { steps: ['c', 'd', 'e', 'f', 'g', 'a', 'b'], accidentals: { 'c': '#', 'd': '#', 'e': '', 'f': '#', 'g': '#', 'a': '', 'b': '' } },
  'G#m': { steps: ['g', 'a', 'b', 'c', 'd', 'e', 'f'], accidentals: { 'g': '#', 'a': '#', 'b': '', 'c': '#', 'd': '#', 'e': '', 'f': '#' } },
  'D#m': { steps: ['d', 'e', 'f', 'g', 'a', 'b', 'c'], accidentals: { 'd': '#', 'e': '#', 'f': '#', 'g': '#', 'a': '#', 'b': '', 'c': '#' } },
  'Dm':  { steps: ['d', 'e', 'f', 'g', 'a', 'b', 'c'], accidentals: { 'd': '', 'e': '', 'f': '', 'g': '', 'a': '', 'b': 'b', 'c': '' } },
  'Gm':  { steps: ['g', 'a', 'b', 'c', 'd', 'e', 'f'], accidentals: { 'g': '', 'a': '', 'b': 'b', 'c': '', 'd': '', 'e': 'b', 'f': '' } },
  'Cm':  { steps: ['c', 'd', 'e', 'f', 'g', 'a', 'b'], accidentals: { 'c': '', 'd': '', 'e': 'b', 'f': '', 'g': '', 'a': 'b', 'b': 'b' } },
  'Fm':  { steps: ['f', 'g', 'a', 'b', 'c', 'd', 'e'], accidentals: { 'f': '', 'g': '', 'a': 'b', 'b': 'b', 'c': '', 'd': 'b', 'e': 'b' } },
  'Bbm': { steps: ['b', 'c', 'd', 'e', 'f', 'g', 'a'], accidentals: { 'b': 'b', 'c': '', 'd': 'b', 'e': 'b', 'f': '', 'g': 'b', 'a': 'b' } },
  'Ebm': { steps: ['e', 'f', 'g', 'a', 'b', 'c', 'd'], accidentals: { 'e': 'b', 'f': '', 'g': 'b', 'a': 'b', 'b': 'b', 'c': 'b', 'd': 'b' } },
};

// Convierte una nota como 'C4', 'F#5', 'Bb3' a su número MIDI
export function pitchToMidi(pitch: string): number {
  if (!pitch || pitch === 'rest') return 0;
  const match = pitch.match(/^([a-gA-G])([#b]?)(-?\d+)$/);
  if (!match) return 60;
  const [, stepStr, accStr, octStr] = match;
  const step = stepStr.toLowerCase();
  const acc = accStr || '';
  const oct = parseInt(octStr, 10);
  const semitone = NOTE_TO_SEMITONE[step + acc];
  return (oct + 1) * 12 + (semitone !== undefined ? semitone : 0);
}

// Convierte un número MIDI (60) a nombre de altura ('C4') preferiendo sostenidos o bemoles
export function midiToPitch(midi: number, preferFlats: boolean = false): string {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const sharpNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const noteName = (preferFlats ? flatNames : sharpNames)[semitone];
  return `${noteName}${octave}`;
}

// Genera el conjunto de notas permitidas dentro de una tonalidad, tesitura y exclusiones
export function getAllowedPitches(
  keySignature: KeySignature,
  minPitch: string,
  maxPitch: string,
  excludedPitches: string[] = []
): PitchInfo[] {
  const minMidi = pitchToMidi(minPitch);
  const maxMidi = pitchToMidi(maxPitch);
  const keyInfo = KEY_SCALE_PITCH_CLASSES[keySignature] || KEY_SCALE_PITCH_CLASSES['C'];

  // Normalizar notas excluidas
  const excludedSet = new Set(
    excludedPitches.map((p) => p.replace(/\d/g, '').toLowerCase())
  );

  const pitches: PitchInfo[] = [];

  // Explorar octavas 2 a 7 para encontrar todas las alturas válidas en la tonalidad y tesitura
  for (let octave = 2; octave <= 7; octave++) {
    keyInfo.steps.forEach((step, index) => {
      const acc = keyInfo.accidentals[step] || '';
      const stepUpper = step.toUpperCase();
      const pitchName = `${stepUpper}${acc}${octave}`;
      const midi = pitchToMidi(pitchName);

      if (midi >= minMidi && midi <= maxMidi) {
        // Verificar que no esté excluida por nombre de nota o alteración
        const noteClass = `${step}${acc}`;
        if (!excludedSet.has(noteClass) && !excludedSet.has(stepUpper + acc) && !excludedSet.has(stepUpper)) {
          pitches.push({
            pitch: pitchName,
            step: step,
            octave: octave,
            accidental: acc as '#' | 'b' | '',
            midiNote: midi,
            scaleDegree: index + 1,
          });
        }
      }
    });
  }

  return pitches.sort((a, b) => a.midiNote - b.midiNote);
}
