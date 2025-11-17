// Dietary preference configurations with prompt modifiers
const DIETARY_PREFERENCES = {
  'regular': {
    id: 'regular',
    name: 'Regular',
    displayName: 'Regular (Default)',
    emoji: '🍽️',
    description: 'All menu items available - no dietary restrictions',
    modifier: '', // No additional constraints
  },
  'vegetarian': {
    id: 'vegetarian',
    name: 'Vegetarian',
    emoji: '🥗',
    description: 'Plant-based dishes with eggs and dairy - no meat, poultry, or fish',
    modifier: '\n\n## DIETARY PREFERENCE: VEGETARIAN\n- Select ONLY vegetarian dishes from the menu (no meat, poultry, or fish)\n- Include plant-based proteins, vegetables, grains, pasta, legumes, eggs, and dairy\n- If the menu has limited vegetarian options, prioritize salads, pasta dishes, grain bowls, and vegetable-based items',
  },
  'vegan': {
    id: 'vegan',
    name: 'Vegan',
    emoji: '🌱',
    description: 'Strictly plant-based - no animal products including dairy and eggs',
    modifier: '\n\n## DIETARY PREFERENCE: VEGAN\n- Select ONLY vegan dishes from the menu (no animal products: no meat, poultry, fish, dairy, eggs, or honey)\n- Include plant-based proteins, vegetables, grains, legumes, nuts, and seeds\n- If the menu has limited vegan options, prioritize salads (without cheese/dressing), vegetable dishes, grain bowls, and fruit-based items',
  },
  'gluten-free': {
    id: 'gluten-free',
    name: 'Gluten Free',
    emoji: '🌾',
    description: 'No wheat, barley, rye, or gluten-containing ingredients',
    modifier: '\n\n## DIETARY PREFERENCE: GLUTEN FREE\n- Select ONLY gluten-free dishes from the menu (no wheat, barley, rye, or derivatives)\n- Include naturally gluten-free items: grilled proteins, rice dishes, salads, vegetables, fruits\n- Avoid pasta, bread, breaded items, and dishes with flour-based sauces unless explicitly marked gluten-free',
  },
  'dairy-free': {
    id: 'dairy-free',
    name: 'Dairy Free',
    emoji: '🥛',
    description: 'No milk, cheese, butter, cream, or dairy products',
    modifier: '\n\n## DIETARY PREFERENCE: DAIRY FREE\n- Select ONLY dairy-free dishes from the menu (no milk, cheese, butter, cream, or yogurt)\n- Include dishes with meat, poultry, fish, vegetables, grains, and non-dairy alternatives\n- Avoid creamy sauces, cheese-topped dishes, and items with visible dairy products',
  },
  'healthy': {
    id: 'healthy',
    name: 'Healthy',
    emoji: '💪',
    description: 'Nutrient-dense, balanced meals with lean proteins and vegetables',
    modifier: '\n\n## DIETARY PREFERENCE: HEALTHY\n- Prioritize nutrient-dense, balanced dishes with lean proteins, whole grains, and vegetables\n- Select grilled, baked, or steamed items over fried options\n- Include colorful vegetable-forward dishes, salads with lean proteins, grain bowls, and fish\n- Avoid heavily fried, cream-based, or processed items',
  },
  'high-protein': {
    id: 'high-protein',
    name: 'High Protein',
    emoji: '🥩',
    description: 'Protein-forward dishes with substantial meat, fish, eggs, or legumes',
    modifier: '\n\n## DIETARY PREFERENCE: HIGH PROTEIN\n- Prioritize dishes with substantial protein content (meat, poultry, fish, seafood, eggs, legumes)\n- Select items like steaks, grilled chicken, fish fillets, seafood platters, egg dishes, and protein bowls\n- Ensure each dish features protein as the primary component\n- Include sides that complement protein (vegetables, legumes) rather than just carbohydrates',
  },
  'keto': {
    id: 'keto',
    name: 'Keto',
    emoji: '🥑',
    description: 'High-fat, low-carb with no bread, pasta, rice, or sugar',
    modifier: '\n\n## DIETARY PREFERENCE: KETO\n- Select ONLY low-carb, high-fat dishes from the menu (no bread, pasta, rice, potatoes, or sugary items)\n- Prioritize fatty cuts of meat, fish with healthy fats, eggs, cheese, non-starchy vegetables, and nuts\n- Include dishes like steak, salmon, chicken with skin, salads with high-fat dressings, and cheese-based items\n- Avoid all grains, legumes, starchy vegetables, and fruit-based dishes',
  },
};

// Visual style configurations with prompt modifiers
const IMAGE_STYLES = {
  'modern': {
    id: 'modern',
    name: 'Modern Photography',
    displayName: 'Modern Photography (Default)',
    emoji: '📸',
    description: 'Clean, contemporary food photography with natural lighting',
    lighting: `**Lighting**: Soft, diffused natural light
- Single soft light source positioned at 10-2 o'clock angle
- Creates gentle shadows for depth but keeps everything bright and appetizing
- Window-light quality, not harsh or artificial`,
    background: `- Soft gradient background in warm tones: beige-to-cream, OR soft sage green, OR warm off-white
  * Minimal, clean, Instagram-worthy aesthetic
  * Background fades naturally into the surface below`,
    surface: `- Natural surface visible: light marble with subtle veining, OR white concrete, OR natural light wood with visible grain`,
    colorPalette: `- Colors should be vibrant and natural, making food look fresh and appetizing`,
    atmosphere: `Modern, clean, contemporary food photography aesthetic.`,
    camera: `- Sharp focus on the food with beautiful bokeh in background
- Restaurant-quality, magazine-worthy presentation`
  },
  'dark-academia': {
    id: 'dark-academia',
    name: 'Moody Dark Academia',
    emoji: '🕯️',
    description: 'Dramatic chiaroscuro lighting with deep shadows and rich atmosphere',
    lighting: `**Lighting**: Dramatic chiaroscuro lighting
- Single warm light source from the side (Rembrandt lighting style)
- Deep, rich shadows contrasting with golden highlights
- Creates bold dramatic atmosphere like a Renaissance painting
- Candlelit dinner ambiance with mysterious depth`,
    background: `- Dark, moody gradient: deep charcoal to rich brown, or black to deep burgundy
  * Editorial fine-dining aesthetic with rustic textures
  * Dramatic and luxurious atmosphere`,
    surface: `- Aged dark wood with visible weathering and character, OR black slate with natural texture, OR deep mahogany surface`,
    colorPalette: `- Rich, saturated colors with crushed blacks and deep shadows
- Warm golden highlights on food surfaces
- Luxurious, dramatic color palette`,
    atmosphere: `Dark academia aesthetic - moody, dramatic, editorial fine-dining with theatrical lighting. Evoke mystery and sophistication.`,
    camera: `- High contrast with deep blacks and rich highlights
- Slightly warmer color grading
- Dramatic depth with bold shadows`
  },
  'pastel-dream': {
    id: 'pastel-dream',
    name: 'Pastel Dream Pop',
    emoji: '🌸',
    description: 'Soft, ethereal aesthetic with dreamy pastel colors',
    lighting: `**Lighting**: Ultra-soft, diffused overhead light
- Almost flat but dreamy, ethereal quality
- Gentle glow creating soft, romantic atmosphere
- No harsh shadows, everything bathed in soft light
- Slight overexposure for dreamy effect`,
    background: `- Soft pastel gradient: blush pink to lavender, OR mint to peach, OR cream to soft lilac
  * Whimsical, kawaii café vibes
  * Add delicate decorative elements like small flowers or cotton candy wisps`,
    surface: `- White marble with rose gold accents, OR glossy ceramic tiles in soft colors, OR pearl-white surface with iridescent sheen`,
    colorPalette: `- Desaturated pastels throughout: blush pink, lavender, mint, peach, soft yellow
- Creamy whites and gentle colors
- Soft, dreamy, Instagram-worthy aesthetic`,
    atmosphere: `Pastel dream pop aesthetic - soft, whimsical, ethereal. Like a magical café in a fairy tale with gentle romantic vibes.`,
    camera: `- Slightly overexposed by 0.5 stops for dreamy glow
- Soft focus edges with bloom effect
- Gentle, romantic rendering`
  },
  'cyberpunk': {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Kitchen',
    emoji: '⚡',
    description: 'Futuristic sci-fi aesthetic with dramatic neon lighting',
    lighting: `**Lighting**: Futuristic multi-colored LED lighting
- Dramatic neon lights in electric cyan, hot magenta, and deep purple
- Colored backlighting creating bold rim lights on food
- High contrast with glowing neon accents
- Sci-fi atmosphere with dramatic colored shadows`,
    background: `- Dark background (near black) with glowing neon strips or holographic elements
  * Blade Runner meets molecular gastronomy aesthetic
  * Add subtle digital/holographic UI elements or neon signs`,
    surface: `- Glossy black acrylic surface with neon reflections, OR metallic chrome surface reflecting colored lights, OR dark glass with cyberpunk neon glow`,
    colorPalette: `- Electric, vivid colors: neon cyan, hot magenta, acid green, electric purple
- Deep blacks contrasting with vibrant neons
- Futuristic, high-tech color palette`,
    atmosphere: `Cyberpunk neon aesthetic - futuristic restaurant from 2077. High-tech molecular gastronomy meets dramatic neon lighting and sci-fi vibes.`,
    camera: `- High contrast with chromatic aberration on edges
- Lens flares from neon lights
- Sharp, modern, futuristic rendering`
  },
  'vintage-film': {
    id: 'vintage-film',
    name: 'Vintage Film Photography',
    emoji: '📷',
    description: 'Nostalgic film aesthetic with warm, faded tones',
    lighting: `**Lighting**: Natural golden hour sunlight
- Soft, warm light with honey-golden tones
- Gentle shadows creating cozy atmosphere
- Window light quality from afternoon sun
- Nostalgic, warm illumination`,
    background: `- Warm cream with subtle vignetting at edges
  * 1970s cookbook aesthetic with nostalgic charm
  * Cozy grandma's kitchen atmosphere`,
    surface: `- Light wood with honey tones and visible grain, OR vintage tablecloth with subtle texture, OR worn butcher block with character`,
    colorPalette: `- Kodak Gold film color palette: warm oranges, muted greens, creamy yellows
- Slightly faded colors like old photographs from the 1970s
- Warm, nostalgic tones throughout`,
    atmosphere: `Vintage 35mm film photography aesthetic - shot on Kodak Gold 200. Nostalgic, warm, homey atmosphere like old cookbooks from the 1970s.`,
    camera: `- Natural film grain texture throughout
- Soft vignetting at edges
- Warm tone curve with characteristic film lens rendering
- Gentle bokeh with analog lens quality`
  },
  'maximalist': {
    id: 'maximalist',
    name: 'Hyper-Maximalist Grandmillennial',
    emoji: '🌺',
    description: 'Bold, ornate "more is more" aesthetic with rich jewel tones',
    lighting: `**Lighting**: Bright, even lighting with decorative flair
- Well-lit scene showing all details and patterns
- Warm ambient light bringing out rich jewel tones
- No dramatic shadows - everything visible and ornate
- Grand, luxurious illumination`,
    background: `- Bold floral wallpaper OR rich jewel-tone damask patterns
  * English tea room meets maximalist Instagram aesthetic
  * Layer decorative elements: add fresh flowers, vintage decorations`,
    surface: `- Mix of ornate vintage plates with gold trim, patterned tablecloth underneath
- Layer decorative elements: lace doilies, vintage silverware, scattered fresh flowers
- More is more - bold patterns and textures`,
    colorPalette: `- Rich jewel tones: emerald green, sapphire blue, ruby red, gold accents everywhere
- Saturated, vibrant colors with ornate patterns
- Eclectic grandmillennial aesthetic with bold choices`,
    atmosphere: `Hyper-maximalist grandmillennial aesthetic - more is more! Ornate, bold, eclectic with layers of patterns and decorative vintage elements. English tea room meets maximalist Instagram.`,
    camera: `- Saturated, vibrant colors
- Everything in sharp focus to show all details
- Rich, bold rendering showing patterns and textures`
  }
};

// AI Providers registry
const AI_PROVIDERS = {
  'gpt-image-1': {
    id: 'gpt-image-1',
    name: 'GPT-Image-1',
    defaultQuality: 'high',
    defaultSize: '1536x1024',
    defaultTimeout: 120000,
    buildRequest({ settings, imageBlob, signal }) {
      const formData = new FormData();
      formData.append('model', settings.model);
      formData.append('prompt', settings.prompt);
      formData.append('n', '1');
      formData.append('input_fidelity', 'high');
      if (settings.quality && settings.quality !== 'auto') {
        formData.append('quality', settings.quality);
      }
      if (settings.size && settings.size !== 'auto') {
        formData.append('size', settings.size);
      }
      formData.append('image', imageBlob, 'image.png');

      return {
        url: 'https://api.openai.com/v1/images/edits',
        options: {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
          },
          body: formData,
          signal,
        }
      };
    },
    async extractResult(response) {
      const data = await response.json();
      const first = data?.data?.[0];
      return first?.b64_json || null;
    }
  },
  'gpt-image-1-mini': {
    id: 'gpt-image-1-mini',
    name: 'GPT-Image-1 Mini',
    defaultQuality: 'high',
    defaultSize: '1536x1024',
    defaultTimeout: 120000,
    buildRequest({ settings, imageBlob, signal }) {
      const formData = new FormData();
      formData.append('model', settings.model);
      formData.append('prompt', settings.prompt);
      formData.append('n', '1');
      if (settings.quality && settings.quality !== 'auto') {
        formData.append('quality', settings.quality);
      }
      if (settings.size && settings.size !== 'auto') {
        formData.append('size', settings.size);
      }
      formData.append('image', imageBlob, 'image.png');

      return {
        url: 'https://api.openai.com/v1/images/edits',
        options: {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiKey}`,
          },
          body: formData,
          signal,
        }
      };
    },
    async extractResult(response) {
      const data = await response.json();
      const first = data?.data?.[0];
      return first?.b64_json || null;
    }
  }
};

// Background service worker: process image edits via provider-agnostic adapter
const ACTIONS = {
  GET_DIETARY_PREFERENCES: 'getDietaryPreferences',
  GET_VISUAL_STYLES: 'getVisualStyles',
  GENERATE_REQUEST_ID: 'generateRequestId',
  PROCESS_IMAGE: 'processImage',
  CANCEL_REQUEST: 'cancelRequest',
  SAVE_GENERATED_IMAGE: 'saveGeneratedImage',
  LOAD_SAVED_IMAGE: 'loadSavedImage',
  CLEANUP_OLD_IMAGES: 'cleanupOldImages',
  MERGE_IMAGES: 'mergeImages',
  GET_PROGRESS: 'getProgress',
};

// Tracks in-flight requests by requestId
const inFlightRequests = new Map(); // requestId -> { controller, timeoutId, progress }

// Fun facts about food to display during processing
const FOOD_FACTS = [
  'Did you know? The average person eats about 35 tons of food in their lifetime! 🍴',
  'Food fact: Honey never spoils. Archaeologists found 3,000 year old honey in Egyptian tombs! 🍯',
  'Chef\'s tip: Let meat rest after cooking for juicier results 🥩',
  'Fun fact: Apples float because they\'re 25% air! 🍎',
  'Did you know? Carrots were originally purple before the 17th century! 🥕',
  'Food science: Tomatoes have more genes than humans! 🍅',
  'Pro tip: Store herbs like flowers in water to keep them fresh 🌿',
  'Amazing fact: Chocolate was once used as currency by the Aztecs! 🍫',
  'Did you know? Pineapples take about 2 years to grow! 🍍',
  'Kitchen hack: Freeze leftover herbs in ice cube trays with olive oil 🧊',
  'Food fact: Avocados are actually berries! 🥑',
  'Did you know? Bananas are berries, but strawberries aren\'t! 🍓',
  'Chef wisdom: Season your food in layers while cooking, not just at the end 🧂',
  'Fun fact: A strawberry isn\'t technically a berry, it\'s an aggregate fruit! 🍓',
  'Food history: Ketchup was sold as medicine in the 1830s! 🍅',
  'Amazing: Potatoes were the first food grown in space! 🥔',
  'Did you know? Cashews grow on the bottom of cashew apples! 🥜',
  'Food fact: Vanilla is the second most expensive spice after saffron! 🍦',
  'Chef secret: Add a pinch of salt to sweet dishes to enhance flavor 🧂',
  'Fun fact: Peanuts aren\'t nuts - they\'re legumes like beans! 🥜',
  'Did you know? Almonds are seeds, not nuts! 🌰',
  'Food science: Raspberries are members of the rose family! 🌹',
  'Amazing: Cucumbers are 96% water - the most of any solid food! 🥒',
  'Kitchen tip: Store tomatoes at room temperature for better flavor 🍅',
  'Fun fact: White chocolate isn\'t technically chocolate (no cocoa solids)! 🍫',
  'Did you know? Mushrooms are more closely related to humans than plants! 🍄',
  'Food history: Ice cream cones were invented by accident at the 1904 World\'s Fair! 🍦',
  'Amazing: Cranberries bounce when they\'re ripe - that\'s how they\'re sorted! 🫐',
  'Chef tip: Room temperature eggs whip up fluffier than cold ones 🥚',
  'Fun fact: Garlic can draw out splinters when applied to the skin! 🧄',
  'Did you know? Peppers have more vitamin C than oranges! 🫑',
  'Food science: Eating spicy food can trigger endorphin release! 🌶️',
  'Kitchen hack: Freeze cookie dough balls for fresh-baked cookies anytime 🍪',
  'Amazing: Pistachios can spontaneously combust when stored in large quantities! 🥜',
  'Fun fact: The fear of cooking is called "mageirocophobia"! 👨‍🍳',
  'Did you know? Worcestershire sauce is basically fermented anchovy juice! 🐟',
  'Chef wisdom: Taste as you cook - it\'s the key to great food! 👅',
  'Food fact: Nutmeg is a hallucinogen in large doses (don\'t try it!)! 🥜',
  'Amazing: A cluster of bananas is called a "hand", single bananas are "fingers"! 🍌',
  'Kitchen tip: Add acid (lemon/vinegar) to brighten and balance flavors 🍋',
  'Fun fact: Octopuses have been observed farming their food! 🐙',
  'Did you know? Coffee beans are actually seeds from a fruit called a cherry! ☕',
  'Food history: Fortune cookies were invented in California, not China! 🥠',
  'Chef secret: Cold butter makes flakier pastry than soft butter! 🧈',
  'Amazing: Honey is the only food that never goes bad naturally! 🍯',
];

// Helper to update progress for a request
function updateProgress(requestId, progress, statusText, detailText = '', extraData = {}) {
  const entry = inFlightRequests.get(requestId);
  if (entry) {
    entry.progress = {
      progress,
      statusText,
      detailText,
      timestamp: Date.now(),
      ...extraData
    };
  }
}

// Get random food fact
function getRandomFoodFact() {
  return FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)];
}

// Entry point: listen for messages from the extension UI/content
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request && request.action === ACTIONS.GET_DIETARY_PREFERENCES) {
    const preferences = Object.keys(DIETARY_PREFERENCES).map(key => ({
      id: DIETARY_PREFERENCES[key].id,
      name: DIETARY_PREFERENCES[key].displayName || DIETARY_PREFERENCES[key].name,
      emoji: DIETARY_PREFERENCES[key].emoji,
      description: DIETARY_PREFERENCES[key].description,
    }));
    sendResponse({ success: true, preferences });
    return true;
  }

  if (request && request.action === ACTIONS.GET_VISUAL_STYLES) {
    const styles = Object.keys(IMAGE_STYLES).map(key => ({
      id: IMAGE_STYLES[key].id,
      name: IMAGE_STYLES[key].displayName || IMAGE_STYLES[key].name,
      emoji: IMAGE_STYLES[key].emoji,
      description: IMAGE_STYLES[key].description,
    }));
    sendResponse({ success: true, styles });
    return true;
  }

  if (request && request.action === ACTIONS.GET_PROGRESS) {
    const requestId = request.requestId;
    const entry = inFlightRequests.get(requestId);
    if (entry && entry.progress) {
      sendResponse({ success: true, ...entry.progress });
    } else {
      sendResponse({ success: false, error: 'No progress found' });
    }
    return true;
  }

  if (request && request.action === ACTIONS.PROCESS_IMAGE) {
    const requestId = request.requestId;
    const controller = new AbortController();
    inFlightRequests.set(requestId, {
      controller,
      timeoutId: null,
      progress: {
        progress: 0,
        statusText: 'Starting...',
        detailText: 'Preparing to analyze menu',
        timestamp: Date.now()
      }
    });

    processImageRequest({ imageUrl: request.imageUrl, requestId, signal: controller.signal })
      .then(result => sendResponse({ ...result, requestId }))
      .catch(error => sendResponse({ success: false, error: error.message, requestId }))
      .finally(() => clearInFlight(requestId));
    return true; // keep the message channel open for async response
  }

  if (request && request.action === ACTIONS.CANCEL_REQUEST) {
    const requestId = request.requestId;
    const entry = requestId ? inFlightRequests.get(requestId) : null;
    if (entry) {
      try { entry.controller.abort(); } catch (_) {}
      clearInFlight(requestId);
      sendResponse({ success: true, canceled: true, requestId });
    } else {
      sendResponse({ success: false, error: 'No in-flight request for given requestId', requestId });
    }
    return true;
  }

  if (request && request.action === ACTIONS.GENERATE_REQUEST_ID) {
    generateRequestIdFromImage(request.imageUrl)
      .then(requestId => sendResponse({ success: true, requestId }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.SAVE_GENERATED_IMAGE) {
    saveGeneratedImageToStorage(request.requestId, request.generatedSrc)
      .then(result => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.LOAD_SAVED_IMAGE) {
    loadSavedImageFromStorage(request.requestId)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.CLEANUP_OLD_IMAGES) {
    cleanupOldSavedImages()
      .then(result => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request && request.action === ACTIONS.MERGE_IMAGES) {
    mergeImages(request.originalImageUrl, request.aiImageData)
      .then(result => sendResponse({ success: true, b64: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Provider selection
function selectAiProviderByModel(model) {
  return AI_PROVIDERS[model] || AI_PROVIDERS[Object.keys(AI_PROVIDERS)[0]];
}

// Menu Parser: Stage 1 - Analyze menu and extract items with AI
async function parseMenuWithAI({ imageUrl, dietaryPreference, requestId }) {
  console.log('🍽️ [MENU PARSER] Starting menu analysis...');
  console.log('📸 [MENU PARSER] Image URL:', imageUrl);
  console.log('🥗 [MENU PARSER] Food Preference:', dietaryPreference);

  try {
    updateProgress(requestId, 5, 'Analyzing menu...', getRandomFoodFact());

    const settings = await loadSettings();
    assertSetting(settings.apiKey, 'API key not configured');

    // Fetch the menu image and convert to base64
    updateProgress(requestId, 10, 'Loading menu image...', 'Fetching high-resolution image');
    console.log('⬇️ [MENU PARSER] Fetching menu image...');
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const imageBase64 = await blobToBase64(imageBlob);
    console.log('✅ [MENU PARSER] Image fetched, size:', Math.round(imageBase64.length / 1024), 'KB');

    // Get dietary preference context
    const preference = DIETARY_PREFERENCES[dietaryPreference] || DIETARY_PREFERENCES['regular'];
    console.log('📋 [MENU PARSER] Dietary preference:', preference.name);

    // Build the menu parsing prompt
    updateProgress(requestId, 15, 'Preparing AI analysis...', `Analyzing for ${preference.name} preferences`);
    const parsingPrompt = buildMenuParsingPrompt(preference);
    console.log('📝 [MENU PARSER] Prompt built, length:', parsingPrompt.length, 'chars');

    // Call GPT-4o (vision model) to parse the menu
    updateProgress(requestId, 20, 'Reading menu with AI...', 'This takes 20-30 seconds. ' + getRandomFoodFact());
    console.log('🤖 [MENU PARSER] Calling OpenAI GPT-4o for menu analysis...');
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
        'Authorization': `Bearer ${settings.apiKey}`,
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

    updateProgress(requestId, 40, 'Processing AI response...', getRandomFoodFact());

    const data = await response.json();
    console.log('📦 [MENU PARSER] Raw API response:', JSON.stringify(data, null, 2));

    const aiResponse = data.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response content from AI');
    }

    console.log('💬 [MENU PARSER] AI Response:\n', aiResponse);

    // Parse the JSON response from AI
    updateProgress(requestId, 45, 'Extracting dishes...', 'Identifying the best menu items');
    let parsedData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      parsedData = JSON.parse(jsonString.trim());
      console.log('✅ [MENU PARSER] Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ [MENU PARSER] Failed to parse JSON:', parseError);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    console.log('🎯 [MENU PARSER] Parsed Data:', JSON.stringify(parsedData, null, 2));
    console.log('🍽️ [MENU PARSER] Selected Items:', parsedData.selectedItems?.length || 0);
    console.log('🎨 [MENU PARSER] Menu Theme:', parsedData.menuTheme);
    console.log('✨ [MENU PARSER] Menu analysis complete!');

    // Show selected dishes to the user
    if (parsedData.selectedItems && parsedData.selectedItems.length > 0) {
      const dishNames = parsedData.selectedItems.map(item => item.name);
      // Show first 3 items, then "and X more" if there are more
      const displayNames = dishNames.length > 3
        ? `${dishNames.slice(0, 3).join(', ')}, and ${dishNames.length - 3} more`
        : dishNames.join(', ');
      updateProgress(requestId, 50, 'Menu analyzed!', `Selected: ${displayNames}`);
    }

    return parsedData;
  } catch (error) {
    console.error('❌ [MENU PARSER] Error:', error);
    throw error;
  }
}

// Get visual style modifiers based on user's selected style
function getVisualStyleModifiers(styleName) {
  return IMAGE_STYLES[styleName] || IMAGE_STYLES['modern'];
}

// Build the dynamic image generation prompt from parsed menu data (Stage 2)
function buildImageGenerationPrompt(parsedMenuData, visualStyle = 'modern', dietaryPreference = 'regular') {
  const { menuTheme, selectedItems } = parsedMenuData;
  const currentYear = new Date().getFullYear();

  console.log('🎨 [PROMPT BUILDER] Building dynamic image generation prompt...');
  console.log('📋 [PROMPT BUILDER] Menu Theme:', menuTheme);
  console.log('🍽️ [PROMPT BUILDER] Selected Items:', selectedItems.length);
  console.log('📅 [PROMPT BUILDER] Current Year:', currentYear);
  console.log('🎭 [PROMPT BUILDER] Visual Style:', visualStyle);
  console.log('🥗 [PROMPT BUILDER] Dietary Preference:', dietaryPreference);

  // Build the dish descriptions with plate assignments
  const dishDescriptions = selectedItems.map((item, index) => {
    const plateType = assignPlateType(item.category);
    return `${index + 1}. **${item.name}** (${item.category})
   - Plate: ${plateType}
   - Visual Notes: ${item.visualAppeal}`;
  }).join('\n\n');

  console.log('🍽️ [PROMPT BUILDER] Dish descriptions created');

  // Get style modifiers based on selected visual style
  const styleModifiers = getVisualStyleModifiers(visualStyle);
  console.log('🎨 [PROMPT BUILDER] Applied visual style modifiers for:', visualStyle);

  const prompt = `You are a specialized AI system that creates photorealistic food scenes with ${currentYear} aesthetic styling.

## MENU THEME
${menuTheme}

## DISHES TO VISUALIZE
${dishDescriptions}

## VISUAL STYLE: ${currentYear} MODERN FOOD PHOTOGRAPHY

**CRITICAL COMPOSITION LAYOUT**:
- **TOP 1/3 of image**: Soft, clean background space (for menu text overlay)
  * This area MUST be kept completely clear and simple
  * Soft gradient background in warm tones: beige-to-cream, OR soft sage green, OR warm off-white
  * Minimal, clean, Instagram-worthy aesthetic
  * ABSOLUTELY NO food elements in this upper third - leave space for text
  * Background fades naturally into the surface below

- **BOTTOM 2/3 of image**: Food presentation area
  * This is where ALL ${selectedItems.length} dishes should be arranged
  * Food occupies the lower two-thirds of the frame only
  * GENEROUS spacing between dishes - avoid crowding
  * Natural surface visible: light marble with subtle veining, OR white concrete, OR natural light wood with visible grain

**Spatial Distribution & Perspective**:
- Imagine looking at a table from above at an angle
- TOP 1/3 = empty background wall/space (for menu text)
- BOTTOM 2/3 = table surface with food dishes spread out
- Strong perspective: dishes further back appear smaller (natural depth)
- Dishes arranged with breathing room - not touching or overlapping too much
- Create sense of depth through perspective: back dishes smaller, front dishes larger

**Lighting**: Soft, diffused natural light
- Single soft light source positioned at 10-2 o'clock angle
- Creates gentle shadows for depth but keeps everything bright and appetizing
- Window-light quality, not harsh or artificial

**Food Arrangement in Bottom 2/3**:
- Arrange ${selectedItems.length} dishes elegantly within the lower two-thirds of the frame
- Use the specified plate for each dish (white or blue plates as noted above)
- IMPORTANT: Space dishes apart generously - each dish should have breathing room
- Slight overlapping is OK, but maintain clear separation between dishes
- Keep the composition balanced and visually pleasing with clear negative space
- View angle from above at an angle (looking down at 50-60 degrees)

**Perspective & Depth**:
- Apply natural perspective: dishes in the back row appear smaller/higher in frame
- Dishes in the front row appear larger/lower in frame
- This creates realistic table-top photography depth
- Avoid flat, 2D arrangement - use full 3D depth of the scene
- Camera positioned as if photographer is standing and looking down at the table

**Camera & Quality**:
- Elevated camera angle (50-60 degrees from horizontal) looking down at table
- Strong perspective showing depth from back to front
- Sharp focus on the food with beautiful bokeh in background
- Restaurant-quality, magazine-worthy presentation
- Make the food look absolutely delicious and irresistible

## PLATE SPECIFICATIONS
**Available Plate Types**:
- **Large Flat White Plate** (12-inch diameter): For flat presentations, grilled items, salads, sandwiches, steaks, fish
- **Large Deep Blue Plate** (12-inch diameter, 2-inch depth): For pasta, stews, curries, rice bowls, saucy dishes
- **Medium Deep Blue Plate** (9-inch diameter, 4-inch depth): For soups, individual portions, appetizers, sides

## FOOD STYLING REQUIREMENTS
- Each dish should look restaurant-quality and professionally plated
- Colors should be vibrant and natural, making food look fresh and appetizing
- Appropriate garnishes and plating techniques for each dish type
- Proper portion sizes that look generous but not overwhelming
- Steam or freshness indicators where appropriate (e.g., soup should look hot)

## PHOTOREALISM REQUIREMENTS - CRITICAL
**Make food look REAL, not CGI or artificial. Apply these techniques:**

1. **Surface Textures** (VERY IMPORTANT):
   - Show realistic food textures: crispy skin on chicken, flaky fish, visible grain in bread
   - Include natural imperfections: slight charring, uneven browning, organic shapes
   - Avoid overly smooth or perfect surfaces that look computer-generated

2. **Natural Lighting Effects**:
   - Add subtle highlights and reflections on moist/oily surfaces (sauces, glazes)
   - Show gentle shadows within dishes (between layers, under garnishes)
   - Avoid flat, even lighting that looks artificial

3. **Organic Presentation**:
   - Food should look like it was ACTUALLY PLATED by a real chef
   - Garnishes placed naturally, not perfectly symmetrical
   - Sauce drizzles and dollops should have organic, imperfect patterns
   - Herbs and toppings scattered naturally, not arranged in perfect patterns

4. **Real-World Details**:
   - Show subtle steam rising from hot dishes (soup, waffles)
   - Include small imperfections: herb fragments, sauce splatter on rim, crumbs
   - Visible moisture/sheen on fresh ingredients (avocado, vegetables)
   - Natural color variations within ingredients (not uniform colors)

5. **Photography Style**:
   - Capture food as it would look in real life, not idealized CGI
   - Slight depth of field blur in background (natural lens behavior)
   - Realistic color grading - avoid oversaturation
   - Natural shadows and highlights from actual lighting conditions

## CRITICAL REQUIREMENTS
- EXACTLY ${selectedItems.length} dishes MUST be visible - NO MORE, NO LESS
- Each dish listed above should appear EXACTLY ONCE in the image (no duplicates)
- DO NOT create multiple versions of the same dish
- Use the exact plate types specified for each dish
- Maintain the warm, modern aesthetic throughout
- Keep the scene clean and uncluttered
- Make the food the star - background supports but doesn't compete
- Final image should make viewers hungry and excited to eat

## ANTI-DUPLICATION CHECK
Before generating, verify:
1. Are there exactly ${selectedItems.length} distinct dishes in the scene?
2. Does each dish match one from the list above?
3. Are there any duplicate dishes? (If yes, remove duplicates)

## COMPOSITION VERIFICATION
Before finalizing the image, verify this critical layout:
1. **Top 1/3 check**: Is the upper third of the image clear background space (no food)?
2. **Bottom 2/3 check**: Are ALL dishes positioned in the lower two-thirds only?
3. **Text space**: Is there sufficient empty space at the top for menu text overlay?
4. **Spacing**: Is there clear space between dishes (not overcrowded)?
5. **Perspective**: Do back dishes appear smaller/higher and front dishes larger/lower?
6. **Depth**: Does the scene show natural 3D table-top perspective?

## OUTPUT DELIVERABLE
A single, high-resolution PHOTOREALISTIC image (not CGI or 3D render) with the following layout:
- **Top 1/3**: Clean, soft gradient background (space for menu text)
- **Bottom 2/3**: All ${selectedItems.length} dishes in modern, appetizing presentation with generous spacing and natural perspective depth

The image should look like a professional food photograph taken with a real camera, showing real food that actually exists.`;

  console.log('✅ [PROMPT BUILDER] Dynamic prompt built, length:', prompt.length, 'chars');
  console.log('📝 [PROMPT BUILDER] Full prompt:\n', prompt);

  return prompt;
}

// Assign the appropriate plate type based on dish category
function assignPlateType(category) {
  const plateRules = {
    'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
    'salad': 'Large Flat White Plate (12-inch)',
    'main': 'Large Flat White Plate (12-inch)',
    'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth)',
    'sandwich': 'Large Flat White Plate (12-inch)',
    'pizza': 'Large Flat White Plate (12-inch)',
    'dessert': 'Large Flat White Plate (12-inch)',
    'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
  };

  return plateRules[category] || 'Large Flat White Plate (12-inch)';
}

// Build the prompt for menu parsing (Stage 1)
function buildMenuParsingPrompt(preference) {
  return `You are an expert food menu analyzer. Your task is to analyze this menu image and extract the most interesting dishes for visualization.

## TASK
Analyze the menu and return a JSON object with the following structure:

\`\`\`json
{
  "menuTheme": "Description of overall menu style/cuisine (e.g., 'Mediterranean Day', 'Asian Fusion', 'Classic American')",
  "allItems": [
    {
      "name": "Dish name (cleaned, without abbreviations)",
      "category": "soup | salad | main | pasta | sandwich | pizza | dessert | side",
      "description": "Brief description if available"
    }
  ],
  "selectedItems": [
    {
      "name": "Selected dish name",
      "category": "category",
      "description": "Why this dish was selected",
      "visualAppeal": "What makes this dish visually interesting"
    }
  ]
}
\`\`\`

## RULES FOR EXTRACTION
1. **Remove Abbreviations**: Clean up dietary markers like (V), (D), (GF), (VG), etc. from dish names
2. **Categorize Items**: Assign each dish to a category (soup, salad, main, pasta, sandwich, pizza, dessert, side)
3. **Extract All Items**: List ALL dishes you can identify from the menu in "allItems"

## RULES FOR SELECTION (EXACTLY 5 dishes - NO MORE, NO LESS)
1. **MANDATORY COUNT**: You MUST select EXACTLY 5 dishes. Not 3, not 4, not 6. Always 5 dishes.

2. **STRICT DIVERSITY RULE**: You MUST select dishes from DIFFERENT categories ONLY
   - Each selected dish MUST have a UNIQUE category
   - MAXIMUM ONE dish per category
   - ✅ GOOD EXAMPLES:
     * 1 soup + 1 salad + 1 main + 1 pasta + 1 dessert (5 different categories) ✓
     * 1 pizza + 1 main + 1 side + 1 soup + 1 sandwich (5 different categories) ✓
   - ❌ BAD EXAMPLES (DO NOT DO THIS):
     * Only 3 dishes selected (WRONG - need 5)
     * 2 soups (duplicate category)
     * 2 salads (duplicate category)
     * 2 mains (duplicate category)
     * 2 pizzas (duplicate category)
   - **CRITICAL**: Before finalizing your selection, count:
     1. Total dishes = exactly 5? If not, add more dishes from different categories
     2. Each category appears only once? If not, remove duplicates and pick from different categories

3. **Visual Appeal**: Prioritize colorful, photogenic dishes

4. **Dietary Preference**: ${preference.modifier ? 'Apply this dietary filter: ' + preference.modifier : 'No dietary restrictions'}

5. **Balance**: Mix textures and colors (creamy + crunchy, green + red/orange, etc.)

6. **Interesting Items**: Choose dishes that sound unique or restaurant-quality

## OUTPUT
Return ONLY valid JSON, no additional text. Make sure the JSON is properly formatted and can be parsed.`;
}


// Settings and validation helpers
async function loadSettings() {
  const stored = await chrome.storage.local.get(['model', 'apiKey']);
  const modelId = stored.model || Object.keys(AI_PROVIDERS)[0];
  const provider = AI_PROVIDERS[modelId];

  return {
    model: modelId,
    apiKey: stored.apiKey,
    quality: provider?.defaultQuality,
    size: provider?.defaultSize,
    timeoutMs: provider?.defaultTimeout,
  };
}

// Validate settings value
function assertSetting(value, message) {
  if (value === undefined || value === null || value === '') throw new Error(message);
}

// Clear in-flight requests
function clearInFlight(requestId) {
  const entry = inFlightRequests.get(requestId);
  if (entry) {
    clearTimeout(entry.timeoutId)
    inFlightRequests.delete(requestId);
  }
}

// Main request pipeline: fetch image, build mask, call provider, return base64
async function processImageRequest({ imageUrl, requestId, signal }) {
  try {
    const settings = await loadSettings();

    assertSetting(settings.model, 'Model not configured');
    assertSetting(settings.apiKey, 'API key not configured');

    console.log('🚀 [IMAGE GENERATION] Starting two-stage pipeline...');
    console.log('📸 [IMAGE GENERATION] Image URL:', imageUrl);

    // STAGE 1: Parse the menu with AI to get intelligent dish selection
    updateProgress(requestId, 5, 'Starting menu analysis...', getRandomFoodFact());
    console.log('⚡ [IMAGE GENERATION] Stage 1: Parsing menu with AI...');
    const stored = await chrome.storage.local.get(['dietaryPreference', 'visualStyle']);
    const dietaryPreference = stored.dietaryPreference || 'regular';
    const visualStyle = stored.visualStyle || 'modern';

    let parsedMenuData;
    let dynamicPrompt;

    try {
      parsedMenuData = await parseMenuWithAI({ imageUrl, dietaryPreference, requestId });
      console.log('✅ [IMAGE GENERATION] Stage 1 complete - Menu parsed successfully');
      console.log('🎯 [IMAGE GENERATION] Selected items:', parsedMenuData.selectedItems?.length || 0);
      console.log('🎨 [IMAGE GENERATION] Menu theme:', parsedMenuData.menuTheme);

      // Validate that we have exactly 5 items
      if (parsedMenuData.selectedItems?.length !== 5) {
        console.warn('⚠️ [IMAGE GENERATION] AI returned', parsedMenuData.selectedItems?.length, 'items instead of 5, falling back to static prompt');
        throw new Error('AI did not return exactly 5 items');
      }

      // STAGE 2: Build dynamic prompt from parsed data
      updateProgress(requestId, 52, 'Building visualization prompt...', 'Creating detailed food photography instructions');
      console.log('⚡ [IMAGE GENERATION] Stage 2: Building dynamic prompt...');
      dynamicPrompt = buildImageGenerationPrompt(parsedMenuData, visualStyle, dietaryPreference);
      console.log('✅ [IMAGE GENERATION] Stage 2 complete - Prompt generated');
    } catch (parseError) {
      console.error('❌ [IMAGE GENERATION] Menu parsing failed:', parseError.message);
      throw new Error(`Failed to parse menu: ${parseError.message}`);
    }

    // Use the dynamically generated prompt instead of static one
    const finalPrompt = dynamicPrompt;

    console.log('📝 [IMAGE GENERATION] Using prompt (first 200 chars):', finalPrompt.substring(0, 200) + '...');

    // Enforce timeout via AbortController (only if a positive timeout is set)
    const entry = inFlightRequests.get(requestId);
    if (entry && !entry.timeoutId && typeof settings.timeoutMs === 'number' && settings.timeoutMs > 0) {
      entry.timeoutId = setTimeout(() => {
        try { entry.controller.abort(); } catch (_) {}
      }, settings.timeoutMs);
    }

    updateProgress(requestId, 55, 'Preparing for image generation...', getRandomFoodFact());
    console.log('⬇️ [IMAGE GENERATION] Fetching image for processing...');
    const imageBlob = await fetchImageAsBlob(imageUrl, signal);
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Fetched image is empty');
    }
    console.log('✅ [IMAGE GENERATION] Image fetched, size:', Math.round(imageBlob.size / 1024), 'KB');

    throwIfAborted(signal);

    updateProgress(requestId, 60, 'Generating food visualization...', 'This takes 60-90 seconds. ' + getRandomFoodFact());
    console.log('🤖 [IMAGE GENERATION] Calling image generation API...');
    const aiProvider = selectAiProviderByModel(settings.model);

    // Override the prompt in settings with our dynamic one
    const settingsWithDynamicPrompt = { ...settings, prompt: finalPrompt };
    const request = aiProvider.buildRequest({ settings: settingsWithDynamicPrompt, imageBlob, signal });

    const response = await fetch(request.url, request.options);
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (_) {}
      throw new Error(`${aiProvider.name} API error: ${errorMessage}`);
    }

    updateProgress(requestId, 85, 'Finalizing image...', 'Processing AI-generated visualization');

    const b64 = await aiProvider.extractResult(response);
    if (!b64) {
      throw new Error(`${aiProvider.name} returned no image data`);
    }

    updateProgress(requestId, 88, 'Image generated!', 'Preparing to merge with menu text');
    console.log('✅ [IMAGE GENERATION] Image generated successfully!');
    console.log('🎉 [IMAGE GENERATION] Two-stage pipeline complete!');

    return { success: true, b64 };
  } catch (error) {
    if (error && (error.name === 'AbortError' || /aborted|abort/i.test(error.message))) {
      console.log('🛑 [IMAGE GENERATION] Request canceled');
      return { success: false, canceled: true, error: 'Request canceled' };
    }
    console.error('❌ [IMAGE GENERATION] Error processing image:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

// Throw if the request is aborted
function throwIfAborted(signal) {
  if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

// Network/image helpers
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

// Misc utilities
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

// Storage functions for generated images
async function saveGeneratedImageToStorage(requestId, generatedSrc) {
  try {
    // Clean up old images first to free up space
    await cleanupOldSavedImages();

    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};

    // Check storage quota before saving
    const storageSize = JSON.stringify(savedImages).length;
    const newImageSize = generatedSrc.length;
    const maxStorageSize = 5 * 1024 * 1024; // 5MB limit for safety

    if (storageSize + newImageSize > maxStorageSize) {
      // Remove oldest images until we have enough space
      const entries = Object.entries(savedImages);
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by oldest first

      while (entries.length > 0 && JSON.stringify(savedImages).length + newImageSize > maxStorageSize) {
        const [oldestId] = entries.shift();
        delete savedImages[oldestId];
        console.log(`Removed old cached image: ${oldestId}`);
      }
    }

    savedImages[requestId] = {
      generatedSrc,
      timestamp: Date.now()
    };

    await chrome.storage.local.set({ verkadalizer_saved_images: savedImages });
  } catch (error) {
    console.warn('Failed to save generated image:', error);
    // Don't throw - just log the warning so processing continues
  }
}

async function loadSavedImageFromStorage(requestId) {
  try {
    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};
    return savedImages[requestId] || null;
  } catch (error) {
    console.warn('Failed to load saved image:', error);
    throw error;
  }
}

async function cleanupOldSavedImages() {
  try {
    const result = await chrome.storage.local.get(['verkadalizer_saved_images']);
    const savedImages = result.verkadalizer_saved_images || {};
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000); // Reduced from 7 days to 3 days
    let cleaned = false;

    for (const [requestId, data] of Object.entries(savedImages)) {
      if (data.timestamp < threeDaysAgo) {
        delete savedImages[requestId];
        cleaned = true;
      }
    }

    // Also limit total stored images to 10 most recent
    const entries = Object.entries(savedImages);
    if (entries.length > 10) {
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp); // Sort by newest first
      const toKeep = entries.slice(0, 10); // Keep only 10 most recent
      const newSavedImages = {};

      for (const [requestId, data] of toKeep) {
        newSavedImages[requestId] = data;
      }

      await chrome.storage.local.set({ verkadalizer_saved_images: newSavedImages });
      cleaned = true;
    } else if (cleaned) {
      await chrome.storage.local.set({ verkadalizer_saved_images: savedImages });
    }
  } catch (error) {
    console.warn('Failed to cleanup old saved images:', error);
    // Don't throw - just log the warning
  }
}

async function generateRequestIdFromImage(imageUrl) {
  const imageBlob = await fetchImageAsBlob(imageUrl);
  const bitmap = await createImageBitmap(imageBlob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Load food preference setting
  const stored = await chrome.storage.local.get(['dietaryPreference']);
  const preferenceId = stored.dietaryPreference || 'regular';

  // Simple hash calculation from image data
  let hash = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    hash = ((hash << 5) - hash + imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) & 0xffffffff;
  }

  // Include food preference in the request ID
  const requestId = `img_${Math.abs(hash).toString(36)}_${preferenceId}`;
  return requestId;
}

// Remove vertical lines from image data
function removeVerticalLines(imageData, minHeight = 50, maxWidth = 8, whiteThreshold = 190) {
  const { data, width, height } = imageData;
  const newData = new Uint8ClampedArray(data);

  // Scan for vertical divider lines
  for (let x = 0; x < width; x++) {
    // Check if this column starts a vertical line
    let lineWidth = 0;
    let lineHeight = 0;

    // Measure width of potential line starting at x
    for (let checkX = x; checkX < Math.min(width, x + maxWidth); checkX++) {
      let columnWhitePixels = 0;

      // Count white pixels in this column
      for (let y = 0; y < height; y++) {
        const idx = (y * width + checkX) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
          columnWhitePixels++;
        }
      }

      // If column is mostly white, it's part of the line
      if (columnWhitePixels >= minHeight) {
        lineWidth++;
        lineHeight = Math.max(lineHeight, columnWhitePixels);
      } else {
        break; // Line ended
      }
    }

    // If we found a qualifying vertical line, remove it
    if (lineWidth <= maxWidth && lineHeight >= minHeight) {
      for (let removeX = x; removeX < x + lineWidth; removeX++) {
        for (let y = 0; y < height; y++) {
          const idx = (y * width + removeX) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Keep divider pixels as solid white
          if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
            newData[idx] = 255;     // R
            newData[idx + 1] = 255; // G
            newData[idx + 2] = 255; // B
            newData[idx + 3] = 255; // A (fully opaque white)
          }
        }
      }

      // Skip ahead past this line
      x += lineWidth - 1;
    }
  }

  return new ImageData(newData, width, height);
}

// Smart white background removal with smooth text borders and shadow effects
function removeWhiteBackgroundSmart(imageData, textPreservationRadius = 2, whiteThreshold = 255, shadowOffset = 0, shadowBlur = 4) {
  const { data, width, height } = imageData;
  const newData = new Uint8ClampedArray(data);

  // First pass: identify text/logo areas and create distance maps
  const isText = new Array(width * height).fill(false);
  const distanceToText = new Array(width * height).fill(Infinity);

  // Identify text pixels (non-white pixels)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixelIdx = y * width + x;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (r < whiteThreshold || g < whiteThreshold || b < whiteThreshold) {
        isText[pixelIdx] = true;
        distanceToText[pixelIdx] = 0;
      }
    }
  }

  // Calculate distance field using approximated distance transform
  const maxRadius = Math.max(textPreservationRadius, shadowOffset + shadowBlur);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIdx = y * width + x;
      if (!isText[pixelIdx]) {
        let minDistance = Infinity;

        // Check surrounding area for text pixels
        for (let dy = -maxRadius; dy <= maxRadius; dy++) {
          for (let dx = -maxRadius; dx <= maxRadius; dx++) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const nearPixelIdx = ny * width + nx;
              if (isText[nearPixelIdx]) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                minDistance = Math.min(minDistance, distance);
              }
            }
          }
        }
        distanceToText[pixelIdx] = minDistance;
      }
    }
  }

  // Second pass: apply smooth borders and shadows
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixelIdx = y * width + x;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const distance = distanceToText[pixelIdx];

      // Handle text pixels (darken and enhance)
      if (isText[pixelIdx]) {
        // Darken text by reducing RGB values (0.7 = 30% darker)
        const darkenFactor = 0.95;
        newData[idx] = Math.round(r * darkenFactor);
        newData[idx + 1] = Math.round(g * darkenFactor);
        newData[idx + 2] = Math.round(b * darkenFactor);
        newData[idx + 3] = 255;
        continue;
      }

      // Handle white pixels near text with smooth borders
      if (r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) {
        if (distance <= textPreservationRadius) {
          // Smooth border area - create anti-aliased edge
          const borderFactor = distance / textPreservationRadius;
          const smoothFactor = Math.max(0, 1 - borderFactor);

          // Create white border with smooth alpha transition
          newData[idx] = 255;
          newData[idx + 1] = 255;
          newData[idx + 2] = 255;
          newData[idx + 3] = Math.round(255 * Math.pow(smoothFactor, 0.9)); // Smooth falloff
        } else if (distance <= shadowOffset + shadowBlur) {
          // Shadow area
          const shadowDistance = distance - textPreservationRadius;
          const shadowFactor = Math.max(0, 1 - (shadowDistance - shadowOffset) / shadowBlur);

          if (shadowFactor > 0) {
            // Create soft shadow effect
            const shadowAlpha = Math.round(80 * shadowFactor * shadowFactor); // Quadratic falloff for softer shadow
            newData[idx] = 140;     // Dark shadow color
            newData[idx + 1] = 140;
            newData[idx + 2] = 140;
            newData[idx + 3] = shadowAlpha;
          } else {
            // Fully transparent
            newData[idx + 3] = 0;
          }
        } else {
          // Far from text - fully transparent
          newData[idx + 3] = 0;
        }
      } else {
        // Non-white pixels - keep original with possible enhancement
        newData[idx] = r;
        newData[idx + 1] = g;
        newData[idx + 2] = b;
        newData[idx + 3] = data[idx + 3];
      }
    }
  }

  return new ImageData(newData, width, height);
}

// Remove dividers from original image
async function removeDividersFromImage(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(bitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processedImageData = removeVerticalLines(imageData);
  ctx.putImageData(processedImageData, 0, 0);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

// Upscale image for better quality processing
async function upscaleImage(bitmap, scaleFactor = 2) {
  const canvas = new OffscreenCanvas(bitmap.width * scaleFactor, bitmap.height * scaleFactor);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

// Downscale image back to target dimensions
async function downscaleImage(bitmap, targetWidth, targetHeight) {
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

// Make white background transparent while preserving text
async function makeBackgroundTransparent(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const processedImageData = removeWhiteBackgroundSmart(imageData, 6, 255, 0, 2);
  ctx.putImageData(processedImageData, 0, 0);

  const blob = await canvas.convertToBlob();
  return await createImageBitmap(blob);
}

// Resize AI generated image to match original dimensions
async function resizeAiImage(generatedBitmap, targetWidth, targetHeight) {
  const originalAspectRatio = targetWidth / targetHeight;
  const generatedAspectRatio = generatedBitmap.width / generatedBitmap.height;

  let processedBitmap = generatedBitmap;

  if (Math.abs(originalAspectRatio - generatedAspectRatio) > 0.01) {
    const tempCanvas = new OffscreenCanvas(generatedBitmap.width, generatedBitmap.height);
    const tempCtx = tempCanvas.getContext('2d');

    let cropWidth = generatedBitmap.width;
    let cropHeight = generatedBitmap.height;
    let cropX = 0;
    let cropY = 0;

    if (generatedAspectRatio > originalAspectRatio) {
      cropWidth = Math.floor(generatedBitmap.height * originalAspectRatio);
      cropX = Math.floor((generatedBitmap.width - cropWidth) / 2);
    } else {
      cropHeight = Math.floor(generatedBitmap.width / originalAspectRatio);
      const totalCrop = generatedBitmap.height - cropHeight;
      cropY = Math.floor(totalCrop * 0.75);
    }

    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    tempCtx.drawImage(generatedBitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const croppedBlob = await tempCanvas.convertToBlob();
    processedBitmap = await createImageBitmap(croppedBlob);
  }

  return processedBitmap;
}

// Merge original and AI images
async function mergeImages(originalImageUrl, aiImageData) {
  try {
    // Load original image
    const originalBlob = await fetchImageAsBlob(originalImageUrl);
    const originalBitmap = await createImageBitmap(originalBlob);

    // Load generated image from base64 data
    const generatedBlob = await fetch(aiImageData).then(r => r.blob());
    const generatedBitmap = await createImageBitmap(generatedBlob);

    // Store original dimensions for final output
    const originalWidth = originalBitmap.width;
    const originalHeight = originalBitmap.height;

    // Step 1: Upscale original image 2x for better quality processing
    const upscaledOriginal = await upscaleImage(originalBitmap, 2);

    // Step 2: Remove dividers from upscaled image
    // const originalWithoutDividers = await removeDividersFromImage(upscaledOriginal);
    const originalWithoutDividers = upscaledOriginal;

    // Step 3: Make white background transparent (with darkened text)
    const originalWithTransparentBg = await makeBackgroundTransparent(originalWithoutDividers);

    // Step 4: Resize AI generated image to match upscaled dimensions
    const resizedAiImage = await resizeAiImage(generatedBitmap, upscaledOriginal.width, upscaledOriginal.height);

    // Step 5: Merge the images at upscaled resolution
    const mergeCanvas = new OffscreenCanvas(upscaledOriginal.width, upscaledOriginal.height);
    const mergeCtx = mergeCanvas.getContext('2d');

    mergeCtx.imageSmoothingEnabled = true;
    mergeCtx.imageSmoothingQuality = 'high';

    // Draw AI background image first
    mergeCtx.drawImage(resizedAiImage, 0, 0, mergeCanvas.width, mergeCanvas.height);

    // Overlay the original image with transparent background
    mergeCtx.drawImage(originalWithTransparentBg, 0, 0);

    // Step 6: Convert merged result to bitmap and downscale to original dimensions
    const mergedBlob = await mergeCanvas.convertToBlob({ type: 'image/png' });
    const mergedBitmap = await createImageBitmap(mergedBlob);
    const finalBitmap = await downscaleImage(mergedBitmap, originalWidth, originalHeight);

    // Step 7: Convert final result to data URL
    const finalCanvas = new OffscreenCanvas(originalWidth, originalHeight);
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.drawImage(finalBitmap, 0, 0);
    const blob = await finalCanvas.convertToBlob({ type: 'image/png' });
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Error merging images in background:', error);
    throw new Error(`Failed to merge images: ${error.message}`);
  }
}