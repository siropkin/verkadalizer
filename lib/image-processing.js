// ============================================================================
// IMAGE PROCESSING - Image manipulation and transformation functions
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
 * Remove vertical divider lines from image data
 * @param {ImageData} imageData - Image data to process
 * @param {number} minHeight - Minimum height for a line to be considered a divider
 * @param {number} maxWidth - Maximum width for a divider line
 * @param {number} whiteThreshold - RGB threshold for white pixels
 * @returns {ImageData} Processed image data
 */
function removeVerticalLines(imageData, minHeight = 50, maxWidth = 8, whiteThreshold = 190) {
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
function removeWhiteBackgroundSmart(imageData, textPreservationRadius = 2, whiteThreshold = 245, shadowOffset = 0, shadowBlur = 4) {
  const { data, width, height } = imageData;
  const newData = new Uint8ClampedArray(data);

  const lumaAt = (idx) => (0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]);
  const satAt = (idx) => {
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === 0) return 0;
    return (max - min) / max;
  };

  // Detect if this is a dark menu (dark background + light text)
  let sumLuma = 0;
  let samples = 0;
  const sampleStep = Math.max(1, Math.floor((width * height) / 50000)); // ~50k samples max
  for (let i = 0; i < width * height; i += sampleStep) {
    sumLuma += lumaAt(i * 4);
    samples++;
  }
  const avgLuma = samples ? (sumLuma / samples) : 255;
  const isDarkMenu = avgLuma < 150;

  // First pass: identify ink pixels and create distance maps
  const isInk = new Array(width * height).fill(false);
  const distanceToInk = new Array(width * height).fill(Infinity);

  // Ink detection tuned to avoid "noisy translation backgrounds"
  // Light menus: keep dark pixels + moderately-dark saturated pixels (colored markers)
  // Dark menus: keep bright pixels + bright saturated pixels
  const INK_DARK_LUMA = 200;
  const INK_BRIGHT_LUMA = 225;
  const INK_SAT = 0.35;
  const INK_MAX_LUMA_FOR_SAT = 220;
  const INK_MIN_LUMA_FOR_SAT_DARK_MENU = 200;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixelIdx = y * width + x;
      const luma = lumaAt(idx);
      const sat = satAt(idx);

      let ink = false;
      if (!isDarkMenu) {
        ink = (luma < INK_DARK_LUMA) || (sat > INK_SAT && luma < INK_MAX_LUMA_FOR_SAT);
      } else {
        ink = (luma > INK_BRIGHT_LUMA) || (sat > INK_SAT && luma > INK_MIN_LUMA_FOR_SAT_DARK_MENU);
      }

      if (ink) {
        isInk[pixelIdx] = true;
        distanceToInk[pixelIdx] = 0;
      }
    }
  }

  // Speckle suppression: drop isolated ink pixels (common in noisy translated layers)
  const MIN_NEIGHBORS = 2;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIdx = y * width + x;
      if (!isInk[pixelIdx]) continue;
      const idx = pixelIdx * 4;
      const luma = lumaAt(idx);

      const strongInk = (!isDarkMenu && luma < 120) || (isDarkMenu && luma > 245);
      if (strongInk) continue;

      let neighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = (y + dy) * width + (x + dx);
          if (isInk[nIdx]) neighbors++;
        }
      }
      if (neighbors < MIN_NEIGHBORS) {
        isInk[pixelIdx] = false;
        distanceToInk[pixelIdx] = Infinity;
      }
    }
  }

  // Calculate distance field using approximated distance transform
  const maxRadius = Math.max(textPreservationRadius, shadowOffset + shadowBlur);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIdx = y * width + x;
      if (!isInk[pixelIdx]) {
        let minDistance = Infinity;

        // Check surrounding area for ink pixels
        for (let dy = -maxRadius; dy <= maxRadius; dy++) {
          for (let dx = -maxRadius; dx <= maxRadius; dx++) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const nearPixelIdx = ny * width + nx;
              if (isInk[nearPixelIdx]) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                minDistance = Math.min(minDistance, distance);
              }
            }
          }
        }
        distanceToInk[pixelIdx] = minDistance;
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
      const distance = distanceToInk[pixelIdx];

      // Handle ink pixels (preserve)
      if (isInk[pixelIdx]) {
        if (!isDarkMenu) {
          const darkenFactor = 0.95;
          newData[idx] = Math.round(r * darkenFactor);
          newData[idx + 1] = Math.round(g * darkenFactor);
          newData[idx + 2] = Math.round(b * darkenFactor);
        } else {
          newData[idx] = r;
          newData[idx + 1] = g;
          newData[idx + 2] = b;
        }
        newData[idx + 3] = 255;
        continue;
      }

      // Anything that's not ink:
      // - If close to ink: keep an anti-aliased edge / optional shadow
      // - Otherwise: make fully transparent (aggressively removes noise)
      if (distance <= textPreservationRadius) {
        const borderFactor = distance / textPreservationRadius;
        const smoothFactor = Math.max(0, 1 - borderFactor);
        const edge = isDarkMenu ? 0 : 255;
        newData[idx] = edge;
        newData[idx + 1] = edge;
        newData[idx + 2] = edge;
        newData[idx + 3] = Math.round(255 * Math.pow(smoothFactor, 0.9));
      } else if (distance <= shadowOffset + shadowBlur) {
        const shadowDistance = distance - textPreservationRadius;
        const shadowFactor = Math.max(0, 1 - (shadowDistance - shadowOffset) / shadowBlur);
        if (shadowFactor > 0) {
          const shadowAlpha = Math.round(80 * shadowFactor * shadowFactor);
          const shadowColor = isDarkMenu ? 255 : 140;
          newData[idx] = shadowColor;
          newData[idx + 1] = shadowColor;
          newData[idx + 2] = shadowColor;
          newData[idx + 3] = shadowAlpha;
        } else {
          newData[idx + 3] = 0;
        }
      } else {
        // Drop everything else (noise/background)
        if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
          newData[idx] = 255;
          newData[idx + 1] = 255;
          newData[idx + 2] = 255;
        } else {
          newData[idx] = r;
          newData[idx + 1] = g;
          newData[idx + 2] = b;
        }
        newData[idx + 3] = 0;
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
  // 255 was too strict for AI-generated "near-white" backgrounds; 245 better removes haze/noise.
  const processedImageData = removeWhiteBackgroundSmart(imageData, 6, 245, 0, 2);
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

/**
 * Merge original menu image with AI generated background
 * @param {string} originalImageUrl - URL of original menu image
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @returns {Promise<string>} Base64 string of merged image
 */
/**
 * Merge a menu layer (original OR translated) over an AI-generated food background.
 *
 * The final output dimensions ALWAYS match the reference menu image.
 *
 * @param {string} referenceMenuImageUrl - URL of the original menu image (dimension reference)
 * @param {string} menuLayerImageSrc - URL or data URL of the menu layer to overlay (original or translated)
 * @param {string} backgroundImageDataUrl - Data URL of the AI-generated food background
 * @returns {Promise<string>} Base64 string (no data URL prefix) of merged image
 */
export async function mergeMenuLayerWithBackground(referenceMenuImageUrl, menuLayerImageSrc, backgroundImageDataUrl) {
  try {
    // Load reference menu image (dimensions only)
    const referenceBlob = await fetchImageAsBlob(referenceMenuImageUrl);
    const referenceBitmap = await createImageBitmap(referenceBlob);
    const targetWidth = referenceBitmap.width;
    const targetHeight = referenceBitmap.height;

    // Load menu layer (original OR translated)
    const menuLayerBlob = await fetchImageAsBlob(menuLayerImageSrc);
    const menuLayerBitmapRaw = await createImageBitmap(menuLayerBlob);

    // Normalize menu layer dimensions to the reference size (before background removal)
    const menuLayerBitmap = (menuLayerBitmapRaw.width === targetWidth && menuLayerBitmapRaw.height === targetHeight)
      ? menuLayerBitmapRaw
      : await downscaleImage(menuLayerBitmapRaw, targetWidth, targetHeight); // downscaleImage works for any resize

    // Load AI background image
    const generatedBlob = await fetch(backgroundImageDataUrl).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    // Step 1: Upscale menu layer 2x for better quality processing
    const upscaledMenuLayer = await upscaleImage(menuLayerBitmap, 2);

    // Step 2: Remove dividers (currently disabled)
    // const menuLayerWithoutDividers = await removeDividersFromImage(upscaledMenuLayer);
    const menuLayerWithoutDividers = upscaledMenuLayer;

    // Step 3: Remove background from menu layer and preserve text
    const menuLayerTransparent = await makeBackgroundTransparent(menuLayerWithoutDividers);

    // Step 4: Crop/resize AI background to match menu layer aspect ratio (then draw-scale to target)
    const resizedAiImage = await resizeAiImage(generatedBitmap, upscaledMenuLayer.width, upscaledMenuLayer.height);

    // Step 5: Merge at upscaled resolution
    const mergeCanvas = new OffscreenCanvas(upscaledMenuLayer.width, upscaledMenuLayer.height);
    const mergeCtx = mergeCanvas.getContext('2d');
    mergeCtx.imageSmoothingEnabled = true;
    mergeCtx.imageSmoothingQuality = 'high';

    // Draw background first (scaled to full canvas)
    mergeCtx.drawImage(resizedAiImage, 0, 0, mergeCanvas.width, mergeCanvas.height);

    // Overlay menu text layer (already in upscaled resolution)
    mergeCtx.drawImage(menuLayerTransparent, 0, 0);

    // Step 6: Downscale back to reference dimensions
    const mergedBlob = await mergeCanvas.convertToBlob({ type: 'image/png' });
    const mergedBitmap = await createImageBitmap(mergedBlob);
    const finalBitmap = await downscaleImage(mergedBitmap, targetWidth, targetHeight);

    // Step 7: Encode to base64
    const finalCanvas = new OffscreenCanvas(targetWidth, targetHeight);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(finalBitmap, 0, 0);
    const blob = await finalCanvas.convertToBlob({ type: 'image/png' });
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Error merging images in background:', error);
    throw new Error(`Failed to merge images: ${error.message}`);
  }
}
