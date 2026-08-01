import { useEffect, useState, useCallback } from 'react';
import { useScoreGenerator } from './hooks/useScoreGenerator.js';
import { useUndoRedo } from './hooks/useUndoRedo.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { soundEngine } from './audio/soundEngine.js';
import { Navbar } from './components/Layout/Navbar.js';
import { Sidebar } from './components/Controls/Sidebar.js';
import { PlayerToolbar } from './components/Player/PlayerToolbar.js';
import { VexScoreCanvas } from './components/Score/VexScoreCanvas.js';
import { DictationOverlay } from './components/Score/DictationOverlay.js';
import { HistoryDrawer } from './components/History/HistoryDrawer.js';
import { GenerateButton } from './components/FAB/GenerateButton.js';
import { ShortcutsModal } from './components/Layout/ShortcutsModal.js';
import { ComposerStudio } from './components/Score/ComposerStudio.js';
import { GestureStudioModal } from './components/Score/GestureStudioModal.js';
import type { ScoreConfig } from './types/index.js';
import { AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const {
    config,
    setConfig,
    score,
    setScore,
    validation,
    isGenerating,
    generateScore,
    lockedParams,
    toggleLockParam,
    generateShareLink,
    isComposerMode,
    setIsComposerMode,
    createEmptyScore,
    addNoteToMeasure,
    updateNoteInScore,
    deleteNoteFromScore,
    addMeasureToScore,
    removeLastMeasureFromScore,
    clearMeasureNotes,
  } = useScoreGenerator();

  const { state: undoState, set: setUndoState, undo, redo, canUndo, canRedo } = useUndoRedo<ScoreConfig>(config);

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [paperMode] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeMeasureIndex, setActiveMeasureIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [metronome, setMetronome] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isGestureOpen, setIsGestureOpen] = useState<boolean>(false);

  // Sincronizar estado con el hook UndoRedo
  const handleConfigChange = useCallback(
    (newPartial: Partial<ScoreConfig>) => {
      setUndoState((prev) => {
        const next = { ...prev, ...newPartial };
        setConfig(next);
        return next;
      });
    },
    [setUndoState, setConfig]
  );

  // Generar melodía por defecto al montar para impactar desde el primer segundo
  useEffect(() => {
    generateScore();
  }, []);

  // Sincronizar modo oscuro en la raíz HTML
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Controles de Audio
  const handlePlay = useCallback(async () => {
    if (!score) return;
    setIsPlaying(true);
    await soundEngine.play(
      score,
      (noteId) => {
        setActiveNoteId(noteId);
      },
      () => {
        setIsPlaying(false);
        setActiveNoteId(null);
      }
    );
  }, [score]);

  const handlePause = useCallback(() => {
    soundEngine.pause();
    setIsPlaying(false);
    setActiveNoteId(null);
  }, []);

  const handleStop = useCallback(() => {
    soundEngine.stop();
    setIsPlaying(false);
    setActiveNoteId(null);
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setPlaybackSpeed(newSpeed);
    soundEngine.setSpeed(newSpeed);
  }, []);

  const handleMetronomeToggle = useCallback(() => {
    const nextVal = !metronome;
    setMetronome(nextVal);
    soundEngine.toggleMetronome(nextVal);
  }, [metronome]);

  // Atajos de teclado completos
  useKeyboardShortcuts({
    onPlayPause: () => {
      if (isPlaying) handlePause();
      else handlePlay();
    },
    onGenerate: () => {
      handleStop();
      generateScore();
    },
    onToggleMetronome: handleMetronomeToggle,
    onUndo: () => {
      if (canUndo) {
        undo();
        setConfig(undoState);
      }
    },
    onRedo: () => {
      if (canRedo) {
        redo();
        setConfig(undoState);
      }
    },
  });

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      {/* Barra de Navegación Superior */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsOpen(true)}
        isPedagogyActive={config.pedagogy.mode !== 'standard'}
        isComposerMode={isComposerMode}
        onOpenGestureModal={() => setIsGestureOpen(true)}
      />

      {/* Contenedor Principal con Sidebar y Workspace de Partitura */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel Izquierdo Colapsable (Inspirado en Notion/Figma) */}
        <Sidebar
          config={config}
          onChange={handleConfigChange}
          onSelectPreset={(presetConfig) => {
            handleConfigChange(presetConfig);
            setTimeout(() => generateScore(), 100);
          }}
          lockedParams={lockedParams}
          onToggleLock={toggleLockParam}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />

        {/* Área Central Principal */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Avisos o Errores de Validación */}
          {!validation.isValid && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-sm font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <span>Configuración imposible: </span>
                <span className="font-semibold">{validation.errors.join(' ')}</span>
              </div>
            </div>
          )}

          {validation.warnings.length > 0 && validation.isValid && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs font-medium">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{validation.warnings.join(' ')}</span>
            </div>
          )}

          {/* Selector de Modo Principal: Generación Automática vs Composición Manual */}
          <div className="flex flex-wrap items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all">
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={() => setIsComposerMode(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  !isComposerMode
                    ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-md shadow-slate-200/60 dark:shadow-indigo-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-sm">🎲</span>
                <span>Generador Automático</span>
                {!isComposerMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsComposerMode(true);
                  if (!score) createEmptyScore();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isComposerMode
                    ? 'bg-white dark:bg-amber-500 text-amber-700 dark:text-slate-950 shadow-md shadow-slate-200/60 dark:shadow-amber-500/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className="text-sm">✏️</span>
                <span>Estudio de Composición &amp; Edición</span>
                {isComposerMode && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-slate-950 animate-pulse" />
                )}
              </button>
            </div>
            <div className="px-3 py-1 text-xs font-medium flex items-center gap-2">
              {isComposerMode ? (
                <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Haz clic en el pentagrama o toca el piano virtual para crear y editar notas
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Melodías generadas algorítmicamente • Modifica parámetros en el panel izquierdo
                </span>
              )}
            </div>
          </div>

          {/* Controles de Reproducción y Exportación */}
          <PlayerToolbar
            score={score}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            speed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            metronome={metronome}
            onMetronomeToggle={handleMetronomeToggle}
          />

          {/* Contenedor de la Partitura (Soporta Modo Estándar, Papel y Dictado Melódico) */}
          <div className="flex-1 flex flex-col items-center">
            <DictationOverlay
              isDictationMode={config.pedagogy.mode === 'dictation'}
              onPlayScore={handlePlay}
            >
              <VexScoreCanvas
                score={score}
                activeNoteId={activeNoteId}
                selectedNoteId={selectedNoteId}
                onSelectNote={(noteId, mIdx) => {
                  setSelectedNoteId(noteId);
                  setActiveMeasureIndex(mIdx);
                }}
                darkMode={darkMode}
                paperMode={paperMode}
                onShareLink={generateShareLink}
              />
            </DictationOverlay>

            {isComposerMode && (
              <div className="w-full mt-4 flex justify-center">
                <ComposerStudio
                  score={score}
                  selectedNoteId={selectedNoteId}
                  activeMeasureIndex={activeMeasureIndex}
                  onSelectMeasure={setActiveMeasureIndex}
                  onAddNote={(mIdx, pitch, fig, opts) => {
                    const newId = addNoteToMeasure(mIdx, pitch, fig, opts);
                    setSelectedNoteId(newId);
                  }}
                  onUpdateNote={updateNoteInScore}
                  onDeleteNote={(id) => {
                    deleteNoteFromScore(id);
                    if (selectedNoteId === id) setSelectedNoteId(null);
                  }}
                  onAddMeasure={addMeasureToScore}
                  onRemoveLastMeasure={removeLastMeasureFromScore}
                  onClearMeasure={clearMeasureNotes}
                  onCreateEmptyScore={() => {
                    createEmptyScore();
                    setSelectedNoteId(null);
                    setActiveMeasureIndex(0);
                  }}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Botón Flotante de Generación Rápida "🎲 Generar nueva melodía" (solo visible si no estamos componendo) */}
      {!isComposerMode && (
        <GenerateButton
          onGenerate={() => {
            handleStop();
            generateScore();
          }}
          isGenerating={isGenerating}
        />
      )}

      {/* Cajón de Historial de Partituras en SQLite */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadScore={(loadedScore) => {
          handleStop();
          setScore(loadedScore);
          setConfig(loadedScore.config);
        }}
        onRegenerateWithSeed={(presetConfig, seed) => {
          handleStop();
          setConfig(presetConfig);
          generateScore(seed);
        }}
      />

      {/* Modal de Atajos de Teclado */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Modal de Synth & Theremin Gestual (Combinación IA) */}
      <GestureStudioModal
        isOpen={isGestureOpen}
        onClose={() => setIsGestureOpen(false)}
        currentKey={config.keySignature}
        onAddNoteFromGesture={(pitch, duration) => {
          addNoteToMeasure(activeMeasureIndex, pitch, duration);
        }}
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (isPlaying) handleStop();
          else handlePlay();
        }}
      />
    </div>
  );
}
