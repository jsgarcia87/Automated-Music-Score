import React, { useEffect, useState } from 'react';
import type { ScoreConfig } from '../../types/index.js';
import { PlusCircle, Check, Bookmark, Sparkles, FolderHeart } from 'lucide-react';
import { storageService } from '../../services/storageService.js';

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
      // 1. Carga inmediata sin servidor de los presets del conservatorio y del usuario
      const localPresets = storageService.getPresets();
      setPresets(localPresets);

      // 2. Intentar combinar con servidor REST si estuviera activo
      fetch('http://localhost:3001/api/presets')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setPresets(data.data);
          }
        })
        .catch(() => {});
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

    const updated = storageService.saveCustomPreset(newPresetName, currentConfig);
    setPresets(updated);
    setNewPresetName('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    // Opcional: sincronizar con servidor si existe
    fetch('http://localhost:3001/api/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `user-preset-${Date.now()}`,
        name: newPresetName.trim(),
        description: 'Preset personalizado por usuario',
        category: 'Mis Presets',
        config: currentConfig,
      }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-6">
      {/* Añadir el preset actual */}
      <form onSubmit={handleSaveCustomPreset} className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2.5">
          <Bookmark className="w-4 h-4 text-indigo-500" />
          <span>Guardar Configuración Actual</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Ej: Ejercicio 4º Curso Do Mayor..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!newPresetName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <PlusCircle className="w-4 h-4" />}
            <span>{savedSuccess ? 'Guardado' : 'Guardar'}</span>
          </button>
        </div>
      </form>

      {/* Lista de presets pedagógicos */}
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <FolderHeart className="w-4 h-4 text-purple-500" />
          <span>Presets Pedagógicos &amp; Conservatorio</span>
        </label>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Sparkles className="w-6 h-6 animate-spin-slow mb-2 text-indigo-500" />
            <p className="text-xs">Cargando presets de SQLite...</p>
          </div>
        ) : presets.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No se encontraron presets disponibles.</p>
        ) : (
          <div className="space-y-2.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset.config)}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md hover:scale-[1.01] group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                      {preset.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 whitespace-nowrap shadow-2xs">
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

