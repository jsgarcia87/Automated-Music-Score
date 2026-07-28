import React, { useEffect, useState } from 'react';
import type { ScoreConfig } from '../../types/index.js';
import { PlusCircle, Check } from 'lucide-react';

interface PresetsTabProps {
  currentConfig: ScoreConfig;
  onSelectPreset: (config: ScoreConfig) => void;
}

export const PresetsTab: React.FC<PresetsTabProps> = ({ currentConfig, onSelectPreset }) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchPresets = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/presets');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPresets(data.data);
      }
    } catch (err) {
      console.warn('No se pudieron cargar presets del servidor SQLite:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleSaveCustomPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    try {
      const id = `user-preset-${Date.now()}`;
      await fetch('http://localhost:3001/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: newPresetName.trim(),
          description: 'Preset personalizado por usuario',
          category: 'Mis Presets',
          config: currentConfig,
        }),
      });
      setNewPresetName('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      fetchPresets();
    } catch (err) {
      console.error('Error al guardar preset:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Añadir el preset actual */}
      <form onSubmit={handleSaveCustomPreset} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          Guardar Configuración Actual
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Ej: Ejercicio 4º Curso Do Mayor..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <button
            type="submit"
            disabled={!newPresetName.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </form>

      {/* Lista de presets pedagógicos */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
          Presets Pedagógicos &amp; Conservatorio
        </label>

        {loading ? (
          <p className="text-xs text-slate-400 text-center py-6">Cargando presets de SQLite...</p>
        ) : presets.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No se encontraron presets disponibles.</p>
        ) : (
          <div className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset.config)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all shadow-sm group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {preset.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
