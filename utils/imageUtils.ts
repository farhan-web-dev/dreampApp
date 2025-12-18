/**
 * Adds a watermark to a base64 image.
 * @param base64Image The source image in base64 format (with data URI prefix).
 * @param text The watermark text to add.
 * @returns A promise that resolves to the watermarked image as a base64 string.
 */
export const addWatermark = (base64Image: string, text: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS if needed, though usually not for base64

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark style
      // Scale font size based on image width (e.g., 3% of width)
      const fontSize = Math.max(24, Math.floor(canvas.width * 0.03)); 
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      // Margins
      const marginX = Math.floor(canvas.width * 0.02);
      const marginY = Math.floor(canvas.height * 0.02);

      const x = canvas.width - marginX;
      const y = canvas.height - marginY;

      // Add shadow/outline for readability on any background
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.strokeText(text, x, y);

      // Draw text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(text, x, y);

      // Export to base64
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for watermarking'));
    };

    img.src = base64Image;
  });
};
