// ============================================================================
// IMAGE PROCESSING - Shared post-processing utilities for AI providers
// ============================================================================

import { blobToBase64, fetchImageAsBlob } from './image-utils.js';

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
function removeWhiteBackgroundSmart(imageData, textPreservationRadius = 2, whiteThreshold = 255, shadowOffset = 0, shadowBlur = 4) {
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
async function removeDividersFromImage(bitmap) {
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
async function upscaleImage(bitmap, scaleFactor = 2) {
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
async function downscaleImage(bitmap, targetWidth, targetHeight) {
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
async function makeBackgroundTransparent(bitmap) {
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
async function resizeAiImage(generatedBitmap, targetWidth, targetHeight) {
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

// ============================================================================
// MAIN POST-PROCESSING PIPELINE
// ============================================================================

/**
 * Post-process and merge original menu image with AI generated background
 * This is the main pipeline shared by all AI providers
 *
 * @param {string} originalImageUrl - URL of original menu image
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @param {string} providerName - Provider name for logging (e.g., 'OPENAI', 'GEMINI')
 * @returns {Promise<string>} Base64 string of merged image
 */
export async function postProcessImage(originalImageUrl, aiImageData, providerName = 'AI') {
  console.log(`🎨 [${providerName}] Starting post-processing pipeline...`);

  try {
    // Load original image
    console.log(`⬇️ [${providerName}] Loading original image...`);
    const originalBlob = await fetchImageAsBlob(originalImageUrl);
    const originalBitmap = await createImageBitmap(originalBlob);

    // Load generated image from base64 data
    console.log(`⬇️ [${providerName}] Loading AI-generated image...`);
    const generatedBlob = await fetch(aiImageData).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    // Store original dimensions for final output
    const originalWidth = originalBitmap.width;
    const originalHeight = originalBitmap.height;
    console.log(`📐 [${providerName}] Original dimensions: ${originalWidth}×${originalHeight}`);

    // Step 1: Upscale original image 2x for better quality processing
    console.log(`⬆️ [${providerName}] Upscaling original image 2x...`);
    const upscaledOriginal = await upscaleImage(originalBitmap, 2);

    // Step 2: Remove dividers from upscaled image (currently disabled)
    // const originalWithoutDividers = await removeDividersFromImage(upscaledOriginal);
    const originalWithoutDividers = upscaledOriginal;

    // Step 3: Make white background transparent (with darkened text)
    console.log(`🎭 [${providerName}] Removing white background and enhancing text...`);
    const originalWithTransparentBg = await makeBackgroundTransparent(originalWithoutDividers);

    // Step 4: Resize AI generated image to match upscaled dimensions
    console.log(`📏 [${providerName}] Resizing AI image to match upscaled dimensions...`);
    const resizedAiImage = await resizeAiImage(generatedBitmap, upscaledOriginal.width, upscaledOriginal.height);

    // Step 5: Merge the images at upscaled resolution
    console.log(`🔗 [${providerName}] Merging original and AI images...`);
    const mergeCanvas = new OffscreenCanvas(upscaledOriginal.width, upscaledOriginal.height);
    const mergeCtx = mergeCanvas.getContext('2d');

    mergeCtx.imageSmoothingEnabled = true;
    mergeCtx.imageSmoothingQuality = 'high';

    // Draw AI background image first
    mergeCtx.drawImage(resizedAiImage, 0, 0, mergeCanvas.width, mergeCanvas.height);

    // Overlay the original image with transparent background
    mergeCtx.drawImage(originalWithTransparentBg, 0, 0);

    // Step 6: Convert merged result to bitmap and downscale to original dimensions
    console.log(`⬇️ [${providerName}] Downscaling to original dimensions...`);
    const mergedBlob = await mergeCanvas.convertToBlob({ type: 'image/png' });
    const mergedBitmap = await createImageBitmap(mergedBlob);
    const finalBitmap = await downscaleImage(mergedBitmap, originalWidth, originalHeight);

    // Step 7: Convert final result to base64
    console.log(`💾 [${providerName}] Converting to base64...`);
    const finalCanvas = new OffscreenCanvas(originalWidth, originalHeight);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(finalBitmap, 0, 0);
    const blob = await finalCanvas.convertToBlob({ type: 'image/png' });
    const base64Result = await blobToBase64(blob);

    console.log(`✅ [${providerName}] Post-processing complete!`);
    return base64Result;
  } catch (error) {
    console.error(`❌ [${providerName}] Post-processing error:`, error);
    throw new Error(`Failed to post-process image: ${error.message}`);
  }
}

// Export individual utilities for custom provider implementations if needed
export {
  removeVerticalLines,
  removeWhiteBackgroundSmart,
  removeDividersFromImage,
  upscaleImage,
  downscaleImage,
  makeBackgroundTransparent,
  resizeAiImage,
};
