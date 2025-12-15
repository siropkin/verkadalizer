// ============================================================================
// IMAGE CACHE - IndexedDB-backed image cache with TTL and LRU eviction
// ============================================================================

import { idbGet, idbPut, idbDelete, idbGetAll } from './idb.js';
import { logInfo, logWarn } from './logger.js';

const STORE_NAME = 'generatedImages';

// Cache configuration
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_MAX_ENTRIES = 30;

/**
 * @typedef {Object} CachedImage
 * @property {string} requestId - Unique identifier for the image
 * @property {Blob} blob - Image data as Blob
 * @property {string} mimeType - MIME type of the image
 * @property {number} sizeBytes - Size of the blob in bytes
 * @property {number} createdAt - Timestamp when image was created
 * @property {number} lastAccessedAt - Timestamp when image was last accessed
 * @property {string} [preferenceId] - Dietary preference used for generation
 * @property {string} [styleId] - Image style used for generation
 */

/**
 * Save a generated image to the cache
 * @param {string} requestId - Unique request ID
 * @param {string} dataUrl - Base64 data URL of the image
 * @returns {Promise<void>}
 */
export async function saveImageToCache(requestId, dataUrl) {
  try {
    // Convert data URL to Blob for efficient storage
    const blob = dataUrlToBlob(dataUrl);
    const now = Date.now();

    /** @type {CachedImage} */
    const entry = {
      requestId,
      blob,
      mimeType: blob.type,
      sizeBytes: blob.size,
      createdAt: now,
      lastAccessedAt: now,
    };

    await idbPut(STORE_NAME, entry);
    logInfo('lib', 'image-cache', `Saved image to cache: ${requestId} (${formatBytes(blob.size)})`);

    // Run cleanup after saving
    await cleanupCache();
  } catch (error) {
    logWarn('lib', 'image-cache', `Failed to save image to cache: ${error.message}`);
    // Don't throw - cache failures shouldn't break the main flow
  }
}

/**
 * Load a generated image from the cache
 * @param {string} requestId - Unique request ID
 * @returns {Promise<{generatedSrc: string, timestamp: number}|null>} Image data or null if not found/expired
 */
export async function loadImageFromCache(requestId) {
  try {
    /** @type {CachedImage|null} */
    const entry = await idbGet(STORE_NAME, requestId);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const age = Date.now() - entry.createdAt;
    if (age > CACHE_TTL_MS) {
      logInfo('lib', 'image-cache', `Cache entry expired, deleting: ${requestId}`);
      await idbDelete(STORE_NAME, requestId);
      return null;
    }

    // Update lastAccessedAt for LRU tracking
    entry.lastAccessedAt = Date.now();
    await idbPut(STORE_NAME, entry);

    // Convert Blob back to data URL for display
    const dataUrl = await blobToDataUrl(entry.blob);

    return {
      generatedSrc: dataUrl,
      timestamp: entry.createdAt,
    };
  } catch (error) {
    logWarn('lib', 'image-cache', `Failed to load image from cache: ${error.message}`);
    return null;
  }
}

/**
 * Clean up expired and excess cache entries
 * - Removes entries older than TTL (7 days)
 * - Enforces max entries limit (30) using LRU eviction
 * @returns {Promise<void>}
 */
export async function cleanupCache() {
  try {
    const entries = await idbGetAll(STORE_NAME);
    const now = Date.now();
    let deletedCount = 0;

    // Phase 1: Delete expired entries
    const validEntries = [];
    for (const entry of entries) {
      const age = now - entry.createdAt;
      if (age > CACHE_TTL_MS) {
        await idbDelete(STORE_NAME, entry.requestId);
        deletedCount++;
      } else {
        validEntries.push(entry);
      }
    }

    // Phase 2: Enforce max entries with LRU eviction
    if (validEntries.length > CACHE_MAX_ENTRIES) {
      // Sort by lastAccessedAt ascending (oldest access first)
      validEntries.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

      const toDelete = validEntries.length - CACHE_MAX_ENTRIES;
      for (let i = 0; i < toDelete; i++) {
        await idbDelete(STORE_NAME, validEntries[i].requestId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logInfo('lib', 'image-cache', `Cache cleanup: removed ${deletedCount} entries`);
    }
  } catch (error) {
    logWarn('lib', 'image-cache', `Cache cleanup failed: ${error.message}`);
    // Don't throw - cleanup failures shouldn't break the main flow
  }
}

/**
 * Clear all cached images
 * @returns {Promise<void>}
 */
export async function clearAllCachedImages() {
  try {
    const entries = await idbGetAll(STORE_NAME);
    for (const entry of entries) {
      await idbDelete(STORE_NAME, entry.requestId);
    }
    logInfo('lib', 'image-cache', 'Cleared all cached images');
  } catch (error) {
    logWarn('lib', 'image-cache', `Failed to clear cache: ${error.message}`);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<{count: number, totalSizeBytes: number}>}
 */
export async function getCacheStats() {
  try {
    const entries = await idbGetAll(STORE_NAME);
    const totalSizeBytes = entries.reduce((sum, e) => sum + (e.sizeBytes || 0), 0);
    return {
      count: entries.length,
      totalSizeBytes,
    };
  } catch (error) {
    logWarn('lib', 'image-cache', `Failed to get cache stats: ${error.message}`);
    return { count: 0, totalSizeBytes: 0 };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert a data URL to a Blob
 * @param {string} dataUrl - Base64 data URL
 * @returns {Blob}
 */
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([uint8Array], { type: mimeType });
}

/**
 * Convert a Blob to a data URL
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>}
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

