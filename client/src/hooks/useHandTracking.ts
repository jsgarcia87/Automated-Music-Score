import { useState, useRef, useCallback, useEffect } from 'react';
import type { Hands, Results } from '@mediapipe/hands';
import type { Camera } from '@mediapipe/camera_utils';
import * as mpHands from '@mediapipe/hands';
import * as mpCamera from '@mediapipe/camera_utils';
import { gestureSynthService } from '../services/gestureSynthService.js';

const getHandsClass = () => (window as any).Hands || (mpHands as Record<string, any>)['Hands'] || (mpHands as Record<string, any>)['default']?.['Hands'];
const getCameraClass = () => (window as any).Camera || (mpCamera as Record<string, any>)['Camera'] || (mpCamera as Record<string, any>)['default']?.['Camera'];

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

  const startCamera = useCallback((videoElement: HTMLVideoElement) => {
    if (cameraRef.current) return;
    setError(null);

    try {
      const HandsCtor = getHandsClass();
      const hands = new HandsCtor({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      const CameraCtor = getCameraClass();
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
