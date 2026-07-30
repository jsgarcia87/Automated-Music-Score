import type { RhythmFigure, TimeSignature } from '../types/index.js';
import { SeededPRNG } from './prng.js';

export interface RhythmToken {
  figure: RhythmFigure;
  beats: number;
  vexDuration: string;
  isRest: boolean;
  isTripletGroup?: boolean; // Indica si forma un grupo de tresillo
}

// Duración en tiempos de negra (quarter note = 1.0)
export const FIGURE_BEATS: Record<RhythmFigure, number> = {
  'whole': 4.0,
  'dotted-half': 3.0,
  'half': 2.0,
  'dotted-quarter': 1.5,
  'quarter': 1.0,
  'eighth': 0.5,
  'sixteenth': 0.25,
  'triplet': 1 / 3,
  'rest': 1.0,
};

export const FIGURE_VEX: Record<RhythmFigure, string> = {
  'whole': 'w',
  'dotted-half': 'hd',
  'half': 'h',
  'dotted-quarter': 'qd',
  'quarter': 'q',
  'eighth': '8',
  'sixteenth': '16',
  'triplet': '8', // En VexFlow un tresillo de corcheas se dibuja con duraciones '8' y un tuplet
  'rest': 'qr',
};

export function getNoteFigureDetails(figure: RhythmFigure, isRest: boolean) {
  const beats = FIGURE_BEATS[figure] ?? 1.0;
  let vexDuration = FIGURE_VEX[figure] ?? 'q';
  if (isRest && !vexDuration.endsWith('r')) {
    vexDuration = `${vexDuration}r`;
  } else if (!isRest && vexDuration.endsWith('r')) {
    vexDuration = vexDuration.replace('r', '');
  }
  return { beats, vexDuration };
}

// Capacidad total de tiempos en negra por compás
export function getMeasureTotalBeats(timeSignature: TimeSignature): number {
  switch (timeSignature) {
    case '2/4': return 2.0;
    case '3/4': return 3.0;
    case '4/4': return 4.0;
    case '6/8': return 3.0; // 6 corcheas = 3 tiempos de negra
    case '9/8': return 4.5; // 9 corcheas = 4.5 tiempos de negra
    case '12/8': return 6.0; // 12 corcheas = 6 tiempos de negra
    default: return 4.0;
  }
}

// Genera una secuencia rítmica exacta que suma la duración total del compás
export function generateMeasureRhythm(
  timeSignature: TimeSignature,
  allowedRhythms: RhythmFigure[],
  prng: SeededPRNG
): RhythmToken[] {
  const targetBeats = getMeasureTotalBeats(timeSignature);
  const tokens: RhythmToken[] = [];
  let currentBeats = 0;

  // Si no se han pasado ritmos válidos, usar negra por defecto
  const validFigures = allowedRhythms.length > 0
    ? allowedRhythms.filter((f) => f !== 'rest')
    : ['quarter' as RhythmFigure];

  const allowRest = allowedRhythms.includes('rest');

  let safetyCounter = 0;

  while (currentBeats < targetBeats - 0.001 && safetyCounter < 100) {
    safetyCounter++;
    const remaining = targetBeats - currentBeats;

    // Si queda exactamente 1 tiempo o más y se permite tresillo, podemos generar un grupo de 3 corcheas de tresillo
    if (validFigures.includes('triplet') && remaining >= 0.999 && prng.chance(0.2)) {
      tokens.push({ figure: 'triplet', beats: 1 / 3, vexDuration: '8', isRest: false, isTripletGroup: true });
      tokens.push({ figure: 'triplet', beats: 1 / 3, vexDuration: '8', isRest: false, isTripletGroup: true });
      tokens.push({ figure: 'triplet', beats: 1 / 3, vexDuration: '8', isRest: false, isTripletGroup: true });
      currentBeats += 1.0;
      continue;
    }

    // Filtrar figuras válidas cuya duración quepa en el espacio restante del compás
    const candidates = validFigures.filter((f) => {
      const b = FIGURE_BEATS[f];
      return b <= remaining + 0.001;
    });

    if (candidates.length === 0) {
      // Si ninguna figura cabe (ej. queda 0.5 y solo se escogió negra o blanca), rellenar con corchea o semicorchea
      if (remaining >= 0.5) {
        tokens.push({ figure: 'eighth', beats: 0.5, vexDuration: '8', isRest: false });
        currentBeats += 0.5;
      } else if (remaining >= 0.25) {
        tokens.push({ figure: 'sixteenth', beats: 0.25, vexDuration: '16', isRest: false });
        currentBeats += 0.25;
      } else {
        break;
      }
      continue;
    }

    // Elegir figura al azar de las candidatas
    const chosenFigure = prng.choice(candidates);
    const isRest = allowRest ? prng.chance(0.12) : false; // 12% probabilidad de silencio si está habilitado
    const b = FIGURE_BEATS[chosenFigure];
    let vexDur = FIGURE_VEX[chosenFigure];

    if (isRest) {
      vexDur = `${vexDur}r`; // 'qr', 'hr', '8r', etc. en VexFlow
    }

    tokens.push({
      figure: chosenFigure,
      beats: b,
      vexDuration: vexDur,
      isRest: isRest,
    });

    currentBeats += b;
  }

  return tokens;
}
