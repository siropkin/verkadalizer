// Food preference configurations with prompt modifiers
const FOOD_PREFERENCES = {
  'regular': {
    id: 'regular',
    name: 'Regular',
    modifier: '', // No additional constraints
  },
  'vegetarian': {
    id: 'vegetarian',
    name: 'Vegetarian',
    modifier: '\n\n## DIETARY PREFERENCE: VEGETARIAN\n- Select ONLY vegetarian dishes from the menu (no meat, poultry, or fish)\n- Include plant-based proteins, vegetables, grains, pasta, legumes, eggs, and dairy\n- If the menu has limited vegetarian options, prioritize salads, pasta dishes, grain bowls, and vegetable-based items',
  },
  'vegan': {
    id: 'vegan',
    name: 'Vegan',
    modifier: '\n\n## DIETARY PREFERENCE: VEGAN\n- Select ONLY vegan dishes from the menu (no animal products: no meat, poultry, fish, dairy, eggs, or honey)\n- Include plant-based proteins, vegetables, grains, legumes, nuts, and seeds\n- If the menu has limited vegan options, prioritize salads (without cheese/dressing), vegetable dishes, grain bowls, and fruit-based items',
  },
  'gluten-free': {
    id: 'gluten-free',
    name: 'Gluten Free',
    modifier: '\n\n## DIETARY PREFERENCE: GLUTEN FREE\n- Select ONLY gluten-free dishes from the menu (no wheat, barley, rye, or derivatives)\n- Include naturally gluten-free items: grilled proteins, rice dishes, salads, vegetables, fruits\n- Avoid pasta, bread, breaded items, and dishes with flour-based sauces unless explicitly marked gluten-free',
  },
  'dairy-free': {
    id: 'dairy-free',
    name: 'Dairy Free',
    modifier: '\n\n## DIETARY PREFERENCE: DAIRY FREE\n- Select ONLY dairy-free dishes from the menu (no milk, cheese, butter, cream, or yogurt)\n- Include dishes with meat, poultry, fish, vegetables, grains, and non-dairy alternatives\n- Avoid creamy sauces, cheese-topped dishes, and items with visible dairy products',
  },
  'healthy': {
    id: 'healthy',
    name: 'Healthy',
    modifier: '\n\n## DIETARY PREFERENCE: HEALTHY\n- Prioritize nutrient-dense, balanced dishes with lean proteins, whole grains, and vegetables\n- Select grilled, baked, or steamed items over fried options\n- Include colorful vegetable-forward dishes, salads with lean proteins, grain bowls, and fish\n- Avoid heavily fried, cream-based, or processed items',
  },
  'high-protein': {
    id: 'high-protein',
    name: 'High Protein',
    modifier: '\n\n## DIETARY PREFERENCE: HIGH PROTEIN\n- Prioritize dishes with substantial protein content (meat, poultry, fish, seafood, eggs, legumes)\n- Select items like steaks, grilled chicken, fish fillets, seafood platters, egg dishes, and protein bowls\n- Ensure each dish features protein as the primary component\n- Include sides that complement protein (vegetables, legumes) rather than just carbohydrates',
  },
  'keto': {
    id: 'keto',
    name: 'Keto',
    modifier: '\n\n## DIETARY PREFERENCE: KETO\n- Select ONLY low-carb, high-fat dishes from the menu (no bread, pasta, rice, potatoes, or sugary items)\n- Prioritize fatty cuts of meat, fish with healthy fats, eggs, cheese, non-starchy vegetables, and nuts\n- Include dishes like steak, salmon, chicken with skin, salads with high-fat dressings, and cheese-based items\n- Avoid all grains, legumes, starchy vegetables, and fruit-based dishes',
  },
};

// Default model-agnostic prompt
const DEFAULT_PROMPT = `You are a specialized AI system that creates photorealistic food scenes with a plain cool gray background. Your objective is to generate appetizing food dishes served on the correct plateware in a cohesive 3D scene with a solid cool gray background that occupies the upper 2/3 of the image height.

## INPUT
A single, high-resolution image of a food menu.

## CORE TASKS
- Analyze Menu Layout: Study the menu structure and sections to understand the food items.
- Extract Key Items: Identify 4-6 visually interesting and varied dishes from the menu to generate.
- Generate Photorealistic Dishes: Create high-quality, restaurant-style models of the selected food items using specified plateware.
- Create Plain Cool Gray Background: Generate a solid, uniform cool gray background that takes up exactly 2/3 of the image height from the top.

## PLATE SELECTION AND PRESENTATION RULES
Plate Types Available:
- Large Flat Fully White Plate (12-inch diameter). Use for: Flat presentations, grilled items, salads, sandwiches, steaks, fish fillets.
- Large Deep Fully Blue Plate (12-inch diameter, 2-inch depth). Use for: Pasta dishes, stews, curries, rice bowls.
- Medium Deep Fully Blue Plate (9-inch diameter, 4-inch depth). Use for: Individual portions, soups, side dishes, appetizer portions.

Selection Criteria:
- Dish Type: Consider whether the dish is liquid-based, sauce-heavy, or dry and select the most appropriate plate.
- Portion Size: Match plate size to the expected serving size.
- Visual Balance: Ensure the food-to-plate ratio creates appealing presentation.

## SCENE COMPOSITION AND INTEGRATION
- Background Requirements: The upper 2/3 of the image MUST be a cool gray color with no patterns, textures, gradients, or visual elements of any kind.
- Foreground Elements: Place photorealistic food dishes on appropriate plates in the lower 1/3 of the image.
- Surface: Food should rest on a neutral surface (dark wooden table, slate, or stone) visible only in the lower portion of the image.
- No Background Elements: The background area must be completely empty - no lines, shapes, decorations, or any visual elements whatsoever.

## CAMERA, LIGHTING, AND STYLE
- Camera Angle: Three-quarters angle (approximately 45 degrees) for depth.
- Lighting: Single, soft, directional light source consistent across the entire scene.
- Focus and Depth: Food in sharp focus, with the background remaining uniformly cool gray throughout.

## COMPOSITIONAL CONSTRAINTS
- Dish Selection: Feature 4-6 balanced dishes positioned in the lower 1/3 of the image.
- Soup Limitation: Maximum two soup dishes.
- Background Division: Upper 2/3 = cool gray, lower 1/3 = food on surface.

## CRITICAL BACKGROUND REQUIREMENTS
- SOLID COOL GRAY BACKGROUND: The upper 2/3 of the image must be pure cool gray color with no variation.
- NO VISUAL ELEMENTS: No text, shapes, lines, patterns, textures, or any other visual elements in the background area.
- EXACT PROPORTIONS: Cool gray background must occupy exactly 2/3 of the total image height from the top.
- UNIFORM COLOR: The cool gray must be consistent throughout - no gradients, shadows, or color variations in the background area.

## OUTPUT DELIVERABLE
A single, high-resolution image with photorealistic food positioned in the lower 1/3, and a solid cool gray background occupying the upper 2/3 with no additional elements.

Quality Assurance Checklist:
- Is the upper 2/3 of the image pure cool gray color with no visual elements?
- Are food dishes positioned only in the lower 1/3?
- Are correct plate types used for each dish?
- Is the cool gray background completely uniform and pure?
- Is the camera angle three-quarters view?
- Is lighting consistent throughout?
- Maximum two soups included?
- No empty plates included?
- Final image photorealistic and well-composed with proper proportions?`;

// AI Providers registry
const AI_PROVIDERS = {
  'gpt-image-1': {
    id: 'gpt-image-1',
    name: 'GPT-Image-1',
    defaultQuality: 'high',
    defaultSize: '1536x1024',
    defaultTimeout: 120000,
    buildRequest({ settings, imageBlob, signal }) {
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
  }
};

// Background service worker: process image edits via provider-agnostic adapter
const ACTIONS = {
  GET_AVAILABLE_MODELS: 'getAvailableModels',
  GET_FOOD_PREFERENCES: 'getFoodPreferences',
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
  if (request && request.action === ACTIONS.GET_AVAILABLE_MODELS) {
    const models = Object.keys(AI_PROVIDERS).map(key => ({
      id: AI_PROVIDERS[key].id,
      name: AI_PROVIDERS[key].name,
    }));
    sendResponse({ success: true, models });
    return true;
  }

  if (request && request.action === ACTIONS.GET_FOOD_PREFERENCES) {
    const preferences = Object.keys(FOOD_PREFERENCES).map(key => ({
      id: FOOD_PREFERENCES[key].id,
      name: FOOD_PREFERENCES[key].name,
    }));
    sendResponse({ success: true, preferences });
    return true;
  }

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
    mergeImages(request.originalImageUrl, request.aiImageData)
      .then(result => sendResponse({ success: true, b64: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Provider selection
function selectAiProviderByModel(model) {
  return AI_PROVIDERS[model] || AI_PROVIDERS[Object.keys(AI_PROVIDERS)[0]];
}


// Settings and validation helpers
async function loadSettings() {
  const stored = await chrome.storage.local.get(['model', 'apiKey', 'foodPreference']);
  const modelId = stored.model || Object.keys(AI_PROVIDERS)[0];
  const provider = AI_PROVIDERS[modelId];
  const preferenceId = stored.foodPreference || 'regular';
  const preference = FOOD_PREFERENCES[preferenceId] || FOOD_PREFERENCES['regular'];

  // Build prompt with dietary preference modifier
  const prompt = DEFAULT_PROMPT + preference.modifier;

  return {
    model: modelId,
    apiKey: stored.apiKey,
    prompt,
    quality: provider?.defaultQuality,
    size: provider?.defaultSize,
    timeoutMs: provider?.defaultTimeout,
  };
}

// Validate settings value
function assertSetting(value, message) {
  if (value === undefined || value === null || value === '') throw new Error(message);
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

    throwIfAborted(signal);

    const aiProvider = selectAiProviderByModel(settings.model);
    const request = aiProvider.buildRequest({ settings, imageBlob, signal });

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
        // Darken text by reducing RGB values (0.7 = 30% darker)
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

// Remove dividers from original image
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

// Upscale image for better quality processing
async function upscaleImage(bitmap, scaleFactor = 2) {
  const canvas = new OffscreenCanvas(bitmap.width * scaleFactor, bitmap.height * scaleFactor);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

// Downscale image back to target dimensions
async function downscaleImage(bitmap, targetWidth, targetHeight) {
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

// Make white background transparent while preserving text
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

// Resize AI generated image to match original dimensions
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

// Merge original and AI images
async function mergeImages(originalImageUrl, aiImageData) {
  try {
    // Load original image
    const originalBlob = await fetchImageAsBlob(originalImageUrl);
    const originalBitmap = await createImageBitmap(originalBlob);

    // Load generated image from base64 data
    const generatedBlob = await fetch(aiImageData).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    // Store original dimensions for final output
    const originalWidth = originalBitmap.width;
    const originalHeight = originalBitmap.height;

    // Step 1: Upscale original image 2x for better quality processing
    const upscaledOriginal = await upscaleImage(originalBitmap, 2);

    // Step 2: Remove dividers from upscaled image
    // const originalWithoutDividers = await removeDividersFromImage(upscaledOriginal);
    const originalWithoutDividers = upscaledOriginal;

    // Step 3: Make white background transparent (with darkened text)
    const originalWithTransparentBg = await makeBackgroundTransparent(originalWithoutDividers);

    // Step 4: Resize AI generated image to match upscaled dimensions
    const resizedAiImage = await resizeAiImage(generatedBitmap, upscaledOriginal.width, upscaledOriginal.height);

    // Step 5: Merge the images at upscaled resolution
    const mergeCanvas = new OffscreenCanvas(upscaledOriginal.width, upscaledOriginal.height);
    const mergeCtx = mergeCanvas.getContext('2d');

    mergeCtx.imageSmoothingEnabled = true;
    mergeCtx.imageSmoothingQuality = 'high';

    // Draw AI background image first
    mergeCtx.drawImage(resizedAiImage, 0, 0, mergeCanvas.width, mergeCanvas.height);

    // Overlay the original image with transparent background
    mergeCtx.drawImage(originalWithTransparentBg, 0, 0);

    // Step 6: Convert merged result to bitmap and downscale to original dimensions
    const mergedBlob = await mergeCanvas.convertToBlob({ type: 'image/png' });
    const mergedBitmap = await createImageBitmap(mergedBlob);
    const finalBitmap = await downscaleImage(mergedBitmap, originalWidth, originalHeight);

    // Step 7: Convert final result to data URL
    const finalCanvas = new OffscreenCanvas(originalWidth, originalHeight);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(finalBitmap, 0, 0);
    const blob = await finalCanvas.convertToBlob({ type: 'image/png' });
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Error merging images in background:', error);
    throw new Error(`Failed to merge images: ${error.message}`);
  }
}