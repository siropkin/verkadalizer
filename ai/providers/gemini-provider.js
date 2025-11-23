// ============================================================================
// GEMINI PROVIDER - Google Gemini AI implementation
// ============================================================================

import { DIETARY_PREFERENCES, buildMenuParsingPrompt } from '../prompts.js';

/**
 * Convert a Blob to base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} Base64 string without data URL prefix
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = String(reader.result).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetch an image from a URL and return as Blob
 * @param {string} imageUrl - URL of the image
 * @param {AbortSignal} signal - Optional abort signal
 * @returns {Promise<Blob>} Image blob
 */
async function fetchImageAsBlob(imageUrl, signal) {
  try {
    const response = await fetch(imageUrl, { signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    // Normalize AbortError
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

/**
 * Parse menu with Google Gemini (Stage 1)
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - Gemini API key
 * @param {Function} params.updateProgress - Progress update callback
 * @param {Function} params.getRandomFoodFact - Food fact generator
 * @returns {Promise<Object>} Parsed menu data
 */
export async function parseMenuWithGemini({ imageUrl, dietaryPreference, apiKey, updateProgress, getRandomFoodFact }) {
  console.log('🍽️ [GEMINI] Starting menu analysis...');
  console.log('📸 [GEMINI] Image URL:', imageUrl);

  try {
    updateProgress(5, 'Analyzing menu with Gemini...', getRandomFoodFact());

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Fetch the menu image and convert to base64
    updateProgress(10, 'Loading menu image...', 'Fetching high-resolution image');
    console.log('⬇️ [GEMINI] Fetching menu image...');
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const imageBase64 = await blobToBase64(imageBlob);
    console.log('✅ [GEMINI] Image fetched, size:', Math.round(imageBase64.length / 1024), 'KB');

    // Get dietary preference context
    const preference = DIETARY_PREFERENCES[dietaryPreference] || DIETARY_PREFERENCES['regular'];
    console.log('📋 [GEMINI] Dietary preference:', preference.name);

    // Build the menu parsing prompt
    updateProgress(15, 'Preparing AI analysis...', `Analyzing for ${preference.name} preferences`);
    const parsingPrompt = buildMenuParsingPrompt(preference);
    console.log('📝 [GEMINI] Prompt built, length:', parsingPrompt.length, 'chars');

    // Call Gemini 2.5 Flash (vision model) to parse the menu
    updateProgress(20, 'Reading menu with AI...', 'This takes 20-30 seconds. ' + getRandomFoodFact());
    console.log('🤖 [GEMINI] Calling Gemini 2.5 Flash for menu analysis...');
    const requestBody = {
      contents: [
        {
          parts: [
            { text: parsingPrompt },
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
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

    updateProgress(40, 'Processing AI response...', getRandomFoodFact());

    const data = await response.json();
    console.log('📦 [GEMINI] Raw API response:', JSON.stringify(data, null, 2));

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    console.log('💬 [GEMINI] AI Response:\n', aiResponse);

    // Parse the JSON response from AI
    updateProgress(45, 'Extracting dishes...', 'Identifying the best menu items');
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
    if (parsedData.selectedItems && parsedData.selectedItems.length > 0) {
      const dishNames = parsedData.selectedItems.map(item => item.name);
      const displayNames = dishNames.length > 3
        ? `${dishNames.slice(0, 3).join(', ')}, and ${dishNames.length - 3} more`
        : dishNames.join(', ');
      updateProgress(50, 'Menu analyzed!', `Selected: ${displayNames}`);
    }

    return parsedData;
  } catch (error) {
    console.error('❌ [GEMINI] Error:', error);
    throw error;
  }
}

/**
 * Generate menu image with Gemini 2.5 Flash Image
 * @param {Object} params - Parameters
 * @param {string} params.prompt - Image generation prompt
 * @param {Blob} params.imageBlob - Image blob for reference
 * @param {string} params.apiKey - Gemini API key
 * @param {AbortSignal} params.signal - Abort signal
 * @returns {Promise<string>} Base64 encoded image
 */
export async function generateMenuImageWithGemini({ prompt, imageBlob, apiKey, signal }) {
  console.log('🎨 [GEMINI] Starting image generation...');
  console.log('📝 [GEMINI] Prompt length:', prompt.length, 'chars');

  try {
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Convert image blob to base64
    console.log('🤖 [GEMINI] Calling Gemini 2.5 Flash Image for image generation...');
    const imageBase64 = await blobToBase64(imageBlob);

    // Build request for Gemini 2.5 Flash Image
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
        responseModalities: ['IMAGE']
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
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

    let b64 = null;
    for (const part of parts) {
      // Try both inline_data (old format) and inlineData (new format)
      if (part.inlineData && part.inlineData.data) {
        b64 = part.inlineData.data;
        console.log('✅ [GEMINI] Found image data in inlineData format');
        break;
      } else if (part.inline_data && part.inline_data.data) {
        b64 = part.inline_data.data;
        console.log('✅ [GEMINI] Found image data in inline_data format');
        break;
      }
    }

    if (!b64) {
      console.error('❌ [GEMINI] No image data found in response parts');
      console.error('📦 [GEMINI] Parts structure:', JSON.stringify(parts, null, 2));
      throw new Error('No image data returned from Gemini');
    }

    console.log('✅ [GEMINI] Image generated successfully!');
    return b64;
  } catch (error) {
    console.error('❌ [GEMINI] Error:', error);
    throw error;
  }
}
