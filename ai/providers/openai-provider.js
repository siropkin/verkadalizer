// ============================================================================
// OPENAI PROVIDER - OpenAI-specific AI implementation
// ============================================================================

import { DIETARY_PREFERENCES, buildMenuParsingPrompt } from '../prompts.js';
import {
  blobToBase64,
  fetchImageAsBlob,
  getImageDimensions,
  calculateAspectRatio
} from './image-utils.js';
import { PROGRESS_STEPS } from './progress-steps.js';
import { postProcessImage } from './image-processing.js';

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

  const totalPixels = width * height;
  console.log(`📐 [OPENAI] Input: ${width}×${height} (ratio: ${ratio.decimal.toFixed(3)}, pixels: ${totalPixels.toLocaleString()})`);
  console.log(`🎯 [OPENAI] Selected size: ${closestSize.name} (ratio: ${closestSize.ratio.toFixed(3)})`);

  return closestSize.name;
}

/**
 * Parse menu with OpenAI GPT-4o
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - OpenAI API key
 * @param {Function} params.updateProgress - Progress update callback (receives step and optional extra data)
 * @returns {Promise<Object>} Parsed menu data
 */
export async function parseMenuWithOpenAI({ imageUrl, dietaryPreference, apiKey, updateProgress }) {
  console.log('🍽️ [OPENAI] Starting menu analysis...');
  console.log('📸 [OPENAI] Image URL:', imageUrl);

  try {
    updateProgress(PROGRESS_STEPS.PARSING_MENU_START);

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Fetch the menu image and convert to base64
    updateProgress(PROGRESS_STEPS.FETCHING_MENU_IMAGE);
    console.log('⬇️ [OPENAI] Fetching menu image...');
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const imageBase64 = await blobToBase64(imageBlob);
    const imageSizeKB = Math.round(imageBase64.length / 1024);
    console.log(`✅ [OPENAI] Image fetched, size: ${imageSizeKB} KB`);

    // Get dietary preference context
    const preference = DIETARY_PREFERENCES[dietaryPreference] || DIETARY_PREFERENCES['regular'];
    console.log('📋 [OPENAI] Dietary preference:', preference.name);

    // Build the menu parsing prompt
    updateProgress(PROGRESS_STEPS.PREPARING_AI_ANALYSIS, { preferenceName: preference.name });
    const parsingPrompt = buildMenuParsingPrompt(preference);
    const promptLength = parsingPrompt.length;
    console.log(`📝 [OPENAI] Prompt built, length: ${promptLength} chars`);

    // OpenAI GPT-4o configuration
    const modelName = 'gpt-4o';

    // Call GPT-4o (vision model) to parse the menu
    updateProgress(PROGRESS_STEPS.READING_MENU_WITH_AI);
    console.log(`🤖 [OPENAI] Calling ${modelName} for menu analysis...`);
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
      temperature: 0.7
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
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    updateProgress(PROGRESS_STEPS.PROCESSING_AI_RESPONSE);

    const data = await response.json();
    console.log('📦 [OPENAI] Raw API response:', JSON.stringify(data, null, 2));

    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    console.log('💬 [OPENAI] AI Response:\n', aiResponse);

    // Parse the JSON response from AI
    updateProgress(PROGRESS_STEPS.EXTRACTING_DISHES);
    let parsedData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedData = JSON.parse(jsonString.trim());
      console.log('✅ [OPENAI] Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ [OPENAI] Failed to parse JSON:', parseError);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    console.log('🎯 [OPENAI] Parsed Data:', JSON.stringify(parsedData, null, 2));
    console.log('🍽️ [OPENAI] Selected Items:', parsedData.selectedItems?.length || 0);
    console.log('🎨 [OPENAI] Menu Theme:', parsedData.menuTheme);
    console.log('✨ [OPENAI] Menu analysis complete!');

    // Show selected dishes to the user
    const selectedDishes = parsedData.selectedItems?.map(item => item.name) || [];
    updateProgress(PROGRESS_STEPS.MENU_ANALYZED, { selectedDishes });

    return parsedData;
  } catch (error) {
    console.error('❌ [OPENAI] Error:', error);
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
  const modelName = 'gpt-image-1';
  console.log(`🎨 [OPENAI] Starting image generation with ${modelName}...`);
  console.log('📝 [OPENAI] Prompt length:', prompt.length, 'chars');

  try {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get image dimensions and select optimal size
    const dimensions = await getImageDimensions(imageBlob);
    const size = selectOpenAISize(dimensions.width, dimensions.height);

    console.log(`🎯 [OPENAI] Configuration: ${size}`);
    console.log(`🤖 [OPENAI] Calling ${modelName} for image generation...`);

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
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    console.log('📦 [OPENAI] Extracting image data...');
    const data = await response.json();
    console.log('📦 [OPENAI] Raw API response:', JSON.stringify(data, null, 2));

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      console.error('❌ [OPENAI] No image data found in response');
      console.error('📦 [OPENAI] Response structure:', JSON.stringify(data, null, 2));
      throw new Error('No image data returned from OpenAI');
    }

    console.log('✅ [OPENAI] Image generated with GPT-Image-1!');
    return b64;
  } catch (error) {
    console.error('❌ [OPENAI] Error:', error);
    throw error;
  }
}

/**
 * Post-process and merge original menu image with AI generated background (OpenAI-specific)
 * @param {string} originalImageUrl - URL of original menu image
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @returns {Promise<string>} Base64 string of merged image
 */
export async function postProcessImageWithOpenAI(originalImageUrl, aiImageData) {
  return postProcessImage(originalImageUrl, aiImageData, 'OPENAI');
}
