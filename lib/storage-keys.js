// ============================================================================
// STORAGE KEYS - Centralized storage key constants for the extension
// ============================================================================

/**
 * Namespaced storage keys for chrome.storage.local
 * All keys are prefixed with 'vk.' to avoid collisions.
 */
export const STORAGE_KEYS = {
  // Settings
  SETTINGS: {
    AI_PROVIDER: 'vk.settings.aiProvider',
    DIETARY_PREFERENCE: 'vk.settings.dietaryPreference',
    IMAGE_STYLE: 'vk.settings.imageStyle',
    MENU_LANGUAGE: 'vk.settings.menuLanguage',
  },

  // API Keys (stored separately for clarity)
  API_KEYS: {
    OPENAI: 'vk.settings.apiKeys.openai',
    GEMINI: 'vk.settings.apiKeys.gemini',
  },

  // Internal / Cache metadata (if needed for debugging)
  CACHE: {
    IMAGES_META: 'vk.cache.images.meta',
  },

  // Migration tracking
  MIGRATION: {
    VERSION: 'vk.migration.version',
  },
};

/**
 * Legacy flat key names (for migration from old versions)
 */
export const LEGACY_KEYS = {
  AI_PROVIDER: 'aiProvider',
  OPENAI_API_KEY: 'openaiApiKey',
  GEMINI_API_KEY: 'geminiApiKey',
  DIETARY_PREFERENCE: 'dietaryPreference',
  IMAGE_STYLE: 'imageStyle',
  MENU_LANGUAGE: 'menuLanguage',
  SAVED_IMAGES: 'verkadalizer_saved_images',
};

/**
 * Map from legacy keys to new namespaced keys
 */
const LEGACY_TO_NEW_MAP = {
  [LEGACY_KEYS.AI_PROVIDER]: STORAGE_KEYS.SETTINGS.AI_PROVIDER,
  [LEGACY_KEYS.OPENAI_API_KEY]: STORAGE_KEYS.API_KEYS.OPENAI,
  [LEGACY_KEYS.GEMINI_API_KEY]: STORAGE_KEYS.API_KEYS.GEMINI,
  [LEGACY_KEYS.DIETARY_PREFERENCE]: STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE,
  [LEGACY_KEYS.IMAGE_STYLE]: STORAGE_KEYS.SETTINGS.IMAGE_STYLE,
  [LEGACY_KEYS.MENU_LANGUAGE]: STORAGE_KEYS.SETTINGS.MENU_LANGUAGE,
};

// Current migration version - bump when adding new migrations
const CURRENT_MIGRATION_VERSION = 1;

/**
 * Run storage migration from old flat keys to new namespaced keys.
 * Should be called once at extension startup (e.g., in background.js).
 * 
 * Migration is idempotent - safe to call multiple times.
 * 
 * @returns {Promise<{migrated: boolean, version: number}>}
 */
export async function runStorageMigration() {
  const versionResult = await chrome.storage.local.get([STORAGE_KEYS.MIGRATION.VERSION]);
  const currentVersion = versionResult[STORAGE_KEYS.MIGRATION.VERSION] || 0;

  if (currentVersion >= CURRENT_MIGRATION_VERSION) {
    return { migrated: false, version: currentVersion };
  }

  // Run migration v0 -> v1: copy legacy keys to new namespaced keys
  if (currentVersion < 1) {
    await migrateV0ToV1();
  }

  // Update migration version
  await chrome.storage.local.set({
    [STORAGE_KEYS.MIGRATION.VERSION]: CURRENT_MIGRATION_VERSION,
  });

  return { migrated: true, version: CURRENT_MIGRATION_VERSION };
}

/**
 * Migration v0 -> v1: Copy legacy flat keys to new namespaced keys, then remove legacy keys
 */
async function migrateV0ToV1() {
  const legacyKeys = Object.keys(LEGACY_TO_NEW_MAP);
  const legacyData = await chrome.storage.local.get(legacyKeys);

  const newData = {};

  for (const [legacyKey, newKey] of Object.entries(LEGACY_TO_NEW_MAP)) {
    if (legacyData[legacyKey] !== undefined) {
      // Only copy if the new key doesn't already exist
      const existingNewData = await chrome.storage.local.get([newKey]);
      if (existingNewData[newKey] === undefined) {
        newData[newKey] = legacyData[legacyKey];
      }
    }
  }

  // Save migrated data to new keys
  if (Object.keys(newData).length > 0) {
    await chrome.storage.local.set(newData);
  }

  // Remove legacy keys after successful migration
  // Also remove old base64 image cache (now using IndexedDB)
  const keysToRemove = [...legacyKeys, LEGACY_KEYS.SAVED_IMAGES];
  await chrome.storage.local.remove(keysToRemove);
}

/**
 * Helper to get all settings keys (for reading)
 * @returns {string[]} Array of all new settings keys
 */
export function getAllSettingsKeys() {
  return [
    STORAGE_KEYS.SETTINGS.AI_PROVIDER,
    STORAGE_KEYS.SETTINGS.DIETARY_PREFERENCE,
    STORAGE_KEYS.SETTINGS.IMAGE_STYLE,
    STORAGE_KEYS.SETTINGS.MENU_LANGUAGE,
    STORAGE_KEYS.API_KEYS.OPENAI,
    STORAGE_KEYS.API_KEYS.GEMINI,
  ];
}

/**
 * Helper to get all legacy settings keys (for backward-compatible reading)
 * @returns {string[]} Array of all legacy settings keys
 */
export function getAllLegacySettingsKeys() {
  return [
    LEGACY_KEYS.AI_PROVIDER,
    LEGACY_KEYS.OPENAI_API_KEY,
    LEGACY_KEYS.GEMINI_API_KEY,
    LEGACY_KEYS.DIETARY_PREFERENCE,
    LEGACY_KEYS.IMAGE_STYLE,
    LEGACY_KEYS.MENU_LANGUAGE,
  ];
}

