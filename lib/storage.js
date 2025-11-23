// ============================================================================
// STORAGE - Chrome storage management for settings and cached images
// ============================================================================

import { fetchImageAsBlob } from './image-processing.js';

/**
 * Load user settings from Chrome storage
 * @returns {Promise<Object>} Settings object with apiKey and aiProvider
 */
export async function loadSettings() {
  const stored = await chrome.storage.local.get(['openaiApiKey', 'geminiApiKey', 'aiProvider']);

  // Determine the AI provider (default to 'openai')
  const aiProvider = stored.aiProvider || 'openai';

  // Select the appropriate API key based on provider
  const apiKey = aiProvider === 'gemini' ? stored.geminiApiKey : stored.openaiApiKey;

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

  // Load food preference setting
  const stored = await chrome.storage.local.get(['dietaryPreference']);
  const preferenceId = stored.dietaryPreference || 'regular';

  // Simple hash calculation from image data
  let hash = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    hash = ((hash << 5) - hash + imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) & 0xffffffff;
  }

  // Include food preference in the request ID
  const requestId = `img_${Math.abs(hash).toString(36)}_${preferenceId}`;
  return requestId;
}

/**
 * Save generated image to Chrome storage
 * @param {string} requestId - Request ID
 * @param {string} generatedSrc - Base64 data URL of generated image
 * @returns {Promise<void>}
 */
export async function saveGeneratedImageToStorage(requestId, generatedSrc) {
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

/**
 * Load saved image from Chrome storage
 * @param {string} requestId - Request ID
 * @returns {Promise<Object|null>} Saved image data or null if not found
 */
export async function loadSavedImageFromStorage(requestId) {
  try {
    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};
    return savedImages[requestId] || null;
  } catch (error) {
    console.warn('Failed to load saved image:', error);
    throw error;
  }
}

/**
 * Clean up old saved images from Chrome storage
 * @returns {Promise<void>}
 */
export async function cleanupOldSavedImages() {
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
