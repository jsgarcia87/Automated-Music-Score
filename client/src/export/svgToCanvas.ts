/**
 * Convierte el SVG generado nativamente por VexFlow en una imagen PNG de alta resolución (Canvas 2D),
 * preservando el 100% de los símbolos musicales (claves, plicas, plenas, alteraciones, compases)
 * sin perder glifos musicales como ocurre con los scrapers DOM (html2canvas).
 */
export async function getVexFlowCanvasImage(
  container: HTMLElement,
  scale = 2
): Promise<{ dataUrl: string; width: number; height: number }> {
  const svg = container.querySelector('svg');
  if (!svg) {
    throw new Error('No se encontró el elemento SVG de la partitura');
  }

  // 1. Obtener dimensiones reales y viewBox
  const svgWidth = parseFloat(svg.getAttribute('width') || `${container.clientWidth || 800}`);
  const svgHeight = parseFloat(svg.getAttribute('height') || `${container.clientHeight || 300}`);

  // 2. Serializar el SVG correctamente con xmlns
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);
  if (!svgString.includes('xmlns=')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // 3. Detectar color de fondo actual del tema (papel, blanco u oscuro)
  const parent = container.parentElement;
  let bgColor = '#fcfbf7'; // Fondo papel por defecto
  if (parent) {
    if (parent.className.includes('bg-slate-900') || parent.className.includes('bg-[#0f172a]')) {
      bgColor = '#0f172a';
    } else if (parent.className.includes('bg-white')) {
      bgColor = '#ffffff';
    }
  }

  // 4. Crear Blob URL del SVG vectorial
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgWidth * scale;
      canvas.height = svgHeight * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('No se pudo obtener el contexto 2D del canvas'));
      }

      // Rellenar fondo del color editorial adecuado
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar SVG en resolución 2x super nítida
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);
      resolve({
        dataUrl: canvas.toDataURL('image/png', 1.0),
        width: canvas.width,
        height: canvas.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al renderizar el SVG musical en el canvas web'));
    };

    img.src = url;
  });
}
