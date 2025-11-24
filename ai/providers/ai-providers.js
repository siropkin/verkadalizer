// ============================================================================
// AI PROVIDERS - Provider registry and factory
// ============================================================================

import { parseMenuWithOpenAI, generateMenuImageWithOpenAI } from './openai-provider.js';
import { parseMenuWithGemini, generateMenuImageWithGemini } from './gemini-provider.js';
import { PROGRESS_STEPS } from './progress-steps.js';

// Re-export progress steps as part of the AI provider API contract
export { PROGRESS_STEPS };

/**
 * Available AI providers metadata
 */
export const AI_PROVIDERS = {
  'openai': { id: 'openai', name: 'OpenAI' },
  'gemini': { id: 'gemini', name: 'Google Gemini' },
};

/**
 * Provider types for menu parsing
 */
const MENU_PARSER_PROVIDERS = {
  'openai': parseMenuWithOpenAI,
  'gemini': parseMenuWithGemini,
};

/**
 * Provider types for image generation
 */
const IMAGE_GENERATOR_PROVIDERS = {
  'openai': generateMenuImageWithOpenAI,
  'gemini': generateMenuImageWithGemini,
};

/**
 * Get the menu parser function for a given provider type
 * @param {string} providerType - Provider type (e.g., 'openai', 'gemini')
 * @returns {Function} Menu parser function
 */
export function getMenuParser(providerType = 'openai') {
  return MENU_PARSER_PROVIDERS[providerType] || MENU_PARSER_PROVIDERS['openai'];
}

/**
 * Parse menu with AI using the specified provider
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - API key
 * @param {Function} params.updateProgress - Progress update callback (receives step and extra data)
 * @param {string} params.providerType - Provider type (default: 'openai')
 * @returns {Promise<Object>} Parsed menu data
 */
export async function parseMenuWithAI({
  imageUrl,
  dietaryPreference,
  apiKey,
  updateProgress,
  providerType = 'openai'
}) {
  const parser = getMenuParser(providerType);

  return parser({
    imageUrl,
    dietaryPreference,
    apiKey,
    updateProgress,
  });
}

/**
 * Get the image generator function for a given provider type
 * @param {string} providerType - Provider type (e.g., 'openai', 'gemini')
 * @returns {Function} Image generator function
 */
export function getImageGenerator(providerType = 'openai') {
  return IMAGE_GENERATOR_PROVIDERS[providerType] || IMAGE_GENERATOR_PROVIDERS['openai'];
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
