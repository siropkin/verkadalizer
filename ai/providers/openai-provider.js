// ============================================================================
// OPENAI PROVIDER - OpenAI-specific AI implementation
// ============================================================================

import { DIETARY_PREFERENCES, buildMenuParsingPrompt } from '../prompts.js';
import {
  blobToBase64,
  fetchImageAsBlob,
  getImageDimensions,
  calculateAspectRatio,
  upscaleImage,
  downscaleImage,
  makeBackgroundTransparent,
  resizeAiImage,
} from './image-utils.js';
import { PROGRESS_STEPS } from './progress-steps.js';

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

// ============================================================================
// POST-PROCESSING PIPELINE - OpenAI-specific merge pipeline
// ============================================================================

/**
 * Post-process and merge original menu image with AI generated background
 * Full 7-step pipeline for OpenAI since it cannot preserve original text accurately
 *
 * @param {string} originalImageUrl - URL of original menu image
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @param {string} providerName - Provider name for logging
 * @returns {Promise<string>} Base64 string of merged image
 */
async function postProcessImageWithMerge(originalImageUrl, aiImageData, providerName = 'OPENAI') {
  console.log(`🎨 [${providerName}] Starting post-processing pipeline...`);

  try {
    // Load original image
    console.log(`⬇️ [${providerName}] Loading original image...`);
    const originalBlob = await fetchImageAsBlob(originalImageUrl);
    const originalBitmap = await createImageBitmap(originalBlob);

    // Load generated image from base64 data
    console.log(`⬇️ [${providerName}] Loading AI-generated image...`);
    const generatedBlob = await fetch(aiImageData).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    // Store original dimensions for final output
    const originalWidth = originalBitmap.width;
    const originalHeight = originalBitmap.height;
    console.log(`📐 [${providerName}] Original dimensions: ${originalWidth}×${originalHeight}`);

    // Step 1: Upscale original image 2x for better quality processing
    console.log(`⬆️ [${providerName}] Upscaling original image 2x...`);
    const upscaledOriginal = await upscaleImage(originalBitmap, 2);

    // Step 2: Remove dividers from upscaled image (currently disabled)
    // const originalWithoutDividers = await removeDividersFromImage(upscaledOriginal);
    const originalWithoutDividers = upscaledOriginal;

    // Step 3: Make white background transparent (with darkened text)
    console.log(`🎭 [${providerName}] Removing white background and enhancing text...`);
    const originalWithTransparentBg = await makeBackgroundTransparent(originalWithoutDividers);

    // Step 4: Resize AI generated image to match upscaled dimensions
    console.log(`📏 [${providerName}] Resizing AI image to match upscaled dimensions...`);
    const resizedAiImage = await resizeAiImage(generatedBitmap, upscaledOriginal.width, upscaledOriginal.height);

    // Step 5: Merge the images at upscaled resolution
    console.log(`🔗 [${providerName}] Merging original and AI images...`);
    const mergeCanvas = new OffscreenCanvas(upscaledOriginal.width, upscaledOriginal.height);
    const mergeCtx = mergeCanvas.getContext('2d');

    mergeCtx.imageSmoothingEnabled = true;
    mergeCtx.imageSmoothingQuality = 'high';

    // Draw AI background image first
    mergeCtx.drawImage(resizedAiImage, 0, 0, mergeCanvas.width, mergeCanvas.height);

    // Overlay the original image with transparent background
    mergeCtx.drawImage(originalWithTransparentBg, 0, 0);

    // Step 6: Convert merged result to bitmap and downscale to original dimensions
    console.log(`⬇️ [${providerName}] Downscaling to original dimensions...`);
    const mergedBlob = await mergeCanvas.convertToBlob({ type: 'image/png' });
    const mergedBitmap = await createImageBitmap(mergedBlob);
    const finalBitmap = await downscaleImage(mergedBitmap, originalWidth, originalHeight);

    // Step 7: Convert final result to base64
    console.log(`💾 [${providerName}] Converting to base64...`);
    const finalCanvas = new OffscreenCanvas(originalWidth, originalHeight);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(finalBitmap, 0, 0);
    const blob = await finalCanvas.convertToBlob({ type: 'image/png' });
    const base64Result = await blobToBase64(blob);

    console.log(`✅ [${providerName}] Post-processing complete!`);
    return base64Result;
  } catch (error) {
    console.error(`❌ [${providerName}] Post-processing error:`, error);
    throw new Error(`Failed to post-process image: ${error.message}`);
  }
}

/**
 * Post-process and merge original menu image with AI generated background (OpenAI-specific)
 * Uses full merge pipeline since OpenAI cannot preserve original text accurately
 * @param {string} originalImageUrl - URL of original menu image
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @returns {Promise<string>} Base64 string of merged image
 */
export async function postProcessImageWithOpenAI(originalImageUrl, aiImageData) {
  return postProcessImageWithMerge(originalImageUrl, aiImageData, 'OPENAI');
}
