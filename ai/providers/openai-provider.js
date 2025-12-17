// ============================================================================
// OPENAI PROVIDER - OpenAI-specific AI implementation
// ============================================================================

import { DIETARY_PREFERENCES, buildMenuParsingPrompt } from '../prompts.js';
import {
  blobToBase64,
  fetchImageAsBlob,
  getImageDimensions,
  calculateAspectRatio,
} from '../../lib/image/utils.js';
import { PROGRESS_STEPS } from './progress-steps.js';
import { parseJsonFromModelText, readErrorMessage } from './provider-utils.js';
import { logInfo, logWarn, logError } from '../../lib/logger.js';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

const MODELS = {
  parse: 'gpt-4o',           // Menu parsing (vision + JSON)
  image: 'gpt-image-1.5',    // Image generation/editing (upgraded Dec 2025)
};

// ============================================================================
// OPENAI PROVIDER API - Public functions
// ============================================================================


/**
 * OpenAI GPT-Image-1 supported sizes for edits endpoint
 */
const OPENAI_IMAGE_SIZES = [
  { width: 1024, height: 1024, ratio: 1.000, name: '1024x1024' },     // Square
  { width: 1536, height: 1024, ratio: 1.500, name: '1536x1024' },     // Landscape
  { width: 1024, height: 1536, ratio: 0.667, name: '1024x1536' }      // Portrait
];

/**
 * Select optimal OpenAI image size based on input image aspect ratio
 * @param {number} width - Input image width
 * @param {number} height - Input image height
 * @returns {string} Best matching size (e.g., '1536x1024')
 */
function selectOpenAISize(width, height) {
  const ratio = calculateAspectRatio(width, height);
  const targetRatio = ratio.decimal;

  let closestSize = OPENAI_IMAGE_SIZES[0];
  let smallestDifference = Infinity;

  for (const size of OPENAI_IMAGE_SIZES) {
    const difference = Math.abs(targetRatio - size.ratio);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestSize = size;
    }
  }

  logInfo('provider', 'openai', `Image config: ${width}x${height} -> ${closestSize.name}`);

  return closestSize.name;
}

/**
 * Parse menu with OpenAI GPT-4o
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - OpenAI API key
 * @param {Function} params.updateProgress - Progress update callback (receives step and optional extra data)
 * @param {string|null} params.translationLanguage - Translation language ID (e.g., 'fr', 'es') or null for no translation
 * @returns {Promise<Object>} Parsed menu data (includes detectedLanguage, and translated fields if translation enabled)
 */
export async function parseMenuWithOpenAI({ imageUrl, dietaryPreference, apiKey, updateProgress, translationLanguage = null }) {
  logInfo('provider', 'openai', 'Starting menu parsing');

  try {
    updateProgress(PROGRESS_STEPS.PARSING_MENU_START);

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Fetch the menu image and convert to base64
    updateProgress(PROGRESS_STEPS.FETCHING_MENU_IMAGE);
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const imageBase64 = await blobToBase64(imageBlob);

    // Get dietary preference context
    const preference = DIETARY_PREFERENCES[dietaryPreference] || DIETARY_PREFERENCES['regular'];

    // Build the menu parsing prompt (with optional translation)
    updateProgress(PROGRESS_STEPS.PREPARING_AI_ANALYSIS, { preferenceName: preference.name });
    const parsingPrompt = buildMenuParsingPrompt(preference, translationLanguage);

    const modelName = MODELS.parse;

    // Call GPT-4o (vision model) to parse the menu
    updateProgress(PROGRESS_STEPS.READING_MENU_WITH_AI);
    logInfo('provider', 'openai', `Calling ${modelName} for menu parsing`);
    const requestBody = {
      model: modelName,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: parsingPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      // Lower temperature for deterministic structured output
      temperature: 0.3,
      // Enforce JSON output format for reliable parsing
      response_format: { type: 'json_object' }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response);
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    updateProgress(PROGRESS_STEPS.PROCESSING_AI_RESPONSE);

    const data = await response.json();

    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    // Parse the JSON response from AI
    updateProgress(PROGRESS_STEPS.EXTRACTING_DISHES);
    let parsedData;
    try {
      parsedData = parseJsonFromModelText(aiResponse);
    } catch (parseError) {
      logError('provider', 'openai', 'Failed to parse JSON response', parseError.message);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    logInfo('provider', 'openai', `Menu parsed: ${parsedData.selectedItems?.length || 0} items`);

    // Show selected dishes to the user
    const selectedDishes = parsedData.selectedItems?.map(item => item.name) || [];
    updateProgress(PROGRESS_STEPS.MENU_ANALYZED, { selectedDishes });

    return parsedData;
  } catch (error) {
    logError('provider', 'openai', 'Menu parsing failed', error.message);
    throw error;
  }
}

/**
 * Generate menu image with OpenAI GPT-Image-1
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Image generation prompt
 * @param {Blob} params.imageBlob - Image blob for reference
 * @param {string} params.apiKey - OpenAI API key
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise<string>} Base64 encoded image
 */
export async function generateMenuImageWithOpenAI({ prompt, imageBlob, apiKey, signal }) {
  const modelName = MODELS.image;
  logInfo('provider', 'openai', `Starting image generation with ${modelName}`);

  try {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get image dimensions and select optimal size
    const dimensions = await getImageDimensions(imageBlob);
    const size = selectOpenAISize(dimensions.width, dimensions.height);

    // Build request for GPT-Image-1
    const formData = new FormData();
    formData.append('model', modelName);
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('input_fidelity', 'high');
    formData.append('quality', 'high');
    formData.append('size', size);
    formData.append('image', imageBlob, 'image.png');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
      signal,
    });

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response);
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      logError('provider', 'openai', 'No image data in response');
      throw new Error('No image data returned from OpenAI');
    }

    logInfo('provider', 'openai', 'Image generation complete');
    return b64;
  } catch (error) {
    logError('provider', 'openai', 'Image generation failed', error.message);
    throw error;
  }
}

/**
 * Translate menu image with OpenAI GPT-Image-1 (layout-preserving translation)
 * This is a dedicated entrypoint so the pipeline can run translation in parallel with food generation.
 *
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Translation prompt
 * @param {Blob} params.imageBlob - Original menu image blob (reference)
 * @param {string} params.apiKey - OpenAI API key
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise<string>} Base64 encoded translated menu image
 */
export async function translateMenuImageWithOpenAI({ prompt, imageBlob, apiKey, signal }) {
  // Same endpoint/model as generation; prompt differs (text-only translation image).
  return generateMenuImageWithOpenAI({ prompt, imageBlob, apiKey, signal });
}
