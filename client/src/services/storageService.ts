import type { ScoreData, ScoreConfig } from '../types/index.js';
import { BUILTIN_PRESETS, type PresetItem } from '../data/presets.js';

const STORAGE_KEY_HISTORY = 'cadenza_history_v1';
const STORAGE_KEY_PRESETS = 'cadenza_custom_presets_v1';
const MAX_HISTORY_ITEMS = 60;

export interface HistoryScoreItem {
  id: string;
  title: string;
  seed: string;
  config: ScoreConfig;
  notes: any[];
  created_at: string;
  is_favorite: boolean;
}

export const storageService = {
  // === HISTORIAL Y GUARDADOS (OFFLINE FIRST / SIN BD) ===
  getHistory(): HistoryScoreItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!raw) return [];
      return JSON.parse(raw) as HistoryScoreItem[];
    } catch (err) {
      console.error('Error al leer historial en localStorage:', err);
      return [];
    }
  },

  saveScore(score: ScoreData): HistoryScoreItem[] {
    try {
      const current = this.getHistory();
      // Evitar duplicados idénticos por ID
      const filtered = current.filter((item) => item.id !== score.id);

      const newItem: HistoryScoreItem = {
        id: score.id,
        title: score.title,
        seed: score.seed,
        config: score.config,
        notes: score.measures,
        created_at: score.createdAt || new Date().toISOString(),
        is_favorite: Boolean(score.isFavorite),
      };

      const nextHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(nextHistory));
      return nextHistory;
    } catch (err) {
      console.error('Error al guardar en localStorage:', err);
      return [];
    }
  },

  toggleFavorite(id: string): HistoryScoreItem[] {
    try {
      const current = this.getHistory();
      const updated = current.map((item) =>
        item.id === id ? { ...item, is_favorite: !item.is_favorite } : item
      );
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error('Error al alternar favorito en localStorage:', err);
      return [];
    }
  },

  deleteScore(id: string): HistoryScoreItem[] {
    try {
      const current = this.getHistory();
      const filtered = current.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(filtered));
      return filtered;
    } catch (err) {
      console.error('Error al eliminar del localStorage:', err);
      return [];
    }
  },

  // === PRESETS DEL CONSERVATORIO & PERSONALIZADOS ===
  getPresets(): PresetItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRESETS);
      const customPresets: PresetItem[] = raw ? JSON.parse(raw) : [];
      return [...BUILTIN_PRESETS, ...customPresets];
    } catch (err) {
      console.error('Error al leer presets en localStorage:', err);
      return BUILTIN_PRESETS;
    }
  },

  saveCustomPreset(name: string, config: ScoreConfig): PresetItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRESETS);
      const currentCustom: PresetItem[] = raw ? JSON.parse(raw) : [];

      const newPreset: PresetItem = {
        id: `custom-${Date.now()}`,
        name: name.trim(),
        description: 'Preset personalizado por el usuario',
        category: 'Mis Presets',
        config,
      };

      const updated = [newPreset, ...currentCustom];
      localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(updated));
      return [...BUILTIN_PRESETS, ...updated];
    } catch (err) {
      console.error('Error al guardar preset personalizado:', err);
      return BUILTIN_PRESETS;
    }
  },
};
