import { useState, useRef, useCallback, useEffect } from 'react';
import type { Hands, Results } from '@mediapipe/hands';
import type { Camera } from '@mediapipe/camera_utils';
import { gestureSynthService } from '../services/gestureSynthService.js';

async function loadMediaPipe(): Promise<{ Hands: any; Camera: any }> {
  if ((window as any).Hands && (window as any).Camera) {
    return {
      Hands: (window as any).Hands,
      Camera: (window as any).Camera,
    };
  }

  const loadScript = (url: string, globalName: string) =>
    new Promise<void>((resolve, reject) => {
      if ((window as any)[globalName]) return resolve();
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${globalName}`)));
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });

  await Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js', 'Hands'),
    loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js', 'Camera'),
  ]);

  const HandsCtor = (window as any).Hands;
  const CameraCtor = (window as any).Camera;

  if (!HandsCtor || !CameraCtor) {
    throw new Error('MediaPipe no se pudo inicializar en el navegador.');
  }

  return { Hands: HandsCtor, Camera: CameraCtor };
}

export interface HandGestureState {
  x: number; // 0 (left) - 1 (right)
  y: number; // 0 (top) - 1 (bottom)
  isPinching: boolean;
  isOpen: boolean;
  landmarks: Array<{ x: number; y: number; z: number }>;
}

export interface UseHandTrackingReturn {
  isCameraActive: boolean;
  error: string | null;
  rightHand: HandGestureState | null;
  leftHand: HandGestureState | null;
  fps: number;
  startCamera: (videoElement: HTMLVideoElement) => void;
  stopCamera: () => void;
}

export const useHandTracking = (): UseHandTrackingReturn => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rightHand, setRightHand] = useState<HandGestureState | null>(null);
  const [leftHand, setLeftHand] = useState<HandGestureState | null>(null);
  const [fps, setFps] = useState(0);

  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());

  const parseHandState = (landmarks: Array<{ x: number; y: number; z: number }>): HandGestureState => {
    // Índice: landmark 8, pulgar: landmark 4, muñeca: 0
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const pinkyTip = landmarks[20];

    const pinchDist = gestureSynthService.calculateDistance(indexTip, thumbTip);
    const isPinching = pinchDist < 0.06;

    const spanDist = gestureSynthService.calculateDistance(thumbTip, pinkyTip);
    const isOpen = spanDist > 0.18;

    return {
      x: indexTip.x,
      y: indexTip.y,
      isPinching,
      isOpen,
      landmarks
    };
  };

  const onResults = useCallback((results: Results) => {
    // Calcular FPS
    frameCountRef.current += 1;
    const now = Date.now();
    if (now - lastFpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setRightHand(null);
      setLeftHand(null);
      return;
    }

    let nextRight: HandGestureState | null = null;
    let nextLeft: HandGestureState | null = null;

    results.multiHandLandmarks.forEach((landmarks: any, index: number) => {
      const classification = results.multiHandedness?.[index]?.label || (index === 0 ? 'Right' : 'Left');
      // Importante: La cámara web en espejo invierte 'Right' y 'Left' por defecto de MediaPipe
      const handState = parseHandState(landmarks);
      if (classification === 'Right') {
        nextLeft = handState; // En espejo el usuario ve su mano izquierda en la cámara
      } else {
        nextRight = handState;
      }
    });

    setRightHand(nextRight);
    setLeftHand(nextLeft);
  }, []);

  const startCamera = useCallback(async (videoElement: HTMLVideoElement) => {
    if (cameraRef.current) return;
    setError(null);

    try {
      const { Hands: HandsCtor, Camera: CameraCtor } = await loadMediaPipe();

      const hands = new HandsCtor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const camera = new CameraCtor(videoElement, {
        onFrame: async () => {
          if (handsRef.current && videoElement.readyState >= 2) {
            await handsRef.current.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });

      camera.start().then(() => {
        setIsCameraActive(true);
      }).catch((err: any) => {
        setError('No se pudo acceder a la cámara web: ' + err.message);
        setIsCameraActive(false);
      });

      cameraRef.current = camera;
    } catch (e: any) {
      setError('Error inicializando MediaPipe Hands: ' + e.message);
    }
  }, [onResults]);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setIsCameraActive(false);
    setRightHand(null);
    setLeftHand(null);
    setFps(0);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isCameraActive,
    error,
    rightHand,
    leftHand,
    fps,
    startCamera,
    stopCamera
  };
};
