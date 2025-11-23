// ============================================================================
// IMPORTS - External modules
// ============================================================================

import { DIETARY_PREFERENCES, IMAGE_STYLES, PLATE_STYLES, buildImageGenerationPrompt } from './ai/prompts.js';
import { AI_PROVIDERS, selectAiProviderByModel, parseMenuWithAI } from './ai/providers/ai-providers.js';
import { fetchImageAsBlob, mergeImages } from './lib/image-processing.js';
import { loadSettings, generateRequestIdFromImage, saveGeneratedImageToStorage, loadSavedImageFromStorage, cleanupOldSavedImages } from './lib/storage.js';
import { assertSetting, throwIfAborted, getRandomFoodFact } from './lib/utils.js';

// ============================================================================
// CONSTANTS - Configuration and Static Data
// ============================================================================

// Action types for message handling
const ACTIONS = {
  GET_DIETARY_PREFERENCES: 'getDietaryPreferences',
  GET_VISUAL_STYLES: 'getVisualStyles',
  GET_PLATE_STYLES: 'getPlateStyles',
  GENERATE_REQUEST_ID: 'generateRequestId',
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
  SAVE_GENERATED_IMAGE: 'saveGeneratedImage',
  LOAD_SAVED_IMAGE: 'loadSavedImage',
  CLEANUP_OLD_IMAGES: 'cleanupOldImages',
  MERGE_IMAGES: 'mergeImages',
  GET_PROGRESS: 'getProgress',
};


// ============================================================================
// STATE MANAGEMENT
// ============================================================================

// Tracks in-flight requests by requestId
const inFlightRequests = new Map(); // requestId -> { controller, timeoutId, progress }


// ============================================================================
// PROGRESS MANAGEMENT
// ============================================================================

/**
 * Update progress for a request
 * @param {string} requestId - Request ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} statusText - Status message
 * @param {string} detailText - Detail message (optional)
 * @param {Object} extraData - Additional data to include (optional)
 */
function updateProgress(requestId, progress, statusText, detailText = '', extraData = {}) {
  const entry = inFlightRequests.get(requestId);
  if (entry) {
    entry.progress = {
      progress,
      statusText,
      detailText,
      timestamp: Date.now(),
      ...extraData
    };
  }
}

/**
 * Clear an in-flight request
 * @param {string} requestId - Request ID to clear
 */
function clearInFlight(requestId) {
  const entry = inFlightRequests.get(requestId);
  if (entry) {
    clearTimeout(entry.timeoutId)
    inFlightRequests.delete(requestId);
  }
}

// ============================================================================
// AI/MENU PROCESSING FUNCTIONS - Core business logic
// ============================================================================


/**
 * Process image request - Main pipeline
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.requestId - Request ID for progress tracking
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise<Object>} Result with success flag and base64 image data
 */
async function processImageRequest({ imageUrl, requestId, signal }) {
  try {
    const settings = await loadSettings();

    assertSetting(settings.model, 'Model not configured');
    assertSetting(settings.apiKey, 'API key not configured');

    console.log('🚀 [IMAGE GENERATION] Starting two-stage pipeline...');
    console.log('📸 [IMAGE GENERATION] Image URL:', imageUrl);

    // STAGE 1: Parse the menu with AI to get intelligent dish selection
    updateProgress(requestId, 5, 'Starting menu analysis...', getRandomFoodFact());
    console.log('⚡ [IMAGE GENERATION] Stage 1: Parsing menu with AI...');
    const stored = await chrome.storage.local.get(['dietaryPreference', 'visualStyle', 'plateStyle']);
    const dietaryPreference = stored.dietaryPreference || 'regular';
    const visualStyle = stored.visualStyle || 'modern';
    const plateStyle = stored.plateStyle || 'verkada';

    let parsedMenuData;
    let dynamicPrompt;

    try {
      parsedMenuData = await parseMenuWithAI({
        imageUrl,
        dietaryPreference,
        apiKey: settings.apiKey,
        requestId,
        updateProgress,
        getRandomFoodFact,
        providerType: 'openai' // Future: make this configurable for Gemini, etc.
      });
      console.log('✅ [IMAGE GENERATION] Stage 1 complete - Menu parsed successfully');
      console.log('🎯 [IMAGE GENERATION] Selected items:', parsedMenuData.selectedItems?.length || 0);
      console.log('🎨 [IMAGE GENERATION] Menu theme:', parsedMenuData.menuTheme);

      // Validate that we have exactly 5 items
      if (parsedMenuData.selectedItems?.length !== 5) {
        console.warn('⚠️ [IMAGE GENERATION] AI returned', parsedMenuData.selectedItems?.length, 'items instead of 5, falling back to static prompt');
        throw new Error('AI did not return exactly 5 items');
      }

      // STAGE 2: Build dynamic prompt from parsed data
      updateProgress(requestId, 52, 'Building visualization prompt...', 'Creating detailed food photography instructions');
      console.log('⚡ [IMAGE GENERATION] Stage 2: Building dynamic prompt...');
      dynamicPrompt = buildImageGenerationPrompt(parsedMenuData, visualStyle, dietaryPreference, plateStyle);
      console.log('✅ [IMAGE GENERATION] Stage 2 complete - Prompt generated');
    } catch (parseError) {
      console.error('❌ [IMAGE GENERATION] Menu parsing failed:', parseError.message);
      throw new Error(`Failed to parse menu: ${parseError.message}`);
    }

    // Use the dynamically generated prompt instead of static one
    const finalPrompt = dynamicPrompt;

    console.log('📝 [IMAGE GENERATION] Using prompt (first 200 chars):', finalPrompt.substring(0, 200) + '...');

    // Enforce timeout via AbortController (only if a positive timeout is set)
    const entry = inFlightRequests.get(requestId);
    if (entry && !entry.timeoutId && typeof settings.timeoutMs === 'number' && settings.timeoutMs > 0) {
      entry.timeoutId = setTimeout(() => {
        try { entry.controller.abort(); } catch (_) {}
      }, settings.timeoutMs);
    }

    updateProgress(requestId, 55, 'Preparing for image generation...', getRandomFoodFact());
    console.log('⬇️ [IMAGE GENERATION] Fetching image for processing...');
    const imageBlob = await fetchImageAsBlob(imageUrl, signal);
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Fetched image is empty');
    }
    console.log('✅ [IMAGE GENERATION] Image fetched, size:', Math.round(imageBlob.size / 1024), 'KB');

    throwIfAborted(signal);

    updateProgress(requestId, 60, 'Generating food visualization...', 'This takes 60-90 seconds. ' + getRandomFoodFact());
    console.log('🤖 [IMAGE GENERATION] Calling image generation API...');
    const aiProvider = selectAiProviderByModel(settings.model);

    // Override the prompt in settings with our dynamic one
    const settingsWithDynamicPrompt = { ...settings, prompt: finalPrompt };
    const request = aiProvider.buildRequest({ settings: settingsWithDynamicPrompt, imageBlob, signal });

    const response = await fetch(request.url, request.options);
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
      throw new Error(`${aiProvider.name} API error: ${errorMessage}`);
    }

    updateProgress(requestId, 85, 'Finalizing image...', 'Processing AI-generated visualization');

    const b64 = await aiProvider.extractResult(response);
    if (!b64) {
      throw new Error(`${aiProvider.name} returned no image data`);
    }

    updateProgress(requestId, 88, 'Image generated!', 'Preparing to merge with menu text');
    console.log('✅ [IMAGE GENERATION] Image generated successfully!');
    console.log('🎉 [IMAGE GENERATION] Two-stage pipeline complete!');

    return { success: true, b64 };
  } catch (error) {
    if (error && (error.name === 'AbortError' || /aborted|abort/i.test(error.message))) {
      console.log('🛑 [IMAGE GENERATION] Request canceled');
      return { success: false, canceled: true, error: 'Request canceled' };
    }
    console.error('❌ [IMAGE GENERATION] Error processing image:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================

/**
 * Main message listener for handling extension requests
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request && request.action === ACTIONS.GET_DIETARY_PREFERENCES) {
    const preferences = Object.keys(DIETARY_PREFERENCES).map(key => ({
      id: DIETARY_PREFERENCES[key].id,
      name: DIETARY_PREFERENCES[key].displayName || DIETARY_PREFERENCES[key].name,
      emoji: DIETARY_PREFERENCES[key].emoji,
      description: DIETARY_PREFERENCES[key].description,
    }));
    sendResponse({ success: true, preferences });
    return true;
  }

  if (request && request.action === ACTIONS.GET_VISUAL_STYLES) {
    const styles = Object.keys(IMAGE_STYLES).map(key => ({
      id: IMAGE_STYLES[key].id,
      name: IMAGE_STYLES[key].displayName || IMAGE_STYLES[key].name,
      emoji: IMAGE_STYLES[key].emoji,
      description: IMAGE_STYLES[key].description,
    }));
    sendResponse({ success: true, styles });
    return true;
  }

  if (request && request.action === ACTIONS.GET_PLATE_STYLES) {
    const styles = Object.keys(PLATE_STYLES).map(key => ({
      id: PLATE_STYLES[key].id,
      name: PLATE_STYLES[key].displayName || PLATE_STYLES[key].name,
      emoji: PLATE_STYLES[key].emoji,
      description: PLATE_STYLES[key].description,
    }));
    sendResponse({ success: true, styles });
    return true;
  }

  if (request && request.action === ACTIONS.GET_PROGRESS) {
    const requestId = request.requestId;
    const entry = inFlightRequests.get(requestId);
    if (entry && entry.progress) {
      sendResponse({ success: true, ...entry.progress });
    } else {
      sendResponse({ success: false, error: 'No progress found' });
    }
    return true;
  }

  if (request && request.action === ACTIONS.PROCESS_IMAGE) {
    const requestId = request.requestId;
    const controller = new AbortController();
    inFlightRequests.set(requestId, {
      controller,
      timeoutId: null,
      progress: {
        progress: 0,
        statusText: 'Starting...',
        detailText: 'Preparing to analyze menu',
        timestamp: Date.now()
      }
    });

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
