import React, { useState } from 'react';
import type { ScoreConfig } from '../../types/index.js';
import { MusicalConfigTab } from './MusicalConfigTab.js';
import { RangeExclusionsTab } from './RangeExclusionsTab.js';
import { RhythmSymbolsTab } from './RhythmSymbolsTab.js';
import { PedagogyTab } from './PedagogyTab.js';
import { PresetsTab } from './PresetsTab.js';
import { Sliders, Ban, Clock, Award, Bookmark, Undo2, Redo2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  config: ScoreConfig;
  onChange: (newConfig: Partial<ScoreConfig>) => void;
  onSelectPreset: (config: ScoreConfig) => void;
  lockedParams: Set<string>;
  onToggleLock: (paramKey: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

type TabKey = 'musical' | 'range' | 'rhythm' | 'pedagogy' | 'presets';

const TABS: { id: TabKey; label: string; icon: any }[] = [
  { id: 'musical', label: 'Tonalidad & Compás', icon: Sliders },
  { id: 'range', label: 'Rango & Exclusión', icon: Ban },
  { id: 'rhythm', label: 'Ritmo & Articulación', icon: Clock },
  { id: 'pedagogy', label: 'Ejercicios pedagógicos', icon: Award },
  { id: 'presets', label: 'Presets & Conservatorio', icon: Bookmark },
];

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onChange,
  onSelectPreset,
  lockedParams,
  onToggleLock,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('musical');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 1024 : false;
  });

  return (
    <>
      {/* Overlay de fondo en móvil cuando el panel está abierto */}
      {!isCollapsed && (
        <div
          onClick={() => setIsCollapsed(true)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-30 ${
          isCollapsed
            ? 'w-14 sm:w-16 relative'
            : 'fixed md:relative inset-y-0 left-0 w-80 lg:w-96 shadow-2xl md:shadow-none h-full'
        }`}
      >
        {/* Botón de Colapsar / Expandir (Estilo Notion/Figma Premium) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-900/10 flex items-center justify-center text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110 active:scale-95 transition-all z-40"
          title={isCollapsed ? 'Expandir panel' : 'Colapsar panel'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

      {/* Cabecera del Sidebar con Deshacer / Rehacer */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Parámetros de Generación
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Deshacer cambio (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Rehacer cambio (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navegación por pestañas vertical o colapsada */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 border-b-2 transition-all duration-200 ${
                active
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-gradient-to-b from-indigo-500/10 via-indigo-500/5 to-transparent font-bold shadow-xs'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
              }`}
              title={tab.label}
            >
              <Icon className={`w-4 h-4 ${active ? 'scale-110 text-indigo-600 dark:text-indigo-400' : ''} transition-transform`} />
              {!isCollapsed && (
                <span className="text-[10px] mt-1.5 tracking-tight truncate max-w-[64px]">
                  {tab.label.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido de la pestaña activa */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'musical' && (
            <MusicalConfigTab
              config={config}
              onChange={onChange}
              lockedParams={lockedParams}
              onToggleLock={onToggleLock}
            />
          )}
          {activeTab === 'range' && (
            <RangeExclusionsTab config={config} onChange={onChange} />
          )}
          {activeTab === 'rhythm' && (
            <RhythmSymbolsTab config={config} onChange={onChange} />
          )}
          {activeTab === 'pedagogy' && (
            <PedagogyTab config={config} onChange={onChange} />
          )}
          {activeTab === 'presets' && (
            <PresetsTab currentConfig={config} onSelectPreset={onSelectPreset} />
          )}
        </div>
      )}
    </aside>
    </>
  );
};
