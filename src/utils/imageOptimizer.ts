/**
 * Utility for optimizing and compressing user-uploaded profile pictures.
 * Resizes images to a maximum 320x320 pixels with 1:1 center-crop and compresses
 * to high-quality JPEG (~20KB - 35KB).
 * 
 * Why this is crucial:
 * 1. Standard mobile phone photos are 3MB to 12MB.
 * 2. Firestore document size limit is strictly 1,048,576 bytes (~1MB).
 *    Uploading raw photos causes silent write failures in Firestore!
 * 3. Compressing to ~25KB ensures instantaneous writes to Firestore, instant cross-device
 *    syncing, and zero chance of exceeding Firestore or localStorage size quotas.
 */

export async function optimizeAvatarImageAsFile(
  input: File,
  maxSize: number = 320,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(input);
          return;
        }

        // Center crop to 1:1 square
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        const targetDim = Math.min(maxSize, minDim);
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(input);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          startX, startY, minDim, minDim,
          0, 0, targetDim, targetDim
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], input.name || 'avatar.jpg', { type: 'image/jpeg' }));
          } else {
            resolve(input);
          }
        }, 'image/jpeg', quality);
      } catch (err) {
        console.warn('Canvas image optimization fallback notice:', err);
        resolve(input);
      }
    };

    img.onload = processImage;
    img.onerror = () => resolve(input);

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(input);
  });
}

export async function optimizeAvatarImage(
  input: File | string,
  maxSize: number = 320,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(typeof input === 'string' ? input : '');
          return;
        }

        // Center crop to 1:1 square
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        const targetDim = Math.min(maxSize, minDim);
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof input === 'string' ? input : '');
          return;
        }

        // High quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          startX, startY, minDim, minDim,
          0, 0, targetDim, targetDim
        );

        // Convert to lightweight JPEG data URL
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedDataUrl);
      } catch (err) {
        console.warn('Canvas image optimization fallback notice:', err);
        // Fallback: read file directly if canvas fails
        if (typeof input === 'string') {
          resolve(input);
        } else {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(input);
        }
      }
    };

    img.onload = processImage;
    img.onerror = () => {
      if (typeof input === 'string') {
        resolve(input);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(input);
      }
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(input);
    }
  });
}
