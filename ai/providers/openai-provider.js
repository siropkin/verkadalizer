// ============================================================================
// OPENAI PROVIDER - OpenAI-specific AI implementation
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
 * Parse menu with OpenAI GPT-4o (Stage 1)
 * @param {Object} params - Parameters
 * @param {string} params.imageUrl - URL of menu image
 * @param {string} params.dietaryPreference - Dietary preference ID
 * @param {string} params.apiKey - OpenAI API key
 * @param {Function} params.updateProgress - Progress update callback
 * @param {Function} params.getRandomFoodFact - Food fact generator
 * @returns {Promise<Object>} Parsed menu data
 */
export async function parseMenuWithOpenAI({ imageUrl, dietaryPreference, apiKey, updateProgress, getRandomFoodFact }) {
  console.log('🍽️ [OPENAI] Starting menu analysis...');
  console.log('📸 [OPENAI] Image URL:', imageUrl);

  try {
    updateProgress(5, 'Analyzing menu...', getRandomFoodFact());

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Fetch the menu image and convert to base64
    updateProgress(10, 'Loading menu image...', 'Fetching high-resolution image');
    console.log('⬇️ [OPENAI] Fetching menu image...');
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const imageBase64 = await blobToBase64(imageBlob);
    console.log('✅ [OPENAI] Image fetched, size:', Math.round(imageBase64.length / 1024), 'KB');

    // Get dietary preference context
    const preference = DIETARY_PREFERENCES[dietaryPreference] || DIETARY_PREFERENCES['regular'];
    console.log('📋 [OPENAI] Dietary preference:', preference.name);

    // Build the menu parsing prompt
    updateProgress(15, 'Preparing AI analysis...', `Analyzing for ${preference.name} preferences`);
    const parsingPrompt = buildMenuParsingPrompt(preference);
    console.log('📝 [OPENAI] Prompt built, length:', parsingPrompt.length, 'chars');

    // Call GPT-4o (vision model) to parse the menu
    updateProgress(20, 'Reading menu with AI...', 'This takes 20-30 seconds. ' + getRandomFoodFact());
    console.log('🤖 [OPENAI] Calling OpenAI GPT-4o for menu analysis...');
    const requestBody = {
      model: 'gpt-4o',
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
      max_tokens: 2000,
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

    updateProgress(40, 'Processing AI response...', getRandomFoodFact());

    const data = await response.json();
    console.log('📦 [OPENAI] Raw API response:', JSON.stringify(data, null, 2));

    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    console.log('💬 [OPENAI] AI Response:\n', aiResponse);

    // Parse the JSON response from AI
    updateProgress(45, 'Extracting dishes...', 'Identifying the best menu items');
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
    if (parsedData.selectedItems && parsedData.selectedItems.length > 0) {
      const dishNames = parsedData.selectedItems.map(item => item.name);
      // Show first 3 items, then "and X more" if there are more
      const displayNames = dishNames.length > 3
        ? `${dishNames.slice(0, 3).join(', ')}, and ${dishNames.length - 3} more`
        : dishNames.join(', ');
      updateProgress(50, 'Menu analyzed!', `Selected: ${displayNames}`);
    }

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
  console.log('🎨 [OPENAI] Starting image generation...');
  console.log('📝 [OPENAI] Prompt length:', prompt.length, 'chars');

  try {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build request for GPT-Image-1
    console.log('🤖 [OPENAI] Calling GPT-Image-1 for image generation...');
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('n', '1');
    formData.append('input_fidelity', 'high');
    formData.append('quality', 'high');
    formData.append('size', '1536x1024');
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
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('No image data returned from OpenAI');
    }

    console.log('✅ [OPENAI] Image generated successfully!');
    return b64;
  } catch (error) {
    console.error('❌ [OPENAI] Error:', error);
    throw error;
  }
}
