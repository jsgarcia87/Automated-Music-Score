import { useState, useCallback, useEffect } from 'react';
import type { ScoreConfig, ScoreData } from '../types/index.js';
import { generateMelodyScore } from '../engine/melodyEngine.js';
import { validateScoreConfig, type ValidationResult } from '../engine/validator.js';
import { storageService } from '../services/storageService.js';

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
  };
}
