import type { KeySignature, RhythmFigure, ScoreData } from '../types/index.js';

// Mapa de alteraciones quintas en el círculo de quintas para MusicXML
const KEY_TO_FIFTHS: Record<KeySignature, number> = {
  'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6,
  'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6,
  'Am': 0, 'Em': 1, 'Bm': 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, 'D#m': 6,
  'Dm': -1, 'Gm': -2, 'Cm': -3, 'Fm': -4, 'Bbm': -5, 'Ebm': -6,
};

// Map de figura rítmica a nombre XML y duración (considerando divisions = 24 por negra)
const FIGURE_TO_XML: Record<RhythmFigure, { type: string; dur: number; dot?: boolean }> = {
  'whole':          { type: 'whole', dur: 96 },
  'dotted-half':    { type: 'half', dur: 72, dot: true },
  'half':           { type: 'half', dur: 48 },
  'dotted-quarter': { type: 'quarter', dur: 36, dot: true },
  'quarter':        { type: 'quarter', dur: 24 },
  'eighth':         { type: 'eighth', dur: 12 },
  'sixteenth':      { type: '16th', dur: 6 },
  'triplet':        { type: 'eighth', dur: 8 }, // 3 por cada negra = 24 / 3 = 8
  'rest':           { type: 'quarter', dur: 24 },
};

export function exportToMusicXML(score: ScoreData): void {
  const fifths = KEY_TO_FIFTHS[score.config.keySignature] ?? 0;
  const [beats, beatType] = score.config.timeSignature.split('/');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${score.title}</work-title>
  </work>
  <identification>
    <creator type="composer">Cadenza Studio</creator>
    <encoding>
      <software>Cadenza Studio Engine</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Melody</part-name>
    </score-part>
  </part-list>
  <part id="P1">
`;

  score.measures.forEach((measure, idx) => {
    xml += `    <measure number="${measure.number}">\n`;

    // Encabezado de atributos musicales en el primer compás
    if (idx === 0) {
      const clefSign = score.config.clef === 'bass' ? 'F' : score.config.clef === 'alto' ? 'C' : 'G';
      const clefLine = score.config.clef === 'bass' ? 4 : score.config.clef === 'alto' ? 3 : 2;

      xml += `      <attributes>
        <divisions>24</divisions>
        <key>
          <fifths>${fifths}</fifths>
        </key>
        <time>
          <beats>${beats}</beats>
          <beat-type>${beatType}</beat-type>
        </time>
        <clef>
          <sign>${clefSign}</sign>
          <line>${clefLine}</line>
        </clef>
      </attributes>\n`;
    }

    measure.notes.forEach((note) => {
      const info = FIGURE_TO_XML[note.duration] || FIGURE_TO_XML['quarter'];
      xml += `      <note>\n`;

      if (note.isRest) {
        xml += `        <rest/>\n`;
      } else {
        const alterVal = note.accidental === '#' ? 1 : note.accidental === 'b' ? -1 : 0;
        xml += `        <pitch>
          <step>${note.step.toUpperCase()}</step>
          ${alterVal !== 0 ? `<alter>${alterVal}</alter>` : ''}
          <octave>${note.octave}</octave>
        </pitch>\n`;
      }

      xml += `        <duration>${info.dur}</duration>\n`;
      xml += `        <type>${info.type}</type>\n`;
      if (info.dot) {
        xml += `        <dot/>\n`;
      }

      // Articulaciones
      const hasArticulations = note.staccato || note.accent || note.tenuto || note.fermata;
      if (hasArticulations) {
        xml += `        <notations>\n          <articulations>\n`;
        if (note.staccato) xml += `            <staccato/>\n`;
        if (note.accent) xml += `            <accent/>\n`;
        if (note.tenuto) xml += `            <tenuto/>\n`;
        if (note.fermata) xml += `            <fermata/>\n`;
        xml += `          </articulations>\n        </notations>\n`;
      }

      xml += `      </note>\n`;
    });

    xml += `    </measure>\n`;
  });

  xml += `  </part>
</score-partwise>`;

  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeTitle = score.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${safeTitle || 'partitura'}_cadenza.musicxml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
