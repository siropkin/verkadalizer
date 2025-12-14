// ============================================================================
// IMAGE UTILITIES - Shared utilities for image processing and aspect ratios
// ============================================================================

/**
 * Convert a Blob to base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} Base64 string without data URL prefix
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = String(reader.result).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetch an image from a URL and return as Blob
 * @param {string} imageUrl - URL of the image
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<Blob>} Image blob
 */
export async function fetchImageAsBlob(imageUrl, signal) {
  try {
    const response = await fetch(imageUrl, { signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    // Normalize AbortError
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

/**
 * Calculate the greatest common divisor using Euclid's algorithm
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} GCD of a and b
 */
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Calculate aspect ratio from dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Object} Aspect ratio { width, height, decimal, string }
 */
export function calculateAspectRatio(width, height) {
  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;
  const decimal = width / height;

  return {
    width: ratioWidth,
    height: ratioHeight,
    decimal,
    string: `${ratioWidth}:${ratioHeight}`
  };
}

/**
 * Get image dimensions from a Blob
 * Works in both browser and service worker contexts
 * @param {Blob} imageBlob - Image blob
 * @returns {Promise<{width: number, height: number}>} Image dimensions
 */
export async function getImageDimensions(imageBlob) {
  // Try createImageBitmap first (works in service workers)
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(imageBlob);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close(); // Clean up
      return dimensions;
    } catch (error) {
      console.warn('[IMAGE-UTILS] createImageBitmap failed, trying Image fallback:', error);
    }
  }

  // Fallback to Image API (works in regular browser contexts)
  if (typeof Image !== 'undefined') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // If neither API is available, throw error
  throw new Error('No image dimension detection API available in this context');
}

/**
 * Find the closest matching aspect ratio from a list of standard ratios
 * @param {number} targetRatio - Target aspect ratio as decimal (width/height)
 * @param {Array<string>} availableRatios - Available aspect ratios (e.g., ['16:9', '4:3'])
 * @returns {string} Best matching aspect ratio string
 */
export function findClosestAspectRatio(targetRatio, availableRatios) {
  let closestRatio = availableRatios[0];
  let smallestDifference = Infinity;

  for (const ratio of availableRatios) {
    const [w, h] = ratio.split(':').map(Number);
    const ratioDecimal = w / h;
    const difference = Math.abs(targetRatio - ratioDecimal);

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestRatio = ratio;
    }
  }

  return closestRatio;
}


