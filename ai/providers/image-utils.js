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

// ============================================================================
// IMAGE PROCESSING UTILITIES - Canvas and pixel manipulation functions
// ============================================================================

/**
 * Remove vertical divider lines from image data
 * @param {ImageData} imageData - Image data to process
 * @param {number} minHeight - Minimum height for a line to be considered a divider
 * @param {number} maxWidth - Maximum width for a divider line
 * @param {number} whiteThreshold - RGB threshold for white pixels
 * @returns {ImageData} Processed image data
 */
export function removeVerticalLines(imageData, minHeight = 50, maxWidth = 8, whiteThreshold = 190) {
  const { data, width, height } = imageData;
  const newData = new Uint8ClampedArray(data);

  // Scan for vertical divider lines
  for (let x = 0; x < width; x++) {
    // Check if this column starts a vertical line
    let lineWidth = 0;
    let lineHeight = 0;

    // Measure width of potential line starting at x
    for (let checkX = x; checkX < Math.min(width, x + maxWidth); checkX++) {
      let columnWhitePixels = 0;

      // Count white pixels in this column
      for (let y = 0; y < height; y++) {
        const idx = (y * width + checkX) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
          columnWhitePixels++;
        }
      }

      // If column is mostly white, it's part of the line
      if (columnWhitePixels >= minHeight) {
        lineWidth++;
        lineHeight = Math.max(lineHeight, columnWhitePixels);
      } else {
        break; // Line ended
      }
    }

    // If we found a qualifying vertical line, remove it
    if (lineWidth <= maxWidth && lineHeight >= minHeight) {
      for (let removeX = x; removeX < x + lineWidth; removeX++) {
        for (let y = 0; y < height; y++) {
          const idx = (y * width + removeX) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Keep divider pixels as solid white
          if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
            newData[idx] = 255;     // R
            newData[idx + 1] = 255; // G
            newData[idx + 2] = 255; // B
            newData[idx + 3] = 255; // A (fully opaque white)
          }
        }
      }

      // Skip ahead past this line
      x += lineWidth - 1;
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Smart white background removal with smooth text borders and shadow effects
 * @param {ImageData} imageData - Image data to process
 * @param {number} textPreservationRadius - Radius around text to preserve
 * @param {number} whiteThreshold - RGB threshold for white pixels
 * @param {number} shadowOffset - Offset for shadow effect
 * @param {number} shadowBlur - Blur amount for shadow
 * @returns {ImageData} Processed image data with transparent background
 */
export function removeWhiteBackgroundSmart(imageData, textPreservationRadius = 2, whiteThreshold = 255, shadowOffset = 0, shadowBlur = 4) {
  const { data, width, height } = imageData;
  const newData = new Uint8ClampedArray(data);

  // First pass: identify text/logo areas and create distance maps
  const isText = new Array(width * height).fill(false);
  const distanceToText = new Array(width * height).fill(Infinity);

  // Identify text pixels (non-white pixels)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixelIdx = y * width + x;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold) {
        isText[pixelIdx] = true;
        distanceToText[pixelIdx] = 0;
      }
    }
  }

  // Calculate distance field using approximated distance transform
  const maxRadius = Math.max(textPreservationRadius, shadowOffset + shadowBlur);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIdx = y * width + x;
      if (!isText[pixelIdx]) {
        let minDistance = Infinity;

        // Check surrounding area for text pixels
        for (let dy = -maxRadius; dy <= maxRadius; dy++) {
          for (let dx = -maxRadius; dx <= maxRadius; dx++) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const nearPixelIdx = ny * width + nx;
              if (isText[nearPixelIdx]) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                minDistance = Math.min(minDistance, distance);
              }
            }
          }
        }
        distanceToText[pixelIdx] = minDistance;
      }
    }
  }

  // Second pass: apply smooth borders and shadows
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixelIdx = y * width + x;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const distance = distanceToText[pixelIdx];

      // Handle text pixels (darken and enhance)
      if (isText[pixelIdx]) {
        // Darken text by reducing RGB values (0.95 = 5% darker)
        const darkenFactor = 0.95;
        newData[idx] = Math.round(r * darkenFactor);
        newData[idx + 1] = Math.round(g * darkenFactor);
        newData[idx + 2] = Math.round(b * darkenFactor);
        newData[idx + 3] = 255;
        continue;
      }

      // Handle white pixels near text with smooth borders
      if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
        if (distance <= textPreservationRadius) {
          // Smooth border area - create anti-aliased edge
          const borderFactor = distance / textPreservationRadius;
          const smoothFactor = Math.max(0, 1 - borderFactor);

          // Create white border with smooth alpha transition
          newData[idx] = 255;
          newData[idx + 1] = 255;
          newData[idx + 2] = 255;
          newData[idx + 3] = Math.round(255 * Math.pow(smoothFactor, 0.9)); // Smooth falloff
        } else if (distance <= shadowOffset + shadowBlur) {
          // Shadow area
          const shadowDistance = distance - textPreservationRadius;
          const shadowFactor = Math.max(0, 1 - (shadowDistance - shadowOffset) / shadowBlur);

          if (shadowFactor > 0) {
            // Create soft shadow effect
            const shadowAlpha = Math.round(80 * shadowFactor * shadowFactor); // Quadratic falloff for softer shadow
            newData[idx] = 140;     // Dark shadow color
            newData[idx + 1] = 140;
            newData[idx + 2] = 140;
            newData[idx + 3] = shadowAlpha;
          } else {
            // Fully transparent
            newData[idx + 3] = 0;
          }
        } else {
          // Far from text - fully transparent
          newData[idx + 3] = 0;
        }
      } else {
        // Non-white pixels - keep original with possible enhancement
        newData[idx] = r;
        newData[idx + 1] = g;
        newData[idx + 2] = b;
        newData[idx + 3] = data[idx + 3];
      }
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Remove dividers from original image
 * @param {ImageBitmap} bitmap - Image bitmap
 * @returns {Promise<ImageBitmap>} Processed image bitmap
 */
export async function removeDividersFromImage(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(bitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processedImageData = removeVerticalLines(imageData);
  ctx.putImageData(processedImageData, 0, 0);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

/**
 * Upscale image for better quality processing
 * @param {ImageBitmap} bitmap - Image bitmap
 * @param {number} scaleFactor - Scale multiplier (default: 2)
 * @returns {Promise<ImageBitmap>} Upscaled image bitmap
 */
export async function upscaleImage(bitmap, scaleFactor = 2) {
  const canvas = new OffscreenCanvas(bitmap.width * scaleFactor, bitmap.height * scaleFactor);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

/**
 * Downscale image back to target dimensions
 * @param {ImageBitmap} bitmap - Image bitmap
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @returns {Promise<ImageBitmap>} Downscaled image bitmap
 */
export async function downscaleImage(bitmap, targetWidth, targetHeight) {
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

/**
 * Make white background transparent while preserving text
 * @param {ImageBitmap} bitmap - Image bitmap
 * @returns {Promise<ImageBitmap>} Image with transparent background
 */
export async function makeBackgroundTransparent(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processedImageData = removeWhiteBackgroundSmart(imageData, 6, 255, 0, 2);
  ctx.putImageData(processedImageData, 0, 0);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

/**
 * Resize AI generated image to match original dimensions
 * @param {ImageBitmap} generatedBitmap - AI generated image
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @returns {Promise<ImageBitmap>} Resized image bitmap
 */
export async function resizeAiImage(generatedBitmap, targetWidth, targetHeight) {
  const originalAspectRatio = targetWidth / targetHeight;
  const generatedAspectRatio = generatedBitmap.width / generatedBitmap.height;

  let processedBitmap = generatedBitmap;

  if (Math.abs(originalAspectRatio - generatedAspectRatio) > 0.01) {
    const tempCanvas = new OffscreenCanvas(generatedBitmap.width, generatedBitmap.height);
    const tempCtx = tempCanvas.getContext('2d');

    let cropWidth = generatedBitmap.width;
    let cropHeight = generatedBitmap.height;
    let cropX = 0;
    let cropY = 0;

    if (generatedAspectRatio > originalAspectRatio) {
      cropWidth = Math.floor(generatedBitmap.height * originalAspectRatio);
      cropX = Math.floor((generatedBitmap.width - cropWidth) / 2);
    } else {
      cropHeight = Math.floor(generatedBitmap.width / originalAspectRatio);
      const totalCrop = generatedBitmap.height - cropHeight;
      cropY = Math.floor(totalCrop * 0.75);
    }

    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    tempCtx.drawImage(generatedBitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const croppedBlob = await tempCanvas.convertToBlob();
    processedBitmap = await createImageBitmap(croppedBlob);
  }

  return processedBitmap;
}
