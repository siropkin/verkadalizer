// ============================================================================
// GEMINI PROVIDER - Google Gemini AI implementation
// ============================================================================

import { DIETARY_PREFERENCES, buildMenuParsingPrompt } from '../prompts.js';
import {
  blobToBase64,
  fetchImageAsBlob,
  getImageDimensions,
  calculateAspectRatio,
  findClosestAspectRatio,
} from '../../lib/image/utils.js';
import { PROGRESS_STEPS } from './progress-steps.js';
import { parseJsonFromModelText, readErrorMessage } from './provider-utils.js';
import { logInfo, logWarn, logError } from '../../lib/logger.js';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

const MODELS = {
  parse: 'gemini-2.5-flash',           // Menu parsing (vision + JSON) - Flash for speed
  image: 'gemini-3-pro-image-preview', // Image generation
};

// ============================================================================
// GEMINI PROVIDER API - Public functions
// ============================================================================


/**
 * Gemini 3 Pro Image supported aspect ratios
 */
const GEMINI_ASPECT_RATIOS = [
  '1:1',   // 1.000 - Square
  '2:3',   // 0.667 - Portrait
  '3:2',   // 1.500 - Landscape
  '3:4',   // 0.750 - Portrait
  '4:3',   // 1.333 - Landscape
  '4:5',   // 0.800 - Portrait
  '5:4',   // 1.250 - Landscape
  '9:16',  // 0.562 - Portrait (mobile)
  '16:9',  // 1.778 - Landscape (widescreen)
  '21:9'   // 2.333 - Ultra-wide
];

/**
 * Select optimal Gemini aspect ratio and resolution based on input image
 * @param {number} width - Input image width
 * @param {number} height - Input image height
 * @returns {Object} { aspectRatio, resolution }
 */
function selectGeminiConfig(width, height) {
  const ratio = calculateAspectRatio(width, height);
  const aspectRatio = findClosestAspectRatio(ratio.decimal, GEMINI_ASPECT_RATIOS);

  // Auto-select resolution based on image size (total pixels)
  const totalPixels = width * height;
  const threshold4K = 3840 * 2160;
  const threshold2K = 1920 * 1080;
  let resolution;

  if (totalPixels >= threshold4K) {
    // 4K+ images
    resolution = '4K';
  } else if (totalPixels >= threshold2K) {
    // 2K+ images
    resolution = '2K';
  } else {
    // Smaller images
    resolution = '1K';
  }

  logInfo('provider', 'gemini', `Image config: ${width}x${height} -> ${aspectRatio} @ ${resolution}`);

  return { aspectRatio, resolution };
}

/**
 * Parse menu with Google Gemini
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - Gemini API key
 * @param {Function} params.updateProgress - Progress update callback (receives step and optional extra data)
 * @param {string|null} params.translationLanguage - Translation language ID (e.g., 'fr', 'es') or null for no translation
 * @returns {Promise<Object>} Parsed menu data (includes detectedLanguage, and translated fields if translation enabled)
 */
export async function parseMenuWithGemini({ imageUrl, dietaryPreference, apiKey, updateProgress, translationLanguage = null }) {
  logInfo('provider', 'gemini', 'Starting menu parsing');

  try {
    updateProgress(PROGRESS_STEPS.PARSING_MENU_START);

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
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

    // Call Gemini Flash (vision model) to parse the menu
    updateProgress(PROGRESS_STEPS.READING_MENU_WITH_AI);
    logInfo('provider', 'gemini', `Calling ${modelName} for menu parsing`);

    const requestBody = {
      contents: [
        {
          parts: [
            { text: parsingPrompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64
              },
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,  // Lower temp for deterministic structured parsing
        responseMimeType: 'application/json'
      },
      // 2025 best practice: Safety settings for better output quality
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    updateProgress(PROGRESS_STEPS.PROCESSING_AI_RESPONSE);

    const data = await response.json();

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    // Parse the JSON response from AI
    updateProgress(PROGRESS_STEPS.EXTRACTING_DISHES);
    let parsedData;
    try {
      parsedData = parseJsonFromModelText(aiResponse);
    } catch (parseError) {
      logError('provider', 'gemini', 'Failed to parse JSON response', parseError.message);
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }

    logInfo('provider', 'gemini', `Menu parsed: ${parsedData.selectedItems?.length || 0} items`);

    // Show selected dishes to the user
    const selectedDishes = parsedData.selectedItems?.map(item => item.name) || [];
    updateProgress(PROGRESS_STEPS.MENU_ANALYZED, { selectedDishes });

    return parsedData;
  } catch (error) {
    logError('provider', 'gemini', 'Menu parsing failed', error.message);
    throw error;
  }
}

/**
 * Generate menu image with Gemini 3 Pro Image
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Image generation prompt
 * @param {Blob} params.imageBlob - Image blob for reference
 * @param {string} params.apiKey - Gemini API key
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise<string>} Base64 encoded image
 */
export async function generateMenuImageWithGemini({
  prompt,
  imageBlob,
  apiKey,
  signal
}) {
  const modelName = MODELS.image;
  logInfo('provider', 'gemini', `Starting image generation with ${modelName}`);

  try {
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Get image dimensions and select optimal configuration
    const dimensions = await getImageDimensions(imageBlob);
    const { aspectRatio, resolution } = selectGeminiConfig(
      dimensions.width,
      dimensions.height
    );

    // Convert image blob to base64
    const imageBase64 = await blobToBase64(imageBlob);

    // Build request body for Gemini 3 Pro Image with 2025 optimizations
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          imageSize: resolution,
          aspectRatio: aspectRatio
        },
        // 2025 best practice: Lower temperature (0.6-0.7) for photorealistic output
        // Higher temps create artistic/abstract results, lower temps create precise/realistic
        temperature: 0.65
      },
      // 2025 best practice: Safety settings for professional food photography
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_ONLY_HIGH'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_ONLY_HIGH'
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
      }
    );

    if (!response.ok) {
      const errorMessage = await readErrorMessage(response);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();

    const parts = data?.candidates?.[0]?.content?.parts || [];

    // Extract image data
    let b64 = null;

    for (const part of parts) {
      // Extract image data - try both formats
      if (part.inlineData && part.inlineData.data) {
        b64 = part.inlineData.data;
      } else if (part.inline_data && part.inline_data.data) {
        b64 = part.inline_data.data;
      }
    }

    if (!b64) {
      logError('provider', 'gemini', 'No image data in response');
      throw new Error('No image data returned from Gemini');
    }

    logInfo('provider', 'gemini', 'Image generation complete');
    return b64;
  } catch (error) {
    logError('provider', 'gemini', 'Image generation failed', error.message);
    throw error;
  }
}

/**
 * Translate menu image with Gemini 3 Pro Image (layout-preserving translation)
 * Dedicated entrypoint for parallel translation + food generation.
 *
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Translation prompt
 * @param {Blob} params.imageBlob - Original menu image blob (reference)
 * @param {string} params.apiKey - Gemini API key
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise<string>} Base64 encoded translated menu image
 */
export async function translateMenuImageWithGemini({ prompt, imageBlob, apiKey, signal }) {
  return generateMenuImageWithGemini({ prompt, imageBlob, apiKey, signal });
}
