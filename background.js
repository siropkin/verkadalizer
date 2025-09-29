// Background service worker: process image edits via provider-agnostic adapter
const ACTIONS = {
  GENERATE_REQUEST_ID: 'generateRequestId',
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
  SAVE_GENERATED_IMAGE: 'saveGeneratedImage',
  LOAD_SAVED_IMAGE: 'loadSavedImage',
  CLEANUP_OLD_IMAGES: 'cleanupOldImages',
  MERGE_IMAGES: 'mergeImages',
};

// Tracks in-flight requests by requestId
const inFlightRequests = new Map(); // requestId -> { controller, timeoutId }

// Entry point: listen for messages from the extension UI/content
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request && request.action === ACTIONS.PROCESS_IMAGE) {
    const requestId = request.requestId;
    const controller = new AbortController();
    inFlightRequests.set(requestId, { controller, timeoutId: null });

    processImageRequest({ imageUrl: request.imageUrl, requestId, signal: controller.signal })
      .then(result => sendResponse({ ...result, requestId }))
      .catch(error => sendResponse({ success: false, error: error.message, requestId }))
      .finally(() => clearInFlight(requestId));
    return true; // keep the message channel open for async response
  }

  if (request && request.action === ACTIONS.CANCEL_REQUEST) {
    const requestId = request.requestId;
    const entry = requestId ? inFlightRequests.get(requestId) : null;
    if (entry) {
      try { entry.controller.abort(); } catch (_) {}
      clearInFlight(requestId);
      sendResponse({ success: true, canceled: true, requestId });
    } else {
      sendResponse({ success: false, error: 'No in-flight request for given requestId', requestId });
    }
    return true;
  }

  if (request && request.action === ACTIONS.GENERATE_REQUEST_ID) {
    generateRequestIdFromImage(request.imageUrl)
      .then(requestId => sendResponse({ success: true, requestId }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.SAVE_GENERATED_IMAGE) {
    saveGeneratedImageToStorage(request.requestId, request.generatedSrc)
      .then(result => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.LOAD_SAVED_IMAGE) {
    loadSavedImageFromStorage(request.requestId)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.CLEANUP_OLD_IMAGES) {
    cleanupOldSavedImages()
      .then(result => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.MERGE_IMAGES) {
    mergeImagesWithTextOverlay(request.originalImageUrl, request.aiImageData)
      .then(result => sendResponse({ success: true, b64: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Clear in-flight requests
function clearInFlight(requestId) {
  const entry = inFlightRequests.get(requestId);
  if (entry) {
    clearTimeout(entry.timeoutId)
    inFlightRequests.delete(requestId);
  }
}

// Main request pipeline: fetch image, build mask, call provider, return base64
async function processImageRequest({ imageUrl, requestId, signal }) {
  try {
    const settings = await loadSettings();

    assertSetting(settings.model, 'Model not configured');
    assertSetting(settings.apiKey, 'API key not configured');
    assertSetting(settings.prompt, 'Prompt not configured');

    // Enforce timeout via AbortController (only if a positive timeout is set)
    const entry = inFlightRequests.get(requestId);
    if (entry && !entry.timeoutId && typeof settings.timeoutMs === 'number' && settings.timeoutMs > 0) {
      entry.timeoutId = setTimeout(() => {
        try { entry.controller.abort(); } catch (_) {}
      }, settings.timeoutMs);
    }

    const imageBlob = await fetchImageAsBlob(imageUrl, signal);
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Fetched image is empty');
    }

    // Build a PNG mask where white pixels become transparent and others opaque
    throwIfAborted(signal);
    const maskBlob = await generateMaskFromImageBlob(imageBlob);

    const aiProvider = selectAiProviderByModel(settings.model);
    const request = aiProvider.buildRequest({ settings, imageBlob, maskBlob, signal });

    const response = await fetch(request.url, request.options);
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
      throw new Error(`${aiProvider.name} API error: ${errorMessage}`);
    }

    const b64 = await aiProvider.extractResult(response);
    if (!b64) {
      throw new Error(`${aiProvider.name} returned no image data`);
    }
    return { success: true, b64 };
  } catch (error) {
    if (error && (error.name === 'AbortError' || /aborted|abort/i.test(error.message))) {
      return { success: false, canceled: true, error: 'Request canceled' };
    }
    console.error('Error processing image:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// Settings and validation helpers
async function loadSettings() {
  // Support new per-model settings shape with backward-compatible fallback to flat keys
  const stored = await chrome.storage.local.get(['default_model', 'model', 'apiKey', 'perModel', 'prompt', 'quality', 'size', 'timeoutMs']);
  const model = stored.default_model || stored.model;
  const common = { model, apiKey: stored.apiKey, timeoutMs: stored.timeoutMs };
  const flat = {
    prompt: stored.prompt,
    quality: stored.quality,
    size: stored.size,
  };
  const perModel = stored.perModel && model ? (stored.perModel[model] || {}) : {};
  // Prefer per-model values over flat ones if both are present
  return { ...common, ...flat, ...perModel };
}

// Validate settings value
function assertSetting(value, message) {
  if (value === undefined || value === null || value === '') throw new Error(message);
}

// Throw if the request is aborted
function throwIfAborted(signal) {
  if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

// Network/image helpers
async function fetchImageAsBlob(imageUrl, signal) {
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

// Creates a PNG mask from an input image using block-based averaging.
// For each block, if the average color is near-white
// (>= whiteThreshold per channel), the block becomes fully transparent;
// otherwise it becomes fully opaque black. The mask keeps original dimensions.
async function generateMaskFromImageBlob(imageBlob, whiteThreshold = 250, blockSize = 128) {
  try {
    const bitmap = await createImageBitmap(imageBlob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let by = 0; by < height; by += blockSize) {
      const blockH = Math.min(blockSize, height - by);
      for (let bx = 0; bx < width; bx += blockSize) {
        const blockW = Math.min(blockSize, width - bx);

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        // First pass: compute average color for the block (skip out-of-bounds)
        for (let y = 0; y < blockH; y++) {
          const globalY = by + y;
          if (globalY >= height) break;
          const rowStart = globalY * width;
          for (let x = 0; x < blockW; x++) {
            const globalX = bx + x;
            if (globalX >= width) break;
            const idx = ((rowStart + globalX) << 2);
            sumR += data[idx];
            sumG += data[idx + 1];
            sumB += data[idx + 2];
            count++;
          }
        }

        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        const isWhiteBlock = avgR >= whiteThreshold && avgG >= whiteThreshold && avgB >= whiteThreshold;

        // Second pass: write mask values for the block
        if (isWhiteBlock) {
          // Transparent indicates editable area
          for (let y = 0; y < blockH; y++) {
            const globalY = by + y;
            if (globalY >= height) break;
            const rowStart = globalY * width;
            for (let x = 0; x < blockW; x++) {
              const globalX = bx + x;
              if (globalX >= width) break;
              const idx = ((rowStart + globalX) << 2);
              data[idx + 3] = 0; // alpha
            }
          }
        } else {
          // Opaque black indicates preserved area
          for (let y = 0; y < blockH; y++) {
            const globalY = by + y;
            if (globalY >= height) break;
            const rowStart = globalY * width;
            for (let x = 0; x < blockW; x++) {
              const globalX = bx + x;
              if (globalX >= width) break;
              const idx = ((rowStart + globalX) << 2);
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 255;
            }
          }
        }
      }
    }

    const ctxPut = ctx; // maintain naming clarity
    ctxPut.putImageData(imageData, 0, 0);
    return await canvas.convertToBlob({ type: 'image/png' });
  } catch (err) {
    throw new Error(`Failed to generate mask: ${err.message}`);
  }
}

// Provider selection
function selectAiProviderByModel(model) {
  switch (model.toLowerCase()) {
    case 'gpt-image-1':
      return gptImage1;
    default:
      return gptImage1;
  }
}

// Providers
const gptImage1 = {
  name: 'GPT-Image-1',
  buildRequest({ settings, imageBlob, maskBlob, signal }) {
    const formData = new FormData();
    formData.append('model', settings.model);
    formData.append('prompt', settings.prompt);
    formData.append('n', '1');
    formData.append('input_fidelity', 'high');
    if (settings.quality && settings.quality !== 'auto') {
      formData.append('quality', settings.quality);
    }
    if (settings.size && settings.size !== 'auto') {
      formData.append('size', settings.size);
    }
    // if (maskBlob) {
    //   formData.append('mask', maskBlob, 'mask.png');
    // }
    formData.append('image', imageBlob, 'image.png');

    return {
      url: 'https://api.openai.com/v1/images/edits',
      options: {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: formData,
        signal,
      }
    };
  },
  async extractResult(response) {
    const data = await response.json();
    const first = data?.data?.[0];
    return first?.b64_json || null;
  }
};

// Misc utilities
async function fetchUrlToBase64(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to fetch image URL: ${res.statusText}`);
  const blob = await res.blob();
  return await blobToBase64(blob);
}

function blobToBase64(blob) {
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

// Storage functions for generated images
async function saveGeneratedImageToStorage(requestId, generatedSrc) {
  try {
    // Clean up old images first to free up space
    await cleanupOldSavedImages();

    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};

    // Check storage quota before saving
    const storageSize = JSON.stringify(savedImages).length;
    const newImageSize = generatedSrc.length;
    const maxStorageSize = 5 * 1024 * 1024; // 5MB limit for safety

    if (storageSize + newImageSize > maxStorageSize) {
      // Remove oldest images until we have enough space
      const entries = Object.entries(savedImages);
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by oldest first

      while (entries.length > 0 && JSON.stringify(savedImages).length + newImageSize > maxStorageSize) {
        const [oldestId] = entries.shift();
        delete savedImages[oldestId];
        console.log(`Removed old cached image: ${oldestId}`);
      }
    }

    savedImages[requestId] = {
      generatedSrc,
      timestamp: Date.now()
    };

    await chrome.storage.local.set({ verkadalizer_saved_images: savedImages });
  } catch (error) {
    console.warn('Failed to save generated image:', error);
    // Don't throw - just log the warning so processing continues
  }
}

async function loadSavedImageFromStorage(requestId) {
  try {
    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};
    return savedImages[requestId] || null;
  } catch (error) {
    console.warn('Failed to load saved image:', error);
    throw error;
  }
}

async function cleanupOldSavedImages() {
  try {
    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000); // Reduced from 7 days to 3 days
    let cleaned = false;

    for (const [requestId, data] of Object.entries(savedImages)) {
      if (data.timestamp < threeDaysAgo) {
        delete savedImages[requestId];
        cleaned = true;
      }
    }

    // Also limit total stored images to 10 most recent
    const entries = Object.entries(savedImages);
    if (entries.length > 10) {
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp); // Sort by newest first
      const toKeep = entries.slice(0, 10); // Keep only 10 most recent
      const newSavedImages = {};

      for (const [requestId, data] of toKeep) {
        newSavedImages[requestId] = data;
      }

      await chrome.storage.local.set({ verkadalizer_saved_images: newSavedImages });
      cleaned = true;
    } else if (cleaned) {
      await chrome.storage.local.set({ verkadalizer_saved_images: savedImages });
    }
  } catch (error) {
    console.warn('Failed to cleanup old saved images:', error);
    // Don't throw - just log the warning
  }
}

async function generateRequestIdFromImage(imageUrl) {
  const imageBlob = await fetchImageAsBlob(imageUrl);
  const bitmap = await createImageBitmap(imageBlob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Simple hash calculation from image data
  let hash = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    hash = ((hash << 5) - hash + imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) & 0xffffffff;
  }
  
  const requestId = `img_${Math.abs(hash).toString(36)}`;
  return requestId;
}

// Remove vertical lines from image data
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

// Smart white background removal with smooth text borders and shadow effects
function removeWhiteBackgroundSmart(imageData, textPreservationRadius = 2, whiteThreshold = 245, shadowOffset = 2, shadowBlur = 4) {
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

      // Handle text pixels (keep original)
      if (isText[pixelIdx]) {
        newData[idx] = r;
        newData[idx + 1] = g;
        newData[idx + 2] = b;
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

// Image merging functionality
async function mergeImagesWithTextOverlay(originalImageUrl, aiImageData) {
  try {
    // Load original image
    const originalBlob = await fetchImageAsBlob(originalImageUrl);
    const originalBitmap = await createImageBitmap(originalBlob);

    // Load generated image from base64 data
    const generatedBlob = await fetch(aiImageData).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    // Calculate original aspect ratio
    const originalAspectRatio = originalBitmap.width / originalBitmap.height;
    const generatedAspectRatio = generatedBitmap.width / generatedBitmap.height;

    // Create temporary canvas to crop and resize AI image to match original dimensions
    let processedAiBitmap = generatedBitmap;

    if (Math.abs(originalAspectRatio - generatedAspectRatio) > 0.01) {
      // Need to crop AI image to match original aspect ratio
      const tempCanvas = new OffscreenCanvas(generatedBitmap.width, generatedBitmap.height);
      const tempCtx = tempCanvas.getContext('2d');

      // Calculate crop dimensions
      let cropWidth = generatedBitmap.width;
      let cropHeight = generatedBitmap.height;
      let cropX = 0;
      let cropY = 0;

      if (generatedAspectRatio > originalAspectRatio) {
        // AI image is wider - crop width
        cropWidth = Math.floor(generatedBitmap.height * originalAspectRatio);
        cropX = Math.floor((generatedBitmap.width - cropWidth) / 2);
      } else {
        // AI image is taller - crop height (mostly from top, a bit from bottom)
        cropHeight = Math.floor(generatedBitmap.width / originalAspectRatio);
        const totalCrop = generatedBitmap.height - cropHeight;
        cropY = Math.floor(totalCrop * 0.75); // 75% from top, 25% from bottom
      }

      // Resize temp canvas to cropped dimensions
      tempCanvas.width = cropWidth;
      tempCanvas.height = cropHeight;
      tempCtx.drawImage(generatedBitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const croppedBlob = await tempCanvas.convertToBlob();
      processedAiBitmap = await createImageBitmap(croppedBlob);
    }

    // Create final canvas with original image dimensions
    const canvas = new OffscreenCanvas(originalBitmap.width, originalBitmap.height);
    const ctx = canvas.getContext('2d');

    // Enable anti-aliasing for smoother rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw the processed AI background image first, scaled to match original dimensions
    ctx.drawImage(processedAiBitmap, 0, 0, canvas.width, canvas.height);

    // Extract text sections from original image
    // Top section: Main menu items (upper 70% of the image)
    const topSectionHeight = Math.floor(originalBitmap.height * 0.7);

    // Create temporary canvas for top section with anti-aliasing
    const topCanvas = new OffscreenCanvas(originalBitmap.width, topSectionHeight);
    const topCtx = topCanvas.getContext('2d');
    topCtx.imageSmoothingEnabled = true;
    topCtx.imageSmoothingQuality = 'high';
    topCtx.drawImage(originalBitmap, 0, 0, originalBitmap.width, topSectionHeight, 0, 0, originalBitmap.width, topSectionHeight);

    // Apply smart white background removal to top section with smooth borders and shadows
    const topImageData = topCtx.getImageData(0, 0, topCanvas.width, topCanvas.height);
    const processedTopImageData = removeWhiteBackgroundSmart(removeVerticalLines(topImageData), 4, 255, 2, 4);
    topCtx.putImageData(processedTopImageData, 0, 0);

    // Overlay the top section text onto the generated background - full width, starting at top
    const targetWidth = canvas.width;
    const targetHeight = Math.floor((topSectionHeight / originalBitmap.width) * targetWidth);
    const offsetX = 0;
    const offsetY = 0;

    ctx.drawImage(topCanvas, offsetX, offsetY, targetWidth, targetHeight);

    // Bottom section: Soups, QR code, legend (lower 30% of the image)
    const bottomSectionY = topSectionHeight;
    const bottomSectionHeight = originalBitmap.height - topSectionHeight;

    if (bottomSectionHeight > 0) {
      // Create temporary canvas for bottom section with anti-aliasing
      const bottomCanvas = new OffscreenCanvas(originalBitmap.width, bottomSectionHeight);
      const bottomCtx = bottomCanvas.getContext('2d');
      bottomCtx.imageSmoothingEnabled = true;
      bottomCtx.imageSmoothingQuality = 'high';
      bottomCtx.drawImage(originalBitmap, 0, bottomSectionY, originalBitmap.width, bottomSectionHeight, 0, 0, originalBitmap.width, bottomSectionHeight);

      // Apply smart white background removal to bottom section with smooth borders and shadows
      const bottomImageData = bottomCtx.getImageData(0, 0, bottomCanvas.width, bottomCanvas.height);
      const processedBottomImageData = removeWhiteBackgroundSmart(removeVerticalLines(bottomImageData), 4, 255, 2, 4);
      bottomCtx.putImageData(processedBottomImageData, 0, 0);

      // Overlay the bottom section as a foreground element - full width, ending at bottom
      const bottomTargetWidth = canvas.width;
      const bottomTargetHeight = Math.floor((bottomSectionHeight / originalBitmap.width) * bottomTargetWidth);
      const bottomOffsetX = 0;
      const bottomOffsetY = canvas.height - bottomTargetHeight;

      ctx.drawImage(bottomCanvas, bottomOffsetX, bottomOffsetY, bottomTargetWidth, bottomTargetHeight);
    }

    // Convert to data URL
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Error merging images in background:', error);
    throw new Error(`Failed to merge images: ${error.message}`);
  }
}