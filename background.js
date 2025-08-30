// Background service worker: process image edits via provider-agnostic adapter
const ACTIONS = {
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
};

// Tracks in-flight requests by requestId
const inFlightRequests = new Map(); // requestId -> { controller, timeoutId }

// Entry point: listen for messages from the extension UI/content
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request && request.action === ACTIONS.PROCESS_IMAGE) {
    const requestId = request.requestId || generateRequestId();
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
});

// Generate a unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

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
  const stored = await chrome.storage.local.get(['model', 'apiKey', 'prompt', 'quality', 'size', 'timeoutMs']);
  return stored;
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

        // First pass: compute average color for the block
        for (let y = 0; y < blockH; y++) {
          const rowStart = (by + y) * width;
          for (let x = 0; x < blockW; x++) {
            const idx = ((rowStart + (bx + x)) << 2);
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
            const rowStart = (by + y) * width;
            for (let x = 0; x < blockW; x++) {
              const idx = ((rowStart + (bx + x)) << 2);
              data[idx + 3] = 0; // alpha
            }
          }
        } else {
          // Opaque black indicates preserved area
          for (let y = 0; y < blockH; y++) {
            const rowStart = (by + y) * width;
            for (let x = 0; x < blockW; x++) {
              const idx = ((rowStart + (bx + x)) << 2);
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
function selectAiProviderByModel(modelName) {
  switch (modelName.toLowerCase()) {
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
    if (settings.quality && settings.quality !== 'auto') {
      formData.append('quality', settings.quality);
    }
    if (settings.size && settings.size !== 'auto') {
      formData.append('size', settings.size);
    }
    if (maskBlob) {
      formData.append('mask', maskBlob, 'mask.png');
    }
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