// ============================================================================
// STORAGE - Chrome storage management for settings and cached images
// ============================================================================

import { fetchImageAsBlob } from './image-processing.js';
import { logWarn } from './logger.js';
import { STORAGE_KEYS, LEGACY_KEYS, runStorageMigration } from './storage-keys.js';
import { saveImageToCache, loadImageFromCache, cleanupCache } from './image-cache.js';
import { normalizeImageStyleId } from '../ai/prompts.js';

/**
 * Load user settings from Chrome storage
 * Uses new namespaced keys with fallback to legacy keys for backward compatibility
 * @returns {Promise<Object>} Settings object with apiKey and aiProvider
 */
export async function loadSettings() {
  // Try new keys first, fall back to legacy keys
  const allKeys = [
    STORAGE_KEYS.SETTINGS.AI_PROVIDER,
    STORAGE_KEYS.API_KEYS.OPENAI,
    STORAGE_KEYS.API_KEYS.GEMINI,
    // Legacy keys for backward compatibility
    LEGACY_KEYS.AI_PROVIDER,
    LEGACY_KEYS.OPENAI_API_KEY,
    LEGACY_KEYS.GEMINI_API_KEY,
  ];

  const stored = await chrome.storage.local.get(allKeys);

  // Prefer new keys, fall back to legacy
  const aiProvider = stored[STORAGE_KEYS.SETTINGS.AI_PROVIDER]
    || stored[LEGACY_KEYS.AI_PROVIDER]
    || 'openai';

  const openaiKey = stored[STORAGE_KEYS.API_KEYS.OPENAI]
    || stored[LEGACY_KEYS.OPENAI_API_KEY];

  const geminiKey = stored[STORAGE_KEYS.API_KEYS.GEMINI]
    || stored[LEGACY_KEYS.GEMINI_API_KEY];

  // Select the appropriate API key based on provider
  const apiKey = aiProvider === 'gemini' ? geminiKey : openaiKey;

  return {
    apiKey,
    aiProvider,
  };
}

/**
 * Generate a unique request ID from an image
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} Unique request ID
 */
export async function generateRequestIdFromImage(imageUrl) {
  const imageBlob = await fetchImageAsBlob(imageUrl);
  const bitmap = await createImageBitmap(imageBlob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Load dietary preference AND image style settings (try new keys first, then legacy)
  const allKeys = [
    STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE,
    STORAGE_KEYS.SETTINGS.IMAGE_STYLE,
    LEGACY_KEYS.DIETARY_PREFERENCE,
    LEGACY_KEYS.IMAGE_STYLE,
  ];
  const stored = await chrome.storage.local.get(allKeys);

  const preferenceId = stored[STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE]
    || stored[LEGACY_KEYS.DIETARY_PREFERENCE]
    || 'regular';

  const styleId = stored[STORAGE_KEYS.SETTINGS.IMAGE_STYLE]
    || stored[LEGACY_KEYS.IMAGE_STYLE]
    || 'verkada-classic';
  const normalizedStyleId = normalizeImageStyleId(styleId);

  // Simple hash calculation from image data
  let hash = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    hash = ((hash << 5) - hash + imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) & 0xffffffff;
  }

  // Include BOTH dietary preference AND image style in the request ID
  const requestId = `img_${Math.abs(hash).toString(36)}_${preferenceId}_${normalizedStyleId}`;
  return requestId;
}

/**
 * Save generated image to IndexedDB cache
 * @param {string} requestId - Request ID
 * @param {string} generatedSrc - Base64 data URL of generated image
 * @returns {Promise<void>}
 */
export async function saveGeneratedImageToStorage(requestId, generatedSrc) {
  // Delegate to the new IndexedDB-backed image cache
  await saveImageToCache(requestId, generatedSrc);
}

/**
 * Load saved image from IndexedDB cache
 * @param {string} requestId - Request ID
 * @returns {Promise<Object|null>} Saved image data or null if not found
 */
export async function loadSavedImageFromStorage(requestId) {
  // Delegate to the new IndexedDB-backed image cache
  return await loadImageFromCache(requestId);
}

/**
 * Clean up old saved images from IndexedDB cache
 * @returns {Promise<void>}
 */
export async function cleanupOldSavedImages() {
  // Delegate to the new IndexedDB-backed cache cleanup
  await cleanupCache();
}

/**
 * Initialize storage - run migrations and cleanup
 * Should be called once at extension startup
 * @returns {Promise<void>}
 */
export async function initializeStorage() {
  try {
    // Run key migrations from legacy flat keys to namespaced keys
    const migrationResult = await runStorageMigration();
    if (migrationResult.migrated) {
      logWarn('lib', 'storage', `Migrated storage to version ${migrationResult.version}`);
    }

    // Run initial cache cleanup
    await cleanupCache();
  } catch (error) {
    logWarn('lib', 'storage', `Storage initialization failed: ${error.message}`);
  }
}

