export type ClefType = 'treble' | 'bass' | 'alto';

export type KeySignature =
  // Mayores
  | 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F#' | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb'
  // Menores
  | 'Am' | 'Em' | 'Bm' | 'F#m' | 'C#m' | 'G#m' | 'D#m' | 'Dm' | 'Gm' | 'Cm' | 'Fm' | 'Bbm' | 'Ebm';

export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8' | '9/8' | '12/8';

export type RhythmFigure =
  | 'whole'
  | 'half'
  | 'quarter'
  | 'eighth'
  | 'sixteenth'
  | 'triplet'
  | 'dotted-quarter'
  | 'dotted-half'
  | 'rest';

export interface SymbolsConfig {
  ties: boolean;
  fermata: boolean;
  repeats: boolean;
  accents: boolean;
  staccato: boolean;
  tenuto: boolean;
  dynamics: boolean;
}

export type PedagogyMode = 'standard' | 'sight-reading' | 'dictation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PedagogyConfig {
  mode: PedagogyMode;
  difficulty: DifficultyLevel;
  allowedIntervals: number[]; // [2, 3, 4, 5, 6, 7, 8]
  maxJump: number; // Ej. máximo salto de 4ª
  stepwisePercentage: number; // Porcentaje de movimiento conjunto (0 - 100)
  usePassingNotes: boolean;
}

export interface ScoreConfig {
  clef: ClefType;
  keySignature: KeySignature;
  timeSignature: TimeSignature;
  bpm: number;
  numMeasures: number;
  minPitch: string; // Ej. 'C4'
  maxPitch: string; // Ej. 'G5'
  startPitch?: string; // Opcional 'C4'
  endPitch?: string;   // Opcional 'C4'
  excludedPitches: string[]; // ['F#', 'Bb', 'C#']
  allowedRhythms: RhythmFigure[];
  symbols: SymbolsConfig;
  pedagogy: PedagogyConfig;
}

export type DynamicMark = 'p' | 'mp' | 'mf' | 'f' | 'ff';

export interface NoteEvent {
  id: string;
  pitch: string; // Altura como 'C4', 'F#4' o 'rest'
  duration: RhythmFigure;
  vexDuration: string; // Duración en formato VexFlow (ej. 'q', 'h', '8', 'qr', '8d')
  beats: number; // Duración en tiempos de negra (ej. 1, 0.5, 1.5)
  isRest: boolean;
  step: string; // 'c', 'd', 'e', 'f', 'g', 'a', 'b'
  octave: number; // 4, 5...
  accidental?: '#' | 'b' | 'n' | '';
  tieToNext?: boolean;
  fermata?: boolean;
  staccato?: boolean;
  tenuto?: boolean;
  accent?: boolean;
  dynamic?: DynamicMark;
  midiNote?: number; // Para Tone.js / exportación MIDI
}

export interface Measure {
  number: number;
  notes: NoteEvent[];
  isRepeatStart?: boolean;
  isRepeatEnd?: boolean;
  ending?: 1 | 2;
}

export interface ScoreData {
  id: string;
  title: string;
  seed: string;
  config: ScoreConfig;
  measures: Measure[];
  createdAt: string;
  isFavorite: boolean;
}

export interface PresetData {
  id: string;
  name: string;
  description: string;
  category: string;
  config: ScoreConfig;
  is_default: boolean;
}
