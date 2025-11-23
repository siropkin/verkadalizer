// ============================================================================
// AI PROVIDERS - Provider registry and factory
// ============================================================================

import { OPENAI_PROVIDERS, parseMenuWithOpenAI } from './openai-provider.js';

/**
 * AI Providers registry
 * Add new providers here (e.g., Gemini, Claude, etc.)
 */
export const AI_PROVIDERS = {
  ...OPENAI_PROVIDERS,
  // Future providers can be added here:
  // ...GEMINI_PROVIDERS,
  // ...CLAUDE_PROVIDERS,
};

/**
 * Provider types for menu parsing
 */
const MENU_PARSER_PROVIDERS = {
  'openai': parseMenuWithOpenAI,
  // Future: 'gemini': parseMenuWithGemini,
};

/**
 * Select an AI provider by model ID
 * @param {string} model - Model ID
 * @returns {Object} AI provider configuration
 */
export function selectAiProviderByModel(model) {
  return AI_PROVIDERS[model] || AI_PROVIDERS[Object.keys(AI_PROVIDERS)[0]];
}

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
 * @param {string} params.requestId - Request ID for progress tracking
 * @param {Function} params.updateProgress - Progress update callback
 * @param {Function} params.getRandomFoodFact - Food fact generator
 * @param {string} params.providerType - Provider type (default: 'openai')
 * @returns {Promise<Object>} Parsed menu data
 */
export async function parseMenuWithAI({
  imageUrl,
  dietaryPreference,
  apiKey,
  requestId,
  updateProgress,
  getRandomFoodFact,
  providerType = 'openai'
}) {
  const parser = getMenuParser(providerType);

  // Create a wrapped updateProgress that includes requestId
  const wrappedUpdateProgress = (progress, statusText, detailText = '') => {
    updateProgress(requestId, progress, statusText, detailText);
  };

  return parser({
    imageUrl,
    dietaryPreference,
    apiKey,
    updateProgress: wrappedUpdateProgress,
    getRandomFoodFact,
  });
}
