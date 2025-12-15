// ============================================================================
// MESSAGE ACTIONS - Canonical action names for runtime messaging
// ============================================================================
// Shared contract used by ESM entrypoints (background + popup).
// NOTE: `content.js` is a classic content script and intentionally mirrors these
// string values locally (no imports) to avoid MV3 content-script edge cases.

/**
 * Canonical message action string constants.
 */
export const ACTIONS = {
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
