// @ts-ignore
import MidiWriter from 'midi-writer-js';
import type { ScoreData, RhythmFigure } from '../types/index.js';

// Convierte figura rítmica a duración en ticks de midi-writer-js
const FIGURE_TO_MIDI_DURATION: Record<RhythmFigure, string> = {
  'whole': '1',
  'dotted-half': '2d',
  'half': '2',
  'dotted-quarter': '4d',
  'quarter': '4',
  'eighth': '8',
  'sixteenth': '16',
  'triplet': '8t',
  'rest': '4',
};

export function exportToMidi(score: ScoreData): void {
  const track = new MidiWriter.Track();

  // Establecer tempo en BPM
  track.setTempo(score.config.bpm || 96);

  // Añadir el nombre de pista y autor
  track.addTrackName(`${score.title} — Cadenza Studio`);

  score.measures.forEach((measure) => {
    measure.notes.forEach((note) => {
      const dur = FIGURE_TO_MIDI_DURATION[note.duration] || '4';

      if (note.isRest) {
        track.addEvent(
          new MidiWriter.NoteEvent({
            pitch: ['C4'], // Altura ficticia en silencio
            duration: dur,
            wait: dur,     // En silencio avanzamos tiempo con wait
            velocity: 0,
          })
        );
      } else {
        // Velocidad MIDI según dinámica
        let velocity = 85;
        if (note.dynamic === 'p') velocity = 50;
        else if (note.dynamic === 'mp') velocity = 68;
        else if (note.dynamic === 'mf') velocity = 85;
        else if (note.dynamic === 'f') velocity = 105;
        else if (note.dynamic === 'ff') velocity = 127;

        if (note.accent) velocity = Math.min(127, velocity + 25);

        track.addEvent(
          new MidiWriter.NoteEvent({
            pitch: [note.pitch],
            duration: dur,
            velocity: velocity,
          })
        );
      }
    });
  });

  const write = new MidiWriter.Writer([track]);
  const dataUri = write.dataUri();

  // Crear elemento enlace para descargar
  const link = document.createElement('a');
  link.href = dataUri;
  const safeTitle = score.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${safeTitle || 'partitura'}_cadenza.mid`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
