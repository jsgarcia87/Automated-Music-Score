import * as Tone from 'tone';
import type { ScoreData, NoteEvent } from '../types/index.js';

export class CadenzaSoundEngine {
  private synth: Tone.PolySynth | null = null;
  private metronomeSynth: Tone.MembraneSynth | null = null;
  private isInitialized = false;
  private currentScore: ScoreData | null = null;
  private speedMultiplier = 1.0;
  private metronomeEnabled = false;
  private scheduledEvents: number[] = [];

  constructor() {
    // Inicialización perezosa al reproducir para cumplir políticas de Web Audio
  }

  private async initAudio() {
    if (this.isInitialized) return;
    await Tone.start();

    // Crear sintetizador polifónico cálido tipo piano acústico/eléctrico
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle8' as any,
      },
      envelope: {
        attack: 0.01,
        decay: 1.2,
        sustain: 0.3,
        release: 1.0,
      },
    }).toDestination();

    this.synth.volume.value = -4; // Nivel cómodo de ganancia

    // Sintetizador de percusión sutil para el metrónomo
    this.metronomeSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();
    this.metronomeSynth.volume.value = -14;

    this.isInitialized = true;
  }

  public async play(
    score: ScoreData,
    onNoteActive: (noteId: string | null) => void,
    onPlaybackComplete: () => void
  ): Promise<void> {
    await this.initAudio();

    if (!this.synth) return;

    // Detener reproducción previa
    this.stop();

    this.currentScore = score;
    const baseBpm = score.config.bpm || 96;
    Tone.Transport.bpm.value = baseBpm * this.speedMultiplier;

    // Calcular duración en segundos de 1 tiempo de negra (quarter beat = 60 / bpm)
    const beatDuration = 60 / Tone.Transport.bpm.value;

    let currentTime = Tone.now() + 0.08; // Pequeño colchón inicial

    // Programar notas compás a compás
    score.measures.forEach((measure) => {
      // Metrónomo en el primer tiempo de cada compás
      if (this.metronomeEnabled && this.metronomeSynth) {
        this.metronomeSynth.triggerAttackRelease('G5', '32n', currentTime, 0.4);
      }

      measure.notes.forEach((noteEvent: NoteEvent) => {
        const noteDurationSecs = noteEvent.beats * beatDuration;

        // Proyectar evento al transport para resaltado visual
        const timerId = window.setTimeout(() => {
          onNoteActive(noteEvent.id);
        }, (currentTime - Tone.now()) * 1000);
        this.scheduledEvents.push(timerId);

        if (!noteEvent.isRest) {
          // Ajustar volumen por dinámica si existe ('p' a 'ff')
          let velocity = 0.7;
          if (noteEvent.dynamic === 'p') velocity = 0.4;
          else if (noteEvent.dynamic === 'mp') velocity = 0.55;
          else if (noteEvent.dynamic === 'mf') velocity = 0.7;
          else if (noteEvent.dynamic === 'f') velocity = 0.85;
          else if (noteEvent.dynamic === 'ff') velocity = 1.0;

          if (noteEvent.accent) velocity = Math.min(1.0, velocity + 0.25);

          const soundDuration = noteEvent.staccato
            ? noteDurationSecs * 0.35
            : noteEvent.tenuto
            ? noteDurationSecs * 0.98
            : noteDurationSecs * 0.88;

          this.synth?.triggerAttackRelease(
            noteEvent.pitch,
            soundDuration,
            currentTime,
            velocity
          );
        }

        currentTime += noteDurationSecs;
      });
    });

    // Programar final de reproducción
    const endTimer = window.setTimeout(() => {
      onNoteActive(null);
      onPlaybackComplete();
    }, (currentTime - Tone.now() + 0.2) * 1000);
    this.scheduledEvents.push(endTimer);
  }

  public pause(): void {
    Tone.Transport.pause();
    this.clearTimers();
  }

  public stop(): void {
    Tone.Transport.stop();
    this.synth?.releaseAll();
    this.clearTimers();
  }

  private clearTimers(): void {
    this.scheduledEvents.forEach((id) => window.clearTimeout(id));
    this.scheduledEvents = [];
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
    if (this.currentScore) {
      Tone.Transport.bpm.value = this.currentScore.config.bpm * multiplier;
    }
  }

  public toggleMetronome(enabled: boolean): void {
    this.metronomeEnabled = enabled;
  }

  public isMetronomeEnabled(): boolean {
    return this.metronomeEnabled;
  }
}

export const soundEngine = new CadenzaSoundEngine();
