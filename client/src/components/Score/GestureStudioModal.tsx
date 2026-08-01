import React, { useEffect, useRef, useState } from 'react';
import { useHandTracking } from '../../hooks/useHandTracking.js';
import { gestureSynthService } from '../../services/gestureSynthService.js';
import { soundEngine } from '../../audio/soundEngine.js';
import type { KeySignature, RhythmFigure } from '../../types/index.js';
import {
  Camera,
  CameraOff,
  X,
  Sparkles,
  Music,
  Activity,
  Wand2,
  Volume2,
  VolumeX,
  Play,
  Square,
  HelpCircle
} from 'lucide-react';

interface GestureStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: KeySignature;
  onAddNoteFromGesture?: (pitch: string, duration: RhythmFigure) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

type GestureMode = 'theremin' | 'conductor' | 'composer';

export const GestureStudioModal: React.FC<GestureStudioModalProps> = ({
  isOpen,
  onClose,
  currentKey = 'C',
  onAddNoteFromGesture,
  isPlaying = false,
  onTogglePlay
}) => {
  const [mode, setMode] = useState<GestureMode>('theremin');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activePitch, setActivePitch] = useState<string>('—');
  const [activeChord, setActiveChord] = useState<string>('—');
  const [activeVolumeDb, setActiveVolumeDb] = useState<number>(-4);
  const [activeBpm, setActiveBpm] = useState<number>(96);
  const [lastCapturedNote, setLastCapturedNote] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    isCameraActive,
    error,
    rightHand,
    leftHand,
    fps,
    startCamera,
    stopCamera
  } = useHandTracking();

  // Iniciar / Detener cámara al abrir o cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      soundEngine.stopThereminNote();
    }
  }, [isOpen, stopCamera]);

  const handleStartCamera = () => {
    if (videoRef.current) {
      startCamera(videoRef.current);
    }
  };

  // Motor principal de respuesta musical a los gestos
  useEffect(() => {
    if (!isCameraActive || !soundEnabled) {
      soundEngine.stopThereminNote();
      return;
    }

    // 1. MODO THEREMIN & SINTE GESTUAL
    if (mode === 'theremin') {
      // Mano Derecha: Altura musical en la tonalidad activa
      if (rightHand) {
        const pitch = gestureSynthService.getPitchFromY(rightHand.y, currentKey);
        setActivePitch(pitch);
        soundEngine.startThereminNote(pitch);
      } else {
        soundEngine.stopThereminNote();
        setActivePitch('—');
      }

      // Mano Izquierda: Acorde de acompañamiento & Volumen por distancia
      if (leftHand) {
        const chord = gestureSynthService.getChordFromX(leftHand.x, currentKey);
        setActiveChord(chord.label);

        // Si hace gesto de pinza o mano abierta dispara el acorde
        if (leftHand.isPinching) {
          soundEngine.playChord(chord.notes, 0.7);
        }

        const volDb = gestureSynthService.getVolumeFromDistance(leftHand.y);
        setActiveVolumeDb(Math.round(volDb));
        soundEngine.setVolume(volDb);
      } else {
        setActiveChord('—');
      }
    }

    // 2. MODO DIRECTOR DE ORQUESTA (Tempo BPM & Dinámicas)
    else if (mode === 'conductor') {
      soundEngine.stopThereminNote();
      if (rightHand) {
        const bpm = gestureSynthService.getBpmFromY(rightHand.y);
        setActiveBpm(bpm);
        soundEngine.setBpmDirect(bpm);
      }
      if (leftHand) {
        const volDb = gestureSynthService.getVolumeFromDistance(leftHand.y);
        setActiveVolumeDb(Math.round(volDb));
        soundEngine.setVolume(volDb);
      }
    }

    // 3. MODO COMPOSICIÓN AÉREA (Capturar nota y enviar al pentagrama)
    else if (mode === 'composer') {
      soundEngine.stopThereminNote();
      if (rightHand) {
        const pitch = gestureSynthService.getPitchFromY(rightHand.y, currentKey);
        setActivePitch(pitch);

        // Si realiza gesto de pinza (Pinch) confirmamos la captura de la nota
        if (rightHand.isPinching && lastCapturedNote !== pitch) {
          setLastCapturedNote(pitch);
          soundEngine.playNote(pitch, 0.5);
          if (onAddNoteFromGesture) {
            onAddNoteFromGesture(pitch, 'quarter'); // Añade una negra por defecto al compás
          }
          setTimeout(() => {
            setLastCapturedNote(null);
          }, 600);
        }
      }
    }
  }, [
    isCameraActive,
    soundEnabled,
    mode,
    rightHand,
    leftHand,
    currentKey,
    lastCapturedNote,
    onAddNoteFromGesture
  ]);

  // Dibujado del esqueleto de la mano en el Canvas superpuesto
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawHandSkeleton = (landmarks: Array<{ x: number; y: number; z: number }>, color: string) => {
      // Dibujar puntos del esqueleto
      landmarks.forEach((pt, idx) => {
        const cx = pt.x * canvas.width;
        const cy = pt.y * canvas.height;

        ctx.beginPath();
        ctx.arc(cx, cy, idx === 8 || idx === 4 ? 8 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.closePath();
      });

      // Conexiones de huesos simplificadas
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],       // Pulgar
        [0, 5], [5, 6], [6, 7], [7, 8],       // Índice
        [0, 9], [9, 10], [10, 11], [11, 12],  // Medio
        [0, 13], [13, 14], [14, 15], [15, 16], // Anular
        [0, 17], [17, 18], [18, 19], [19, 20]  // Meñique
      ];

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      connections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
        ctx.closePath();
      });
    };

    if (rightHand?.landmarks) {
      drawHandSkeleton(rightHand.landmarks, '#818cf8'); // Índigo brillante
    }
    if (leftHand?.landmarks) {
      drawHandSkeleton(leftHand.landmarks, '#c084fc'); // Púrpura brillante
    }
  }, [rightHand, leftHand]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Encabezado del Estudio Gestual */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <span>ESTUDIO GESTUAL &amp; THEREMIN IA</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-300/60">
                  Webcam Hands
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toca notas, acércalas al pentagrama o dirige tu partitura en el aire en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 text-indigo-600 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 text-slate-400'
              }`}
              title={soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector de Pestañas (Las 3 modalidades combinadas) */}
        <div className="flex border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 gap-2 pt-2">
          <button
            onClick={() => setMode('theremin')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
              mode === 'theremin'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>1. Theremin &amp; Synth Gestual</span>
          </button>

          <button
            onClick={() => setMode('conductor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
              mode === 'conductor'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>2. Director de Orquesta (Tempo &amp; Dinámicas)</span>
          </button>

          <button
            onClick={() => setMode('composer')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
              mode === 'composer'
                ? 'border-pink-600 text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-800/80 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Composición Aérea (Capturar en Pentagrama)</span>
          </button>
        </div>

        {/* Cuerpo Principal del Estudio Gestual */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto">
          {/* Cámara Web y Canvas de Seguimiento */}
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-90"
                playsInline
                muted
                autoPlay
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
              />

              {!isCameraActive && (
                <div className="z-20 text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cámara Web Desactivada</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Activa tu cámara para detectar tus manos. El procesamiento de IA se ejecuta 100% en tu navegador.
                    </p>
                  </div>
                  <button
                    onClick={handleStartCamera}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                  >
                    🚀 Activar Seguimiento Gestual
                  </button>
                </div>
              )}

              {error && (
                <div className="absolute inset-x-4 bottom-4 z-30 p-3 rounded-xl bg-rose-500/90 text-white text-xs font-semibold backdrop-blur-md">
                  {error}
                </div>
              )}

              {isCameraActive && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] font-mono">
                    {fps} FPS
                  </span>
                  <button
                    onClick={stopCamera}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 text-white text-xs transition-colors"
                    title="Detener cámara"
                  >
                    <CameraOff className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Instrucciones Rápidas según Modo */}
            <div className="w-full mt-4 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>
                {mode === 'theremin' && '👉 Mano derecha vertical: cambia la altura de nota en la escala. Mano izquierda: acerca o aleja para volumen y haz pinza para acorde.'}
                {mode === 'conductor' && '👉 Mano derecha vertical: controla el Tempo (40 a 200 BPM). Mano izquierda: regula la intensidad (de pianissimo p a fortissimo ff).'}
                {mode === 'composer' && '👉 Apunta a una altura con tu mano derecha y haz el gesto de PINZA (juntar pulgar e índice) para capturar e insertar la nota en tu partitura.'}
              </span>
            </div>
          </div>

          {/* Panel de Control y Feedback en Vivo */}
          <div className="flex flex-col gap-4">
            {/* Tonalidad actual */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 block mb-1">
                Tonalidad Activa
              </span>
              <div className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center justify-between">
                <span>{currentKey} Mayor / Menor</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Armónica
                </span>
              </div>
            </div>

            {/* Medidor de Altura Musical / Nota Activa */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Nota Detectada (Mano Dcha)
              </span>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {activePitch}
                </span>
                <div className={`w-3 h-3 rounded-full ${rightHand ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
              </div>
            </div>

            {/* Medidor de Acordes / Mano Izquierda */}
            {mode === 'theremin' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Acorde Armónico (Mano Izq)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {activeChord}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${leftHand?.isPinching ? 'bg-purple-500 animate-ping' : 'bg-slate-300 dark:bg-slate-700'}`} />
                </div>
              </div>
            )}

            {/* Medidor de Tempo BPM (Conductor) */}
            {mode === 'conductor' && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Tempo Dirigido (BPM)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    {activeBpm} <span className="text-xs font-normal">BPM</span>
                  </span>
                  <button
                    onClick={onTogglePlay}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Parar' : 'Dirigir'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Medidor de Volumen */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Expresión / Volumen
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono">
                  {activeVolumeDb} dB
                </span>
                <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all"
                    style={{ width: `${Math.max(5, ((activeVolumeDb + 24) / 24) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Estado de Captura Aérea */}
            {mode === 'composer' && (
              <div className="p-4 rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-pink-600 dark:text-pink-400">
                  Captura de Notas al Pentagrama
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Haz un gesto de <strong>PINZA</strong> con tu mano derecha para enviar la nota <strong>{activePitch}</strong> al compás activo en Estudio Propio.
                </p>
                {lastCapturedNote && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center animate-bounce">
                    ✓ Nota {lastCapturedNote} insertada!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
