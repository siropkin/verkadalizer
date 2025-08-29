chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'processImage') {
    processImage(request.imageUrl, request.originalWidth, request.originalHeight)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function processImage(imageUrl, originalWidth, originalHeight) {
  try {
    const settings = await chrome.storage.local.get(['apiKey', 'model', 'prompt']);
    
    if (!settings.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!settings.model) {
      throw new Error('Model not configured');
    }

    if (!settings.prompt) {
      throw new Error('Prompt not configured');
    }
    
    const imageBlob = await fetchImageAsBlob(imageUrl);
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Fetched image is empty');
    }
    const base64Image = await blobToBase64(imageBlob);
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Base64 image encoding is empty');
    }
    
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
      },
      body: createFormData(base64Image, settings.model, settings.prompt, originalWidth, originalHeight)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No processed image returned from OpenAI');
    }

    const first = data.data[0];
    if (!first.b64_json) {
      throw new Error('OpenAI returned image without url or b64_json');
    }

    return {
      success: true,
      b64: first.b64_json,
      processedImageUrl: `data:image/png;base64,${first.b64_json}`,
      chosenSize: chooseOpenAIImageSize(originalWidth, originalHeight).label,
      originalWidth,
      originalHeight
    };
    
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function fetchImageAsBlob(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function createFormData(base64Image, model, prompt, originalWidth, originalHeight) {
  const formData = new FormData();
  
  const imageBlob = base64ToBlob(base64Image, 'image/png');
  formData.append('image', imageBlob, 'menu.png');
  formData.append('model', model);
  formData.append('prompt', prompt);
  formData.append('n', '1');
  const chosen = chooseOpenAIImageSize(originalWidth, originalHeight);
  if (chosen && chosen.label) {
    formData.append('size', chosen.label);
  }
  // formData.append('quality', 'medium');

  return formData;
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function chooseOpenAIImageSize(originalWidth, originalHeight) {
  const options = [
    { label: '1024x1024', w: 1024, h: 1024, ratio: 1024 / 1024 },
    { label: '1536x1024', w: 1536, h: 1024, ratio: 1536 / 1024 },
    { label: '1024x1536', w: 1024, h: 1536, ratio: 1024 / 1536 },
  ];

  if (!originalWidth || !originalHeight || originalWidth <= 0 || originalHeight <= 0) {
    // Fallback by orientation if unknown
    return options[0];
  }

  const originalRatio = originalWidth / originalHeight;

  // Pick by closest aspect ratio
  let best = options[0];
  let bestDelta = Math.abs(options[0].ratio - originalRatio);
  for (let i = 1; i < options.length; i++) {
    const delta = Math.abs(options[i].ratio - originalRatio);
    if (delta < bestDelta) {
      best = options[i];
      bestDelta = delta;
    }
  }
  return best;
}