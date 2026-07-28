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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 ${
        isCollapsed ? 'w-16' : 'w-80 lg:w-96'
      }`}
    >
      {/* Botón de Colapsar / Expandir (Estilo Notion/Figma) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors z-30"
        title={isCollapsed ? 'Expandir panel' : 'Colapsar panel'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Cabecera del Sidebar con Deshacer / Rehacer */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Parámetros de Generación
          </span>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Deshacer cambio (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Rehacer cambio (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navegación por pestañas vertical o colapsada */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
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
              className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 border-b-2 transition-all ${
                active
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
              title={tab.label}
            >
              <Icon className="w-4 h-4" />
              {!isCollapsed && (
                <span className="text-[10px] mt-1 truncate max-w-[64px]">
                  {tab.label.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido de la pestaña activa */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-5">
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
  );
};
