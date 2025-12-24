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
      // Calculate diagonal length to size text appropriately
      const diagonal = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
      const fontSize = Math.floor(diagonal * 0.1); // Font size 10% of diagonal
      
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Save context state for rotation
      ctx.save();
      
      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Rotate -45 degrees (in radians)
      ctx.rotate(-Math.PI / 4);

      // Draw text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // White with 30% opacity
      ctx.fillText(text, 0, 0);

      // Restore context state
      ctx.restore();

      // Export to base64
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = (err) => {
      reject(new Error('Failed to load image for watermarking'));
    };

    img.src = base64Image;
  });
};
