import type { ScoreConfig } from '../types/index.js';
import { getAllowedPitches, pitchToMidi } from './scaleResolver.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateScoreConfig(config: ScoreConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Validar tesitura (rango)
  const minMidi = pitchToMidi(config.minPitch);
  const maxMidi = pitchToMidi(config.maxPitch);

  if (minMidi >= maxMidi) {
    errors.push('La nota más grave debe ser estrictamente menor que la nota más aguda.');
  }

  // 2. Validar figuras rítmicas seleccionadas
  const activeFigures = config.allowedRhythms.filter((r) => r !== 'rest');
  if (activeFigures.length === 0) {
    errors.push('Debes seleccionar al menos una figura rítmica (negra, corchea, blanca, etc.).');
  }

  // 3. Validar disponibilidad de notas en la tonalidad y con las exclusiones indicadas
  const availablePitches = getAllowedPitches(
    config.keySignature,
    config.minPitch,
    config.maxPitch,
    config.excludedPitches
  );

  if (availablePitches.length === 0) {
    errors.push('Las notas excluidas y la tesitura seleccionada no dejan ninguna nota disponible en esta tonalidad.');
  } else if (availablePitches.length < 3) {
    warnings.push('El rango de alturas disponible es muy reducido (menos de 3 notas distintas).');
  }

  // 4. Validar nota inicial y final si están configuradas
  if (config.startPitch) {
    const startMidi = pitchToMidi(config.startPitch);
    if (startMidi < minMidi || startMidi > maxMidi) {
      errors.push(`La nota inicial (${config.startPitch}) se encuentra fuera de la tesitura indicada.`);
    }
    const isExcluded = config.excludedPitches.some((ex) =>
      config.startPitch?.toLowerCase().startsWith(ex.toLowerCase())
    );
    if (isExcluded) {
      errors.push(`La nota inicial (${config.startPitch}) coincide con una nota excluida.`);
    }
  }

  if (config.endPitch) {
    const endMidi = pitchToMidi(config.endPitch);
    if (endMidi < minMidi || endMidi > maxMidi) {
      errors.push(`La nota final (${config.endPitch}) se encuentra fuera de la tesitura indicada.`);
    }
    const isExcluded = config.excludedPitches.some((ex) =>
      config.endPitch?.toLowerCase().startsWith(ex.toLowerCase())
    );
    if (isExcluded) {
      errors.push(`La nota final (${config.endPitch}) coincide con una nota excluida.`);
    }
  }

  // 5. Advertencia pedagógica de saltos imposibles
  if (config.pedagogy.maxJump > (maxMidi - minMidi) && (maxMidi - minMidi) > 0) {
    warnings.push('El salto máximo permitido supera la amplitud total de la tesitura.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
