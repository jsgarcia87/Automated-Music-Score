import jsPDF from 'jspdf';
import type { ScoreData } from '../types/index.js';
import { getVexFlowCanvasImage } from './svgToCanvas.js';

export async function exportToPdf(score: ScoreData): Promise<void> {
  const container = document.getElementById('vexflow-canvas-export');
  if (!container) {
    alert('No se encontró la partitura en pantalla para exportar.');
    return;
  }

  try {
    const { dataUrl, width: canvasWidth, height: canvasHeight } = await getVexFlowCanvasImage(container, 2);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Encabezado editorial elegante del conservatorio / escuela
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(score.title, 20, 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(
      `Clave: ${score.config.clef === 'treble' ? 'Sol' : score.config.clef === 'bass' ? 'Fa' : 'Do'} | Tonalidad: ${score.config.keySignature} | Compás: ${score.config.timeSignature} | Tempo: ${score.config.bpm} BPM`,
      20,
      27
    );

    pdf.text(`Semilla determinista: ${score.seed} — Cadenza Studio AI`, 20, 32);

    // Calcular proporción de imagen super nítida con todos los símbolos musicales
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvasHeight * imgWidth) / canvasWidth;

    const yPosition = 40;

    if (imgHeight > pageHeight - 55) {
      // Ajustar si la partitura es muy alta
      const adjustedHeight = pageHeight - 55;
      const adjustedWidth = (canvasWidth * adjustedHeight) / canvasHeight;
      pdf.addImage(dataUrl, 'PNG', 20, yPosition, adjustedWidth, adjustedHeight);
    } else {
      pdf.addImage(dataUrl, 'PNG', 20, yPosition, imgWidth, imgHeight);
    }

    // Pie de página pedagógico
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      'Generado automáticamente con Cadenza Studio — Herramienta Profesional de Práctica y Pedagogía Musical',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    const safeTitle = score.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    pdf.save(`${safeTitle || 'partitura'}_cadenza.pdf`);
  } catch (err) {
    console.error('Error al generar PDF:', err);
    alert('Ocurrió un error al generar el archivo PDF con la partitura musical.');
  }
}
