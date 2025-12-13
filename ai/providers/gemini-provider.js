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
} from './image-utils.js';
import { PROGRESS_STEPS } from './progress-steps.js';

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
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
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
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
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
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedData = JSON.parse(jsonString.trim());
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

    // Build request body for Gemini 3 Pro Image
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
        }
      }
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
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
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

// ============================================================================
// POST-PROCESSING PIPELINE - Gemini-specific simple pipeline
// ============================================================================

/**
 * Simple post-processing for Gemini that preserves original text natively
 * Minimal pipeline since Gemini keeps text in the generated image
 *
 * @param {string} originalImageUrl - URL of original menu image (used for dimension reference)
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @param {string} providerName - Provider name for logging
 * @returns {Promise<string>} Base64 string of AI-generated image
 */
export async function postProcessImageSimple(originalImageUrl, aiImageData, providerName = 'GEMINI') {
  console.log(`🎨 [${providerName}] Starting simple post-processing (no merge)...`);

  try {
    // Step 1: Load original image (for dimension reference only)
    console.log(`⬇️ [${providerName}] Loading original image for dimensions...`);
    const originalBlob = await fetchImageAsBlob(originalImageUrl);
    const originalBitmap = await createImageBitmap(originalBlob);

    const originalWidth = originalBitmap.width;
    const originalHeight = originalBitmap.height;
    console.log(`📐 [${providerName}] Original dimensions: ${originalWidth}×${originalHeight}`);

    // Step 2: Load AI-generated image
    console.log(`⬇️ [${providerName}] Loading AI-generated image...`);
    const generatedBlob = await fetch(aiImageData).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    console.log(`📐 [${providerName}] Generated dimensions: ${generatedBitmap.width}×${generatedBitmap.height}`);

    // Step 3: Scale generated image to fit original dimensions
    console.log(`📏 [${providerName}] Scaling AI image to fit original dimensions...`);
    const finalCanvas = new OffscreenCanvas(originalWidth, originalHeight);
    const finalCtx = finalCanvas.getContext('2d');

    // Use high-quality image smoothing for scaling
    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';

    // Scale the generated image to exactly fit original dimensions
    finalCtx.drawImage(generatedBitmap, 0, 0, originalWidth, originalHeight);

    // Step 4: Convert to base64 and return
    console.log(`💾 [${providerName}] Converting to base64...`);
    const blob = await finalCanvas.convertToBlob({ type: 'image/png' });
    const base64Result = await blobToBase64(blob);

    console.log(`✅ [${providerName}] Simple post-processing complete!`);
    return base64Result;
  } catch (error) {
    console.error(`❌ [${providerName}] Post-processing error:`, error);
    throw new Error(`Failed to post-process image: ${error.message}`);
  }
}

/**
 * Post-process AI generated image with simple pipeline (Gemini-specific)
 * Uses simple processing since Gemini preserves original text natively
 * @param {string} originalImageUrl - URL of original menu image
 * @param {string} aiImageData - Base64 data URL of AI generated image
 * @returns {Promise<string>} Base64 string of processed image
 */
export async function postProcessImageWithGemini(originalImageUrl, aiImageData) {
  return postProcessImageSimple(originalImageUrl, aiImageData, 'GEMINI');
}
