import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'cadenza.db');
export const db = new Database(dbPath);

// Activar WAL mode para mejor rendimiento
db.pragma('journal_mode = WAL');

// Crear tablas de historial y presets
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    seed TEXT NOT NULL,
    config_json TEXT NOT NULL,
    notes_json TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    config_json TEXT NOT NULL,
    is_default INTEGER DEFAULT 0
  );
`);

// Precargar presets pedagógicos de conservatorio y escuelas de música si está vacía
const presetCount = db.prepare('SELECT COUNT(*) as count FROM presets').get() as { count: number };

if (presetCount.count === 0) {
  const insertPreset = db.prepare(`
    INSERT INTO presets (id, name, description, category, config_json, is_default)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const defaultPresets = [
    {
      id: 'conservatorio-gr-1',
      name: '1º Grado - Lectura Diatónica Fácil',
      description: 'Compás de 2/4 en Do Mayor, figuras sencillas (negra, blanca y silencio de negra) en clave de Sol.',
      category: 'Conservatorio - Elemental',
      config_json: JSON.stringify({
        clef: 'treble',
        keySignature: 'C',
        timeSignature: '2/4',
        bpm: 80,
        numMeasures: 8,
        minPitch: 'C4',
        maxPitch: 'C5',
        excludedPitches: [],
        allowedRhythms: ['quarter', 'half', 'rest'],
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
          allowedIntervals: [2, 3],
          maxJump: 3,
          stepwisePercentage: 85,
          usePassingNotes: true,
        },
      }),
      is_default: 1,
    },
    {
      id: 'arpegios-6-8',
      name: 'Arpegios y Saltos en 6/8',
      description: 'Compás compuesto 6/8 en La Menor con corcheas y saltos de arpegio (3ª, 4ª y 5ª).',
      category: 'Conservatorio - Intermedio',
      config_json: JSON.stringify({
        clef: 'treble',
        keySignature: 'Am',
        timeSignature: '6/8',
        bpm: 96,
        numMeasures: 8,
        minPitch: 'A3',
        maxPitch: 'E5',
        excludedPitches: [],
        allowedRhythms: ['eighth', 'dotted-quarter'],
        symbols: {
          ties: true,
          fermata: true,
          repeats: true,
          accents: true,
          staccato: true,
          tenuto: false,
          dynamics: true,
        },
        pedagogy: {
          mode: 'standard',
          difficulty: 'intermediate',
          allowedIntervals: [2, 3, 4, 5],
          maxJump: 5,
          stepwisePercentage: 60,
          usePassingNotes: true,
        },
      }),
      is_default: 1,
    },
    {
      id: 'dictado-melodico-fa',
      name: 'Dictado Melódico en Clave de Fa',
      description: 'Ejercicio de entrenamiento auditivo en clave de Fa, Sol Mayor (4 compases).',
      category: 'Dictado & Auditivo',
      config_json: JSON.stringify({
        clef: 'bass',
        keySignature: 'G',
        timeSignature: '4/4',
        bpm: 72,
        numMeasures: 4,
        minPitch: 'G2',
        maxPitch: 'D4',
        excludedPitches: [],
        allowedRhythms: ['quarter', 'half', 'eighth'],
        symbols: {
          ties: false,
          fermata: false,
          repeats: true,
          accents: false,
          staccato: false,
          tenuto: false,
          dynamics: true,
        },
        pedagogy: {
          mode: 'dictation',
          difficulty: 'intermediate',
          allowedIntervals: [2, 3, 4],
          maxJump: 4,
          stepwisePercentage: 75,
          usePassingNotes: true,
        },
      }),
      is_default: 1,
    },
    {
      id: 'cromatismos-avanzado',
      name: 'Estudio Técnico Cromático y Tresillos',
      description: 'Desafío avanzado en Re Menor con tresillos, semicorcheas y saltos melódicos amplios.',
      category: 'Conservatorio - Avanzado',
      config_json: JSON.stringify({
        clef: 'treble',
        keySignature: 'Dm',
        timeSignature: '3/4',
        bpm: 108,
        numMeasures: 8,
        minPitch: 'D4',
        maxPitch: 'A5',
        excludedPitches: [],
        allowedRhythms: ['quarter', 'eighth', 'sixteenth', 'triplet', 'rest'],
        symbols: {
          ties: true,
          fermata: true,
          repeats: false,
          accents: true,
          staccato: true,
          tenuto: true,
          dynamics: true,
        },
        pedagogy: {
          mode: 'sight-reading',
          difficulty: 'advanced',
          allowedIntervals: [2, 3, 4, 5, 6, 8],
          maxJump: 8,
          stepwisePercentage: 50,
          usePassingNotes: true,
        },
      }),
      is_default: 1,
    },
  ];

  for (const preset of defaultPresets) {
    insertPreset.run(
      preset.id,
      preset.name,
      preset.description,
      preset.category,
      preset.config_json,
      preset.is_default
    );
  }
}
