import React, { useEffect, useState } from 'react';
import { X, Star, Trash2, RefreshCw, Edit3, Music, Clock } from 'lucide-react';
import type { ScoreData } from '../../types/index.js';
import { storageService } from '../../services/storageService.js';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScore: (score: ScoreData) => void;
  onRegenerateWithSeed: (config: any, seed: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onLoadScore,
  onRegenerateWithSeed,
}) => {
  const [scores, setScores] = useState<any[]>([]);
  const [filterFav, setFilterFav] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // 1. Carga inmediata y offline-ready desde localStorage
      const localHistory = storageService.getHistory();
      setScores(localHistory);

      // 2. Intentar actualizar desde servidor si está disponible
      fetch('http://localhost:3001/api/scores')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setScores(data.data);
          }
        })
        .catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const toggleFavorite = async (id: string) => {
    const updated = storageService.toggleFavorite(id);
    setScores(updated);
    fetch(`http://localhost:3001/api/scores/${id}/favorite`, { method: 'PUT' }).catch(() => {});
  };

  const deleteScore = async (id: string) => {
    const updated = storageService.deleteScore(id);
    setScores(updated);
    fetch(`http://localhost:3001/api/scores/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  if (!isOpen) return null;

  const filteredScores = filterFav
    ? scores.filter((s) => s.is_favorite)
    : scores;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscurecido */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
          {/* Cabecera del Cajón */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Historial &amp; Guardados
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setFilterFav(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                !filterFav
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todas las partituras
            </button>
            <button
              onClick={() => setFilterFav(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterFav
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Favoritos
            </button>
          </div>

          {/* Lista de Partituras */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-8">Cargando historial...</p>
            ) : filteredScores.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {filterFav ? 'No tienes partituras favoritas' : 'El historial está vacío'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Las melodías generadas se guardarán automáticamente aquí.
                </p>
              </div>
            ) : (
              filteredScores.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        {s.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Semilla: <span className="font-mono text-indigo-600 dark:text-indigo-400">{s.seed}</span> • {s.config?.timeSignature} • {s.config?.keySignature}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(s.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          s.is_favorite
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950'
                            : 'text-slate-400 hover:text-amber-500'
                        }`}
                        title="Favorito"
                      >
                        <Star className={`w-4 h-4 ${s.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => deleteScore(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      onClick={() => {
                        const loadedScore: ScoreData = {
                          id: s.id,
                          title: s.title,
                          seed: s.seed,
                          config: s.config,
                          measures: s.notes,
                          createdAt: s.created_at,
                          isFavorite: s.is_favorite,
                        };
                        onLoadScore(loadedScore);
                        onClose();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Cargar y Editar
                    </button>
                    <button
                      onClick={() => {
                        onRegenerateWithSeed(s.config, s.seed);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                      title="Regenerar con idéntica semilla"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Idéntica
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
