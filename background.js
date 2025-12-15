// ============================================================================
// IMPORTS - External modules
// ============================================================================

import { DIETARY_PREFERENCES, IMAGE_STYLES, TRANSLATION_LANGUAGES } from './ai/prompts.js';
import { buildMenuFoodGenerationPrompt } from './ai/prompts/menu-food-generation.js';
import { buildMenuTranslationPrompt } from './ai/prompts/menu-translation.js';
import { parseMenuWithAI, generateImageWithAI, translateMenuImageWithAI, PROVIDERS } from './ai/providers/ai-providers.js';
import { PROGRESS_STEPS } from './ai/providers/progress-steps.js';
import { fetchImageAsBlob, mergeMenuLayerWithBackground } from './lib/image-processing.js';
import { ACTIONS } from './lib/messages/actions.js';
import { stepToProgressData } from './lib/progress-steps.js';
import { loadSettings, generateRequestIdFromImage, saveGeneratedImageToStorage, loadSavedImageFromStorage, cleanupOldSavedImages, initializeStorage } from './lib/storage.js';
import { assertSetting, throwIfAborted } from './lib/utils.js';
import { logInfo, logWarn, logError } from './lib/logger.js';
import { STORAGE_KEYS, LEGACY_KEYS } from './lib/storage-keys.js';

/**
 * @typedef {Object} ProgressState
 * @property {string} step - Progress step identifier (see `ai/providers/progress-steps.js`)
 * @property {Object} extra - Optional extra payload for UI
 * @property {number} timestamp - Epoch millis when progress was last updated
 */

/**
 * @typedef {Object} InFlightRequest
 * @property {AbortController} controller
 * @property {number|null} timeoutId
 * @property {ProgressState} progress
 */

// ============================================================================
// CONSTANTS - Configuration and Static Data
// ============================================================================

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

// Tracks in-flight requests by requestId
/** @type {Map<string, InFlightRequest>} */
const inFlightRequests = new Map();


// ============================================================================
// PROGRESS MANAGEMENT
// ============================================================================

/**
 * Update progress for a request with a step identifier
 * @param {string} requestId - Request ID
 * @param {string} step - Progress step identifier from PROGRESS_STEPS
 * @param {Object} extra - Additional data for dynamic content (optional)
 */
function updateProgress(requestId, step, extra = {}) {
  const entry = inFlightRequests.get(requestId);
  if (entry) {
    entry.progress = {
      step,
      extra,
      timestamp: Date.now(),
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

    assertSetting(settings.aiProvider, 'AI Provider not configured');
    assertSetting(settings.apiKey, 'API key not configured');

    logInfo('background', 'pipeline', 'Starting three-stage pipeline');

    // STAGE 1: Parse the menu with AI to get intelligent dish selection
    updateProgress(requestId, PROGRESS_STEPS.STARTING);
    logInfo('background', 'pipeline', 'Stage 1: Parsing menu with AI');

    // Load settings using new namespaced keys with fallback to legacy
    const settingsKeys = [
      STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE,
      STORAGE_KEYS.SETTINGS.IMAGE_STYLE,
      STORAGE_KEYS.SETTINGS.MENU_LANGUAGE,
      LEGACY_KEYS.DIETARY_PREFERENCE,
      LEGACY_KEYS.IMAGE_STYLE,
      LEGACY_KEYS.MENU_LANGUAGE,
    ];
    const stored = await chrome.storage.local.get(settingsKeys);

    const dietaryPreference = stored[STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE]
      || stored[LEGACY_KEYS.DIETARY_PREFERENCE]
      || 'regular';
    const imageStyle = stored[STORAGE_KEYS.SETTINGS.IMAGE_STYLE]
      || stored[LEGACY_KEYS.IMAGE_STYLE]
      || 'verkada-classic';
    const menuLanguage = stored[STORAGE_KEYS.SETTINGS.MENU_LANGUAGE]
      || stored[LEGACY_KEYS.MENU_LANGUAGE]
      || 'none';

    let parsedMenuData;
    let dynamicPrompt;

    try {
      // Create a wrapped updateProgress for providers
      const wrappedUpdateProgress = (step, extra = {}) => {
        updateProgress(requestId, step, extra);
      };

      // Use the selected AI provider from settings
      parsedMenuData = await parseMenuWithAI({
        imageUrl,
        dietaryPreference,
        apiKey: settings.apiKey,
        updateProgress: wrappedUpdateProgress,
        providerType: settings.aiProvider || 'openai'
      });
      logInfo('background', 'pipeline', `Stage 1 complete: ${parsedMenuData.selectedItems?.length || 0} items selected`);

      // Validate that we have at least some items
      if (!parsedMenuData.selectedItems || parsedMenuData.selectedItems.length < 3) {
        logWarn('background', 'pipeline', `AI returned too few items: ${parsedMenuData.selectedItems?.length || 0}`);
        throw new Error(`AI returned insufficient items (${parsedMenuData.selectedItems?.length || 0}). Need at least 3 dishes.`);
      }

      if (parsedMenuData.selectedItems.length > 12) {
        logWarn('background', 'pipeline', `AI returned ${parsedMenuData.selectedItems.length} items, trimming to 12`);
        parsedMenuData.selectedItems = parsedMenuData.selectedItems.slice(0, 12);
      }

      // STAGE 2: Build dynamic prompt from parsed data
      updateProgress(requestId, PROGRESS_STEPS.BUILDING_PROMPT);
      logInfo('background', 'pipeline', 'Stage 2: Building dynamic prompt');
      dynamicPrompt = buildMenuFoodGenerationPrompt(parsedMenuData, imageStyle, dietaryPreference, settings.aiProvider);
      logInfo('background', 'pipeline', 'Stage 2 complete');
    } catch (parseError) {
      logError('background', 'pipeline', 'Menu parsing failed', parseError.message);
      throw new Error(`Failed to parse menu: ${parseError.message}`);
    }

    // Use the dynamically generated prompt instead of static one
    const finalPrompt = dynamicPrompt;

    // Timeout is now handled by the provider internally

    updateProgress(requestId, PROGRESS_STEPS.PREPARING_IMAGE_GENERATION);
    const imageBlob = await fetchImageAsBlob(imageUrl, signal);
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Fetched image is empty');
    }

    throwIfAborted(signal);

    const isTranslationEnabled = menuLanguage && menuLanguage !== 'none';
    updateProgress(requestId, PROGRESS_STEPS.GENERATING_IMAGE, {
      translationEnabled: isTranslationEnabled,
      translationLanguage: menuLanguage || 'none'
    });
    logInfo('background', 'pipeline', 'Calling image generation API');

    // Run food generation and (optional) menu translation in parallel
    const foodPromise = generateImageWithAI({
      prompt: finalPrompt,
      imageBlob,
      apiKey: settings.apiKey,
      signal,
      providerType: settings.aiProvider
    });

    const translationPromise = isTranslationEnabled
      ? translateMenuImageWithAI({
        prompt: buildMenuTranslationPrompt(menuLanguage),
        imageBlob,
        apiKey: settings.apiKey,
        signal,
        providerType: settings.aiProvider
      }).catch((err) => {
        logWarn('background', 'pipeline', 'Menu translation failed, using original layer', err?.message || err);
        return null;
      })
      : Promise.resolve(null);

    const [generatedB64, translatedMenuB64] = await Promise.all([foodPromise, translationPromise]);

    logInfo('background', 'pipeline', 'Image generated');

    // STAGE 3: Post-process and merge images (background-level)
    updateProgress(requestId, PROGRESS_STEPS.FINALIZING_IMAGE);
    logInfo('background', 'pipeline', 'Stage 3: Post-processing and merging');

    updateProgress(requestId, PROGRESS_STEPS.MERGING_IMAGES, {
      translationEnabled: isTranslationEnabled,
      translationLanguage: menuLanguage || 'none'
    });

    const backgroundDataUrl = `data:image/png;base64,${generatedB64}`;
    const hasTranslatedLayer = isTranslationEnabled && !!translatedMenuB64;
    const menuLayerSrc = hasTranslatedLayer
      ? `data:image/png;base64,${translatedMenuB64}`
      : imageUrl;

    // Merge food background with ORIGINAL menu layer (no translation) OR TRANSLATED menu layer
    // Use 'contain' for AI-generated layers (preserves aspect, no crop), 'stretch' for originals
    const resizeMode = hasTranslatedLayer ? 'contain' : 'stretch';
    const b64 = await mergeMenuLayerWithBackground(imageUrl, menuLayerSrc, backgroundDataUrl, { resizeMode });

    updateProgress(requestId, PROGRESS_STEPS.IMAGE_GENERATED);
    logInfo('background', 'pipeline', 'Pipeline complete');

    return { success: true, b64 };
  } catch (error) {
    if (error && (error.name === 'AbortError' || /aborted|abort/i.test(error.message))) {
      logInfo('background', 'pipeline', 'Request canceled');
      return { success: false, canceled: true, error: 'Request canceled' };
    }
    logError('background', 'pipeline', 'Error processing image', error?.message || error);
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
  if (request && request.action === ACTIONS.GET_AI_PROVIDERS) {
    const providers = Object.values(PROVIDERS).map((provider) => ({
      id: provider.meta.id,
      name: provider.meta.name,
    }));
    sendResponse({ success: true, providers });
    return true;
  }

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

  if (request && request.action === ACTIONS.GET_IMAGE_STYLES) {
    const styles = Object.keys(IMAGE_STYLES).map(key => ({
      id: IMAGE_STYLES[key].id,
      name: IMAGE_STYLES[key].displayName || IMAGE_STYLES[key].name,
      emoji: IMAGE_STYLES[key].emoji,
      description: IMAGE_STYLES[key].description,
    }));
    sendResponse({ success: true, styles });
    return true;
  }

  if (request && request.action === ACTIONS.GET_TRANSLATION_LANGUAGES) {
    const languages = Object.keys(TRANSLATION_LANGUAGES).map(key => ({
      id: TRANSLATION_LANGUAGES[key].id,
      name: TRANSLATION_LANGUAGES[key].displayName || TRANSLATION_LANGUAGES[key].name,
      emoji: TRANSLATION_LANGUAGES[key].emoji,
      description: TRANSLATION_LANGUAGES[key].description,
    }));
    sendResponse({ success: true, languages });
    return true;
  }

  if (request && request.action === ACTIONS.GET_PROGRESS) {
    const requestId = request.requestId;
    const entry = inFlightRequests.get(requestId);
    if (entry && entry.progress) {
      const progressData = stepToProgressData(entry.progress.step, entry.progress.extra || {});
      sendResponse({
        success: true,
        step: entry.progress.step,
        extra: entry.progress.extra,
        progressData,
        timestamp: entry.progress.timestamp
      });
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
        step: PROGRESS_STEPS.STARTING,
        extra: {},
        timestamp: Date.now()
      }
    });

    processImageRequest({ imageUrl: request.imageUrl, requestId, signal: controller.signal })
      .then(result => {
        // Provide a final UI payload for the content script so it doesn't need its own STEP_CONFIG.
        // (The in-flight entry may be cleared immediately after responding.)
        const finalProgressData = result && result.success
          ? stepToProgressData(PROGRESS_STEPS.COMPLETE, {})
          : undefined;
        sendResponse({ ...result, requestId, progressData: finalProgressData });
      })
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

});

// ============================================================================
// EXTENSION LIFECYCLE
// ============================================================================

// Initialize storage on extension install/update and on service worker startup
chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
  logInfo('background', 'lifecycle', 'Storage initialized on install/update');
});

// Also initialize on service worker startup (handles browser restart)
initializeStorage().then(() => {
  logInfo('background', 'lifecycle', 'Storage initialized on startup');
}).catch(error => {
  logWarn('background', 'lifecycle', `Storage initialization failed: ${error.message}`);
});
