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

  console.log(`📐 [GEMINI] Input: ${width}×${height} (ratio: ${ratio.decimal.toFixed(3)}, pixels: ${totalPixels.toLocaleString()})`);
  console.log(`🎯 [GEMINI] Selected config: ${aspectRatio} @ ${resolution}`);

  return { aspectRatio, resolution };
}

/**
 * Parse menu with Google Gemini
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - Gemini API key
 * @param {Function} params.updateProgress - Progress update callback (receives step and optional extra data)
 * @returns {Promise<Object>} Parsed menu data
 */
export async function parseMenuWithGemini({ imageUrl, dietaryPreference, apiKey, updateProgress }) {
  console.log('🍽️ [GEMINI] Starting menu analysis...');
  console.log('📸 [GEMINI] Image URL:', imageUrl);

  try {
    updateProgress(PROGRESS_STEPS.PARSING_MENU_START);

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Fetch the menu image and convert to base64
    updateProgress(PROGRESS_STEPS.FETCHING_MENU_IMAGE);
    console.log('⬇️ [GEMINI] Fetching menu image...');
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const imageBase64 = await blobToBase64(imageBlob);
    const imageSizeKB = Math.round(imageBase64.length / 1024);
    console.log(`✅ [GEMINI] Image fetched, size: ${imageSizeKB} KB`);

    // Get dietary preference context
    const preference = DIETARY_PREFERENCES[dietaryPreference] || DIETARY_PREFERENCES['regular'];
    console.log('📋 [GEMINI] Dietary preference:', preference.name);

    // Build the menu parsing prompt
    updateProgress(PROGRESS_STEPS.PREPARING_AI_ANALYSIS, { preferenceName: preference.name });
    const parsingPrompt = buildMenuParsingPrompt(preference);
    const promptLength = parsingPrompt.length;
    console.log(`📝 [GEMINI] Prompt built, length: ${promptLength} chars`);

    // Gemini 3 Pro configuration
    const modelName = 'gemini-3-pro-preview';

    // Call Gemini 3 Pro (vision model) to parse the menu
    updateProgress(PROGRESS_STEPS.READING_MENU_WITH_AI);
    console.log(`🤖 [GEMINI] Calling ${modelName} for menu analysis...`);

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
        temperature: 0.4,  // 2025 best practice: Lower temp for structured parsing
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
    console.log('📦 [GEMINI] Raw API response:', JSON.stringify(data, null, 2));

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    console.log('💬 [GEMINI] AI Response:\n', aiResponse);

    // Parse the JSON response from AI
    updateProgress(PROGRESS_STEPS.EXTRACTING_DISHES);
    let parsedData;
    try {
      parsedData = parseJsonFromModelText(aiResponse);
      console.log('✅ [GEMINI] Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ [GEMINI] Failed to parse JSON:', parseError);
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }

    console.log('🎯 [GEMINI] Parsed Data:', JSON.stringify(parsedData, null, 2));
    console.log('🍽️ [GEMINI] Selected Items:', parsedData.selectedItems?.length || 0);
    console.log('🎨 [GEMINI] Menu Theme:', parsedData.menuTheme);
    console.log('✨ [GEMINI] Menu analysis complete!');

    // Show selected dishes to the user
    const selectedDishes = parsedData.selectedItems?.map(item => item.name) || [];
    updateProgress(PROGRESS_STEPS.MENU_ANALYZED, { selectedDishes });

    return parsedData;
  } catch (error) {
    console.error('❌ [GEMINI] Error:', error);
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
  const modelName = 'gemini-3-pro-image-preview';
  console.log(`🎨 [GEMINI] Starting image generation with ${modelName}...`);
  console.log('📝 [GEMINI] Prompt length:', prompt.length, 'chars');

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

    console.log(`🎯 [GEMINI] Configuration: ${resolution} resolution, ${aspectRatio} aspect ratio`);
    console.log(`🤖 [GEMINI] Calling ${modelName} for image generation...`);

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
          image_size: resolution,
          aspect_ratio: aspectRatio
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

    console.log('📦 [GEMINI] Extracting image data...');
    const data = await response.json();
    console.log('📦 [GEMINI] Raw API response:', JSON.stringify(data, null, 2));

    const parts = data?.candidates?.[0]?.content?.parts || [];

    // Extract text response if present (Gemini 3 includes text explanation)
    let textResponse = null;
    let b64 = null;
    let thoughtSignature = null;

    for (const part of parts) {
      // Extract text (Gemini 3 Pro Image provides reasoning/explanation)
      if (part.text) {
        textResponse = part.text;
        console.log('💬 [GEMINI] AI explanation:', textResponse);
      }

      // Extract image data - try both formats
      if (part.inlineData && part.inlineData.data) {
        b64 = part.inlineData.data;
        thoughtSignature = part.thought_signature;
        console.log('✅ [GEMINI] Found image data in inlineData format');
      } else if (part.inline_data && part.inline_data.data) {
        b64 = part.inline_data.data;
        thoughtSignature = part.thought_signature;
        console.log('✅ [GEMINI] Found image data in inline_data format');
      }
    }

    if (!b64) {
      console.error('❌ [GEMINI] No image data found in response parts');
      console.error('📦 [GEMINI] Parts structure:', JSON.stringify(parts, null, 2));
      throw new Error('No image data returned from Gemini');
    }

    console.log('✅ [GEMINI] Image generated with Gemini 3 Pro Image!');
    if (textResponse) {
      const maxPreviewLength = 200;
      const preview = textResponse.length > maxPreviewLength
        ? textResponse.substring(0, maxPreviewLength) + '...'
        : textResponse;
      console.log(`📝 [GEMINI] Model provided explanation: ${preview}`);
    }
    if (thoughtSignature) {
      console.log('🧠 [GEMINI] Thought signature available for multi-turn refinement');
    }
    return b64;
  } catch (error) {
    console.error('❌ [GEMINI] Error:', error);
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
