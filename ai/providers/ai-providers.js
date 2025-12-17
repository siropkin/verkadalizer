// ============================================================================
// AI PROVIDERS - Provider registry and factory
// ============================================================================

import { parseMenuWithOpenAI, generateMenuImageWithOpenAI, translateMenuImageWithOpenAI } from './openai-provider.js';
import { parseMenuWithGemini, generateMenuImageWithGemini, translateMenuImageWithGemini } from './gemini-provider.js';
import { PROGRESS_STEPS } from './progress-steps.js';

// Re-export progress steps as part of the AI provider API contract
export { PROGRESS_STEPS };

/**
 * Provider registry. Each provider must implement the same interface.
 *
 * @type {Record<string, {meta: {id: string, name: string}, parseMenu: Function, generateImage: Function, translateMenuImage: Function}>}
 */
export const PROVIDERS = {
  openai: {
    meta: { id: 'openai', name: 'OpenAI' },
    parseMenu: parseMenuWithOpenAI,
    generateImage: generateMenuImageWithOpenAI,
    translateMenuImage: translateMenuImageWithOpenAI,
  },
  gemini: {
    meta: { id: 'gemini', name: 'Google Gemini' },
    parseMenu: parseMenuWithGemini,
    generateImage: generateMenuImageWithGemini,
    translateMenuImage: translateMenuImageWithGemini,
  },
};

/**
 * Get provider implementation for a given provider type.
 * @param {string} providerType - Provider type (e.g., 'openai', 'gemini')
 * @returns {{meta: {id: string, name: string}, parseMenu: Function, generateImage: Function, translateMenuImage: Function}}
 */
export function getProvider(providerType = 'openai') {
  return PROVIDERS[providerType] || PROVIDERS.openai;
}

/**
 * Get the menu parser function for a given provider type.
 * @param {string} providerType - Provider type (e.g., 'openai', 'gemini')
 * @returns {Function} Menu parser function
 */
export function getMenuParser(providerType = 'openai') {
  return getProvider(providerType).parseMenu;
}

/**
 * Parse menu with AI using the specified provider
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - API key
 * @param {Function} params.updateProgress - Progress update callback (receives step and extra data)
 * @param {string} params.providerType - Provider type (default: 'openai')
 * @param {string|null} params.translationLanguage - Translation language ID (e.g., 'fr', 'es') or null for no translation
 * @returns {Promise<Object>} Parsed menu data (includes detectedLanguage, and translated fields if translation enabled)
 */
export async function parseMenuWithAI({
  imageUrl,
  dietaryPreference,
  apiKey,
  updateProgress,
  providerType = 'openai',
  translationLanguage = null
}) {
  const parser = getMenuParser(providerType);

  return parser({
    imageUrl,
    dietaryPreference,
    apiKey,
    updateProgress,
    translationLanguage,
  });
}

/**
 * Get the image generator function for a given provider type
 * @param {string} providerType - Provider type (e.g., 'openai', 'gemini')
 * @returns {Function} Image generator function
 */
export function getImageGenerator(providerType = 'openai') {
  return getProvider(providerType).generateImage;
}

/**
 * Generate menu image with AI using the specified provider
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Image generation prompt
 * @param {Blob} params.imageBlob - Image blob for reference
 * @param {string} params.apiKey - API key
 * @param {AbortSignal} params.signal - Abort signal
 * @param {string} params.providerType - Provider type (default: 'openai')
 * @returns {Promise<string>} Base64 encoded image
 */
export async function generateImageWithAI({
  prompt,
  imageBlob,
  apiKey,
  signal,
  providerType = 'openai'
}) {
  const generator = getImageGenerator(providerType);

  return generator({
    prompt,
    imageBlob,
    apiKey,
    signal,
  });
}

/**
 * Get the image post-processor function for a given provider type
 * @param {string} providerType - Provider type (e.g., 'openai', 'gemini')
 * @returns {Function} Image post-processor function
 */
export function getMenuTranslator(providerType = 'openai') {
  return getProvider(providerType).translateMenuImage;
}

/**
 * Translate menu image with AI using the specified provider (image-to-image).
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Translation prompt
 * @param {Blob} params.imageBlob - Original menu image blob
 * @param {string} params.apiKey - API key
 * @param {AbortSignal} params.signal - Abort signal
 * @param {string} params.providerType - Provider type (default: 'openai')
 * @returns {Promise<string>} Base64 encoded translated menu image
 */
export async function translateMenuImageWithAI({
  prompt,
  imageBlob,
  apiKey,
  signal,
  providerType = 'openai'
}) {
  const translator = getMenuTranslator(providerType);
  return translator({ prompt, imageBlob, apiKey, signal });
}
