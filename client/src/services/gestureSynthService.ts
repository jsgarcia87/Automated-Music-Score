import type { KeySignature } from '../types/index.js';

// Escalas diatónicas por tonalidad (2 octavas principales para Theremin)
const KEY_SCALES: Record<string, string[]> = {
  C: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'G5'],
  G: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5', 'A5'],
  D: ['D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5', 'E5'],
  F: ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'E5', 'F5', 'G5'],
  Bb: ['Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'Eb5', 'F5', 'G5', 'A5', 'Bb5'],
  Am: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'],
  Em: ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
  Dm: ['D3', 'E3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5']
};

// Acordes de acompañamiento (I, IV, V, VI) correspondientes a cada tonalidad
const KEY_CHORDS: Record<string, { label: string; notes: string[] }[]> = {
  C: [
    { label: 'I (Do May)', notes: ['C4', 'E4', 'G4'] },
    { label: 'IV (Fa May)', notes: ['F3', 'A3', 'C4'] },
    { label: 'V (Sol May)', notes: ['G3', 'B3', 'D4'] },
    { label: 'vi (La min)', notes: ['A3', 'C4', 'E4'] }
  ],
  G: [
    { label: 'I (Sol May)', notes: ['G3', 'B3', 'D4'] },
    { label: 'IV (Do May)', notes: ['C4', 'E4', 'G4'] },
    { label: 'V (Re May)', notes: ['D4', 'F#4', 'A4'] },
    { label: 'vi (Mi min)', notes: ['E3', 'G3', 'B3'] }
  ],
  Am: [
    { label: 'i (La min)', notes: ['A3', 'C4', 'E4'] },
    { label: 'iv (Re min)', notes: ['D4', 'F4', 'A4'] },
    { label: 'v (Mi min)', notes: ['E3', 'G3', 'B3'] },
    { label: 'VI (Fa May)', notes: ['F3', 'A3', 'C4'] }
  ]
};

export class GestureSynthService {
  /**
   * Mapea coordenada vertical Y (0.0 superior a 1.0 inferior) a una nota diatónica en la tonalidad activa.
   */
  public getPitchFromY(y: number, key: KeySignature = 'C'): string {
    const scale = KEY_SCALES[key] || KEY_SCALES.C;
    // y = 0 está arriba (agudos), y = 1 está abajo (graves)
    const invertedY = Math.max(0, Math.min(1, 1 - y));
    const index = Math.floor(invertedY * scale.length);
    const clampedIndex = Math.max(0, Math.min(scale.length - 1, index));
    return scale[clampedIndex];
  }

  /**
   * Obtiene la lista de acordes disponibles para la mano izquierda según la tonalidad
   */
  public getChordsForKey(key: KeySignature = 'C'): { label: string; notes: string[] }[] {
    return KEY_CHORDS[key] || KEY_CHORDS.C;
  }

  /**
   * Mapea coordenada horizontal X de mano izquierda (0 a 1) a uno de los 4 acordes principales
   */
  public getChordFromX(x: number, key: KeySignature = 'C'): { label: string; notes: string[] } {
    const chords = this.getChordsForKey(key);
    const index = Math.floor(Math.max(0, Math.min(0.999, x)) * chords.length);
    return chords[index];
  }

  /**
   * Mapea apertura o distancia de dedos a ganancia en dB (-24dB a 0dB)
   */
  public getVolumeFromDistance(dist: number): number {
    // dist tipico entre pulgar y meñique o índice entre 0.05 y 0.4
    const norm = Math.max(0, Math.min(1, (dist - 0.05) / 0.3));
    return -24 + norm * 24;
  }

  /**
   * Mapea coordenada Y (0 arriba, 1 abajo) a Tempo BPM (40 a 200 BPM)
   */
  public getBpmFromY(y: number): number {
    const invertedY = Math.max(0, Math.min(1, 1 - y));
    return Math.round(50 + invertedY * 130); // 50 BPM (grave/abajo) a 180 BPM (agudo/arriba)
  }

  /**
   * Calcula distancia euclidiana 2D entre dos puntos (x, y) de landmarks de la mano
   */
  public calculateDistance(pt1: { x: number; y: number }, pt2: { x: number; y: number }): number {
    const dx = pt1.x - pt2.x;
    const dy = pt1.y - pt2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export const gestureSynthService = new GestureSynthService();
