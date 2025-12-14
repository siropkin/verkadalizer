// ============================================================================
// IMPORTS - External modules
// ============================================================================

import { DIETARY_PREFERENCES, IMAGE_STYLES, TRANSLATION_LANGUAGES } from './ai/prompts.js';
import { buildMenuFoodGenerationPrompt } from './ai/prompts/menu-food-generation.js';
import { buildMenuTranslationPrompt } from './ai/prompts/menu-translation.js';
import { parseMenuWithAI, generateImageWithAI, translateMenuImageWithAI, AI_PROVIDERS } from './ai/providers/ai-providers.js';
import { PROGRESS_STEPS } from './ai/providers/progress-steps.js';
import { fetchImageAsBlob, mergeMenuLayerWithBackground } from './lib/image-processing.js';
import { loadSettings, generateRequestIdFromImage, saveGeneratedImageToStorage, loadSavedImageFromStorage, cleanupOldSavedImages } from './lib/storage.js';
import { assertSetting, throwIfAborted } from './lib/utils.js';

// ============================================================================
// MIGRATION - Storage migration for unified image styles
// ============================================================================

/**
 * Migrate old storage format to new unified IMAGE_STYLE format
 * Called on extension startup/update
 */
async function migrateStorageToUnifiedStyle() {
  const stored = await chrome.storage.local.get(['plateStyle', 'visualStyle', 'imageStyle']);

  // If new format already exists, no migration needed
  if (stored.imageStyle) {
    console.log('✅ [MIGRATION] Already using new unified imageStyle format');
    return;
  }

  // If no old settings exist, set default
  if (!stored.plateStyle && !stored.visualStyle) {
    console.log('✅ [MIGRATION] No previous settings - setting default');
    await chrome.storage.local.set({ imageStyle: 'verkada-classic' });
    return;
  }

  const oldPlateStyle = stored.plateStyle || 'verkada';
  const oldVisualStyle = stored.visualStyle || 'modern';

  console.log('🔄 [MIGRATION] Migrating from old format:', { oldPlateStyle, oldVisualStyle });

  // Migration mapping
  let newImageStyle = 'verkada-classic'; // default fallback

  if (oldPlateStyle === 'verkada') {
    if (oldVisualStyle === 'modern') {
      newImageStyle = 'verkada-classic';
    } else if (oldVisualStyle === 'cyberpunk') {
      newImageStyle = 'verkada-cyberpunk';
    } else if (oldVisualStyle === 'maximalist') {
      newImageStyle = 'verkada-grandmillennial';
    } else {
      newImageStyle = 'verkada-classic';
    }
  } else if (oldPlateStyle === 'asian' && oldVisualStyle === 'cyberpunk') {
    // Style removed - map to closest supported Verkada style
    newImageStyle = 'verkada-cyberpunk';
  } else if (oldPlateStyle === 'colorful' && oldVisualStyle === 'maximalist') {
    // Style removed - map to closest supported Verkada style
    newImageStyle = 'verkada-grandmillennial';
  } else if (oldPlateStyle === 'rustic' && oldVisualStyle === 'vintage-film') {
    newImageStyle = 'rustic-film';
  } else {
    newImageStyle = 'verkada-classic';
  }

  console.log('✅ [MIGRATION] Setting new imageStyle:', newImageStyle);

  await chrome.storage.local.set({ imageStyle: newImageStyle });
  await chrome.storage.local.remove(['plateStyle', 'visualStyle']);

  console.log('✅ [MIGRATION] Migration complete');
}

// Run migration on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  migrateStorageToUnifiedStyle();
});

// Also run on service worker startup
migrateStorageToUnifiedStyle();

// ============================================================================
// CONSTANTS - Configuration and Static Data
// ============================================================================

// Action types for message handling
const ACTIONS = {
  GET_DIETARY_PREFERENCES: 'getDietaryPreferences',
  GET_IMAGE_STYLES: 'getImageStyles',
  GET_AI_PROVIDERS: 'getAiProviders',
  GET_TRANSLATION_LANGUAGES: 'getTranslationLanguages',
  GENERATE_REQUEST_ID: 'generateRequestId',
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
  SAVE_GENERATED_IMAGE: 'saveGeneratedImage',
  LOAD_SAVED_IMAGE: 'loadSavedImage',
  CLEANUP_OLD_IMAGES: 'cleanupOldImages',
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

    console.log('🚀 [IMAGE GENERATION] Starting three-stage pipeline...');
    console.log('📸 [IMAGE GENERATION] Image URL:', imageUrl);

    // STAGE 1: Parse the menu with AI to get intelligent dish selection
    updateProgress(requestId, PROGRESS_STEPS.STARTING);
    console.log('⚡ [IMAGE GENERATION] Stage 1: Parsing menu with AI...');
    const stored = await chrome.storage.local.get(['dietaryPreference', 'imageStyle', 'menuLanguage']);
    const dietaryPreference = stored.dietaryPreference || 'regular';
    const imageStyle = stored.imageStyle || 'verkada-classic';
    const menuLanguage = stored.menuLanguage || 'none';

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
      console.log('✅ [IMAGE GENERATION] Stage 1 complete - Menu parsed successfully');
      console.log('🎯 [IMAGE GENERATION] Selected items:', parsedMenuData.selectedItems?.length || 0);
      console.log('🎨 [IMAGE GENERATION] Menu theme:', parsedMenuData.menuTheme);

      // Validate that we have at least some items
      if (!parsedMenuData.selectedItems || parsedMenuData.selectedItems.length < 3) {
        console.warn('⚠️ [IMAGE GENERATION] AI returned too few items:', parsedMenuData.selectedItems?.length || 0);
        throw new Error(`AI returned insufficient items (${parsedMenuData.selectedItems?.length || 0}). Need at least 3 dishes.`);
      }

      if (parsedMenuData.selectedItems.length > 12) {
        console.warn('⚠️ [IMAGE GENERATION] AI returned too many items:', parsedMenuData.selectedItems.length, '(max 12)');
        console.warn('⚠️ [IMAGE GENERATION] Trimming to first 12 items for optimal visualization');
        parsedMenuData.selectedItems = parsedMenuData.selectedItems.slice(0, 12);
      }

      console.log('✅ [IMAGE GENERATION] Validation passed - proceeding with', parsedMenuData.selectedItems.length, 'dishes');

      // STAGE 2: Build dynamic prompt from parsed data
      updateProgress(requestId, PROGRESS_STEPS.BUILDING_PROMPT);
      console.log('⚡ [IMAGE GENERATION] Stage 2: Building dynamic prompt...');
      dynamicPrompt = buildMenuFoodGenerationPrompt(parsedMenuData, imageStyle, dietaryPreference, settings.aiProvider);
      console.log('✅ [IMAGE GENERATION] Stage 2 complete - Prompt generated');
    } catch (parseError) {
      console.error('❌ [IMAGE GENERATION] Menu parsing failed:', parseError.message);
      throw new Error(`Failed to parse menu: ${parseError.message}`);
    }

    // Use the dynamically generated prompt instead of static one
    const finalPrompt = dynamicPrompt;

    console.log('📝 [IMAGE GENERATION] Using prompt (first 200 chars):', finalPrompt.substring(0, 200) + '...');

    // Timeout is now handled by the provider internally

    updateProgress(requestId, PROGRESS_STEPS.PREPARING_IMAGE_GENERATION);
    console.log('⬇️ [IMAGE GENERATION] Fetching image for processing...');
    const imageBlob = await fetchImageAsBlob(imageUrl, signal);
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Fetched image is empty');
    }
    console.log('✅ [IMAGE GENERATION] Image fetched, size:', Math.round(imageBlob.size / 1024), 'KB');

    throwIfAborted(signal);

    const isTranslationEnabled = menuLanguage && menuLanguage !== 'none';
    updateProgress(requestId, PROGRESS_STEPS.GENERATING_IMAGE, {
      translationEnabled: isTranslationEnabled,
      translationLanguage: menuLanguage || 'none'
    });
    console.log('🤖 [IMAGE GENERATION] Calling image generation API...');

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
        console.warn('⚠️ [IMAGE GENERATION] Menu translation failed; falling back to original menu layer:', err?.message || err);
        return null;
      })
      : Promise.resolve(null);

    const [generatedB64, translatedMenuB64] = await Promise.all([foodPromise, translationPromise]);

    console.log('✅ [IMAGE GENERATION] Image generated successfully!');

    // STAGE 3: Post-process and merge images (background-level)
    updateProgress(requestId, PROGRESS_STEPS.FINALIZING_IMAGE);
    console.log('⚡ [IMAGE GENERATION] Stage 3: Post-processing and merging images...');

    updateProgress(requestId, PROGRESS_STEPS.MERGING_IMAGES, {
      translationEnabled: isTranslationEnabled,
      translationLanguage: menuLanguage || 'none'
    });

    const backgroundDataUrl = `data:image/png;base64,${generatedB64}`;
    const menuLayerSrc = (isTranslationEnabled && translatedMenuB64)
      ? `data:image/png;base64,${translatedMenuB64}`
      : imageUrl;

    // Merge food background with ORIGINAL menu layer (no translation) OR TRANSLATED menu layer
    const b64 = await mergeMenuLayerWithBackground(imageUrl, menuLayerSrc, backgroundDataUrl);

    updateProgress(requestId, PROGRESS_STEPS.IMAGE_GENERATED);
    console.log('✅ [IMAGE GENERATION] Post-processing complete!');
    console.log('🎉 [IMAGE GENERATION] Three-stage pipeline complete!');

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
  if (request && request.action === ACTIONS.GET_AI_PROVIDERS) {
    const providers = Object.keys(AI_PROVIDERS).map(key => ({
      id: AI_PROVIDERS[key].id,
      name: AI_PROVIDERS[key].name,
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
      sendResponse({
        success: true,
        step: entry.progress.step,
        extra: entry.progress.extra,
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
});
