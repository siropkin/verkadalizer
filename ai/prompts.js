// ============================================================================
// PROMPTS - AI Prompt Generation and Configuration
// ============================================================================

// Dietary preference configurations with prompt modifiers
export const DIETARY_PREFERENCES = {
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

// Unified image style configurations combining plates and visual aesthetics
export const IMAGE_STYLES = {
  'verkada-classic': {
    id: 'verkada-classic',
    name: 'Verkada Classic',
    displayName: 'Verkada Classic (Default)',
    emoji: '🍽️',
    description: 'Blue and white Verkada plates with modern clean photography',

    // Plate configuration
    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
      'salad': 'Large Flat White Plate (12-inch)',
      'main': 'Large Flat White Plate (12-inch)',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth)',
      'sandwich': 'Large Flat White Plate (12-inch)',
      'pizza': 'Large Flat White Plate (12-inch)',
      'dessert': 'Large Flat White Plate (12-inch)',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
    },
    materialDescription: 'Classic ceramic plates in clean blue and white finishes',

    // Visual style modifiers
    lighting: `**Lighting**: Soft, diffused natural light
- Single soft light source positioned at 10-2 o'clock angle
- Creates gentle shadows for depth but keeps everything bright and appetizing
- Window-light quality, not harsh or artificial`,
    background: `- Soft gradient background in warm tones: beige-to-cream, OR soft sage green, OR warm off-white
  * Minimal, clean, Instagram-worthy aesthetic
  * Background fades naturally into the surface below`,
    surface: `- Natural surface visible: light marble with subtle veining and natural variations, OR white concrete with organic texture, OR natural light wood with visible grain and character`,
    colorPalette: `- Colors should be vibrant and natural, making food look fresh and appetizing`,
    atmosphere: `Modern, clean, contemporary food photography aesthetic.`,
    camera: `- Sharp focus on the food with beautiful bokeh in background
- Subtle natural lens vignetting at edges
- Natural color grading with realistic tone curve
- Gentle bokeh with professional lens quality
- Restaurant-quality, magazine-worthy presentation`
  },

  'verkada-cyberpunk': {
    id: 'verkada-cyberpunk',
    name: 'Verkada Cyberpunk',
    emoji: '⚡',
    description: 'Verkada blue & white plates with futuristic neon lighting',

    // Verkada plates
    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
      'salad': 'Large Flat White Plate (12-inch)',
      'main': 'Large Flat White Plate (12-inch)',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth)',
      'sandwich': 'Large Flat White Plate (12-inch)',
      'pizza': 'Large Flat White Plate (12-inch)',
      'dessert': 'Large Flat White Plate (12-inch)',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
    },
    materialDescription: 'Classic ceramic plates in clean blue and white finishes',

    // Cyberpunk visual style
    lighting: `**Lighting**: Futuristic multi-colored LED lighting
- Dramatic neon lights in electric cyan, hot magenta, and deep purple
- Colored backlighting creating bold rim lights on food
- High contrast with glowing neon accents
- Sci-fi atmosphere with dramatic colored shadows`,
    background: `- Dark background (near black) with glowing neon strips or holographic elements
  * Blade Runner meets molecular gastronomy aesthetic
  * Add subtle digital/holographic UI elements or neon signs`,
    surface: `- Glossy black acrylic surface with visible neon reflections and subtle imperfections, OR metallic chrome surface with colored light streaks and realistic reflections, OR dark glass with textured cyberpunk neon glow`,
    colorPalette: `- Electric, vivid colors: neon cyan, hot magenta, acid green, electric purple
- Deep blacks contrasting with vibrant neons
- Futuristic, high-tech color palette`,
    atmosphere: `Cyberpunk neon aesthetic - futuristic restaurant from 2077. High-tech molecular gastronomy meets dramatic neon lighting and sci-fi vibes.`,
    camera: `- High contrast with chromatic aberration on edges
- Dramatic lens flares from neon lights with realistic bloom
- Sharp focus with natural depth of field
- Slight digital grain for cinematic quality
- Professional sci-fi cinematography rendering`
  },

  'verkada-grandmillennial': {
    id: 'verkada-grandmillennial',
    name: 'Verkada Grandmillennial',
    emoji: '🌺',
    description: 'Verkada plates with bold maximalist styling and rich patterns',

    // Verkada plates
    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
      'salad': 'Large Flat White Plate (12-inch)',
      'main': 'Large Flat White Plate (12-inch)',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth)',
      'sandwich': 'Large Flat White Plate (12-inch)',
      'pizza': 'Large Flat White Plate (12-inch)',
      'dessert': 'Large Flat White Plate (12-inch)',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth)',
    },
    materialDescription: 'Classic ceramic plates in clean blue and white finishes',

    // Maximalist visual style
    lighting: `**Lighting**: Bright, even lighting with decorative flair
- Well-lit scene showing all details and patterns
- Warm ambient light bringing out rich jewel tones
- No dramatic shadows - everything visible and ornate
- Grand, luxurious illumination`,
    background: `- Bold floral wallpaper OR rich jewel-tone damask patterns
  * English tea room meets maximalist Instagram aesthetic
  * Layer decorative elements: add fresh flowers, vintage decorations`,
    surface: `- Ornate vintage plates with gold trim and visible wear, layered over patterned tablecloth with tactile fabric texture
- Decorative elements with character: antique lace doilies with detailed weave, vintage silverware with patina, scattered fresh flowers
- More is more - bold patterns and rich textures with depth`,
    colorPalette: `- Rich jewel tones: emerald green, sapphire blue, ruby red, gold accents everywhere
- Saturated, vibrant colors with ornate patterns
- Eclectic grandmillennial aesthetic with bold choices`,
    atmosphere: `Hyper-maximalist grandmillennial aesthetic - more is more! Ornate, bold, eclectic with layers of patterns and decorative vintage elements. English tea room meets maximalist Instagram.`,
    camera: `- Saturated, vibrant colors with natural richness
- Everything in sharp focus with professional lens clarity to show all details
- Subtle lens vignetting to draw eye to center
- Natural color grading preserving ornate textures
- Rich, bold rendering showing patterns and textures with depth`
  },

  'neon-tokyo': {
    id: 'neon-tokyo',
    name: 'Neon Tokyo Night Market',
    emoji: '🌃',
    description: 'Traditional Asian ceramics under futuristic neon lights',

    // Asian plates
    plates: {
      'soup': 'Medium Deep Blue-White Porcelain Bowl (9-inch, 4-inch depth, hand-painted floral patterns)',
      'salad': 'Large Flat White Porcelain Plate with Blue Rim (12-inch, delicate painted border)',
      'main': 'Large Flat Cream Porcelain Plate (12-inch, subtle bamboo pattern)',
      'pasta': 'Large Deep Ramen Bowl (12-inch, 3-inch depth, white with blue waves pattern)',
      'sandwich': 'Rectangular Sushi Plate (14x6-inch, white with geometric patterns)',
      'pizza': 'Large Round Platter (13-inch, cream with painted cherry blossoms)',
      'dessert': 'Small Square Plate (7x7-inch, white porcelain with red accents)',
      'side': 'Small Rice Bowl (6-inch, 3-inch depth, white with blue geometric pattern)',
    },
    materialDescription: 'Traditional Asian-inspired porcelain with hand-painted details: blue and white patterns, floral motifs, bamboo, waves, cherry blossoms, and geometric designs. Mix of round, rectangular, and square shapes.',

    // Cyberpunk visual style
    lighting: `**Lighting**: Futuristic multi-colored LED lighting
- Dramatic neon lights in electric cyan, hot magenta, and deep purple
- Colored backlighting creating bold rim lights on food
- High contrast with glowing neon accents
- Sci-fi atmosphere with dramatic colored shadows`,
    background: `- Dark background (near black) with glowing neon strips or holographic elements
  * Blade Runner meets molecular gastronomy aesthetic
  * Add subtle digital/holographic UI elements or neon signs`,
    surface: `- Glossy black acrylic surface with visible neon reflections and wet texture, OR metallic chrome surface with realistic colored light streaks and weathered imperfections, OR dark glass with textured depth and cyberpunk neon glow`,
    colorPalette: `- Electric, vivid colors: neon cyan, hot magenta, acid green, electric purple
- Deep blacks contrasting with vibrant neons
- Futuristic, high-tech color palette`,
    atmosphere: `Cyberpunk neon aesthetic - futuristic restaurant from 2077. High-tech molecular gastronomy meets dramatic neon lighting and sci-fi vibes.`,
    camera: `- High contrast with chromatic aberration on edges
- Dramatic lens flares from neon lights with realistic bloom
- Sharp focus with natural depth of field
- Slight digital grain for cinematic night photography
- Professional sci-fi cinematography with realistic lens characteristics`
  },

  'grandmas-garden': {
    id: 'grandmas-garden',
    name: "Grandma's Maximalist Garden Tea Party",
    emoji: '🌺',
    description: 'Colorful whimsical plates with bold maximalist patterns',

    // Colorful plates
    plates: {
      'soup': 'Medium Deep Turquoise Bowl (9-inch, 4-inch depth, glossy ceramic)',
      'salad': 'Large Flat Coral Pink Plate (12-inch, glossy ceramic)',
      'main': 'Large Flat Sunny Yellow Plate (12-inch, glossy ceramic)',
      'pasta': 'Large Deep Mint Green Bowl (12-inch, 2-inch depth, glossy ceramic)',
      'sandwich': 'Large Flat Sky Blue Plate (12-inch, glossy ceramic)',
      'pizza': 'Large Flat Lavender Plate (13-inch, glossy ceramic)',
      'dessert': 'Small Flat Peach Plate (8-inch, glossy ceramic)',
      'side': 'Small Deep Seafoam Bowl (7-inch, 3-inch depth)',
    },
    materialDescription: 'Vibrant, cheerful ceramic plates in mixed pastel and bright colors: turquoise, coral pink, sunny yellow, mint green, sky blue, lavender, peach, and seafoam. Each dish should be on a different colored plate for a playful, eclectic cafe vibe.',

    // Maximalist visual style
    lighting: `**Lighting**: Bright, even lighting with decorative flair
- Well-lit scene showing all details and patterns
- Warm ambient light bringing out rich jewel tones
- No dramatic shadows - everything visible and ornate
- Grand, luxurious illumination`,
    background: `- Bold floral wallpaper OR rich jewel-tone damask patterns
  * English tea room meets maximalist Instagram aesthetic
  * Layer decorative elements: add fresh flowers, vintage decorations`,
    surface: `- Ornate vintage plates with gold trim and visible wear, layered over patterned tablecloth with tactile fabric texture
- Decorative elements with character: antique lace doilies with detailed weave, vintage silverware with patina, scattered fresh flowers with realistic petals
- More is more - bold patterns and rich textures with tangible depth and imperfections`,
    colorPalette: `- Rich jewel tones: emerald green, sapphire blue, ruby red, gold accents everywhere
- Saturated, vibrant colors with ornate patterns
- Eclectic grandmillennial aesthetic with bold choices`,
    atmosphere: `Hyper-maximalist grandmillennial aesthetic - more is more! Ornate, bold, eclectic with layers of patterns and decorative vintage elements. English tea room meets maximalist Instagram.`,
    camera: `- Saturated, vibrant colors with natural richness
- Everything in sharp focus with professional lens clarity to show all ornate details
- Subtle lens vignetting to draw eye to center
- Natural color grading preserving jewel tones and ornate textures
- Rich, bold rendering showing patterns and textures with depth and dimension`
  },

  'rustic-film': {
    id: 'rustic-film',
    name: 'Rustic Film Photography Cabin',
    emoji: '📷',
    description: 'Handcrafted stoneware with warm vintage film aesthetic',

    // Rustic plates
    plates: {
      'soup': 'Medium Deep Stoneware Bowl (9-inch, 4-inch depth, matte charcoal glaze)',
      'salad': 'Large Flat Stoneware Plate (12-inch, rough earthy texture, warm beige)',
      'main': 'Large Flat Stoneware Plate (12-inch, rough earthy texture, warm beige)',
      'pasta': 'Large Deep Stoneware Bowl (12-inch, 2-inch depth, rustic brown glaze)',
      'sandwich': 'Rectangular Wooden Board (14x8-inch, natural wood grain)',
      'pizza': 'Round Wooden Pizza Board (14-inch, natural wood with charred edges)',
      'dessert': 'Small Artisan Stoneware Plate (9-inch, speckled glaze)',
      'side': 'Small Rustic Bowl (7-inch, 3-inch depth, earthy tones)',
    },
    materialDescription: 'Handcrafted stoneware with visible artisan marks, rough textures, earthy glazes in charcoal, beige, and brown tones. Mix with natural wooden boards for sandwiches and pizza.',

    // Vintage film visual style
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
  }
};

/**
 * Translation language configurations for menu text
 * Supports menu translation to various languages or no translation (default)
 */
export const TRANSLATION_LANGUAGES = {
  'none': {
    id: 'none',
    name: 'No Translation',
    displayName: 'No Translation (Default)',
    emoji: '',
    code: null,
    description: 'Keep original menu text - overlay on AI background',
  },
  'en_US': {
    id: 'en_US',
    name: 'English (US)',
    emoji: '🇺🇸',
    code: 'en_US',
    description: 'Translate menu to US English'
  },
  'fr': {
    id: 'fr',
    name: 'French',
    emoji: '🇫🇷',
    code: 'fr',
    description: 'Translate menu to French'
  },
  'es': {
    id: 'es',
    name: 'Spanish',
    emoji: '🇪🇸',
    code: 'es',
    description: 'Translate menu to Spanish'
  },
  'ja': {
    id: 'ja',
    name: 'Japanese',
    emoji: '🇯🇵',
    code: 'ja',
    description: 'Translate menu to Japanese'
  },
  'ko-KR': {
    id: 'ko-KR',
    name: 'Korean',
    emoji: '🇰🇷',
    code: 'ko_KR',
    description: 'Translate menu to Korean'
  },
  'pt': {
    id: 'pt',
    name: 'Portuguese',
    emoji: '🇵🇹',
    code: 'pt',
    description: 'Translate menu to Portuguese'
  },
  'ru': {
    id: 'ru',
    name: 'Russian',
    emoji: '🇷🇺',
    code: 'ru',
    description: 'Translate menu to Russian'
  },
  'zh': {
    id: 'zh',
    name: 'Chinese',
    emoji: '🇨🇳',
    code: 'zh',
    description: 'Translate menu to Simplified Chinese'
  },
  'de': {
    id: 'de',
    name: 'German',
    emoji: '🇩🇪',
    code: 'de',
    description: 'Translate menu to German'
  },
  'nl': {
    id: 'nl',
    name: 'Dutch',
    emoji: '🇳🇱',
    code: 'nl',
    description: 'Translate menu to Dutch'
  },
  'da-DK': {
    id: 'da-DK',
    name: 'Danish',
    emoji: '🇩🇰',
    code: 'da_DK',
    description: 'Translate menu to Danish'
  },
};

/**
 * Assign the appropriate plate type based on dish category and image style
 * @param {string} category - Dish category
 * @param {string} imageStyleName - Image style ID (default: 'verkada-classic')
 * @returns {string} Plate type specification
 */
export function assignPlateType(category, imageStyleName = 'verkada-classic') {
  const imageStyle = IMAGE_STYLES[imageStyleName] || IMAGE_STYLES['verkada-classic'];
  return imageStyle.plates[category] || imageStyle.plates['main'];
}

/**
 * Build the prompt for menu parsing (Stage 1)
 * @param {Object} preference - Dietary preference configuration
 * @returns {string} Menu parsing prompt
 */
export function buildMenuParsingPrompt(preference) {
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

## RULES FOR SELECTION (MAXIMIZE DIVERSITY - SELECT AS MANY AS POSSIBLE)
1. **DYNAMIC COUNT RULE**: Select AS MANY dishes as possible while maintaining quality visualization
   - **Target**: 5-8 dishes (optimal for visualization)
   - **Minimum**: At least 3 dishes
   - **Maximum**: Up to 12 dishes if the menu is extensive and diverse
   - YOU decide the count based on:
     * How many distinct categories are available
     * The visual appeal and diversity of available dishes
     * User's dietary preferences (some menus may have limited matching items)
     * Whether adding more dishes enhances or clutters the visualization

2. **STRICT DIVERSITY RULE**: Prioritize dishes from DIFFERENT categories
   - **Priority 1**: One dish per category (soup, salad, main, pasta, sandwich, pizza, dessert, side)
   - **Priority 2**: If you've covered all categories and want to add more, you MAY select a second dish from a category IF:
     * The dish is visually distinct from the first (different colors, textures, presentation)
     * It adds meaningful variety to the overall visualization
     * The menu has that many high-quality options
   - ✅ GOOD EXAMPLES:
     * 8 dishes from 8 different categories (ideal - maximum diversity) ✓
     * 6 dishes: 1 soup + 1 salad + 2 mains (if mains are very different) + 1 pasta + 1 dessert ✓
     * 5 dishes from 5 different categories (classic balanced selection) ✓
   - ❌ BAD EXAMPLES (DO NOT DO THIS):
     * Only 2 dishes when menu has 20+ items (too few - missed opportunity)
     * 3 pasta dishes + 2 salads (poor diversity - too repetitive)
     * 15 dishes when menu only has 8 (impossible - hallucinating dishes)

3. **INTELLIGENT SELECTION CRITERIA**:
   - **Visual Appeal**: Prioritize colorful, photogenic dishes with interesting textures
   - **Dietary Preference**: ${preference.modifier ? 'CRITICAL - Apply this dietary filter: ' + preference.modifier : 'No dietary restrictions - select from all available options'}
   - **Balance**: Mix textures and colors (creamy + crunchy, green + red/orange, etc.)
   - **Variety**: Choose dishes that look different from each other
   - **Quality over Quantity**: Better to have 5 stunning dishes than 10 mediocre ones
   - **Restaurant Appeal**: Favor dishes that sound unique, special, or signature items

4. **DECISION FRAMEWORK**:
   Before finalizing your selection, ask yourself:
   1. "Have I selected at least one dish from each available category?" (If no, add more)
   2. "Do these dishes offer good visual variety?" (different colors, textures, presentations)
   3. "Are all selections aligned with the dietary preference?" (Critical check)
   4. "Would adding one more dish enhance or clutter the visualization?" (Use your judgment)
   5. "Is this count realistic for the menu size?" (Don't overselect from a small menu)

## QUALITY CONTROL - WHEN TO LIMIT SELECTIONS
Even though you should maximize selections, there are cases where LESS IS MORE:
- **Small menus**: If menu has only 6-8 total items, select 4-6 (not all - leave room for curation)
- **Limited variety**: If most dishes are similar (e.g., 10 pasta dishes), select 3-5 most distinct ones
- **Dietary restrictions**: If dietary preference leaves only 3-4 options, that's perfectly fine
- **Poor quality items**: Don't include boring/generic items just to hit a count (e.g., "French Fries")
- **Visualization clarity**: Prioritize clear, stunning visualization over cramming in every possible dish

**REMEMBER**: The goal is to create an IMPRESSIVE, APPETIZING visualization that showcases the BEST of the menu. Quality > Quantity.

## OUTPUT
Return ONLY valid JSON, no additional text. Make sure the JSON is properly formatted and can be parsed.`;
}

/**
 * Build the dynamic image generation prompt from parsed menu data (Stage 2)
 * @param {Object} parsedMenuData - Parsed menu data from Stage 1
 * @param {string} imageStyle - Image style ID (default: 'verkada-classic')
 * @param {string} dietaryPreference - Dietary preference ID (default: 'regular')
 * @param {string} providerType - AI provider type ('openai' or 'gemini')
 * @param {string} translationLanguage - Translation language ID (default: 'none')
 * @returns {string} Image generation prompt
 */
export function buildImageGenerationPrompt(parsedMenuData, imageStyle = 'verkada-classic', dietaryPreference = 'regular', providerType = 'openai', translationLanguage = 'none') {
  const { menuTheme, selectedItems } = parsedMenuData;

  console.log('🎨 [PROMPT BUILDER] Building dynamic image generation prompt...');
  console.log('📋 [PROMPT BUILDER] Menu Theme:', menuTheme);
  console.log('🍽️ [PROMPT BUILDER] Selected Items:', selectedItems.length);
  console.log('🎨 [PROMPT BUILDER] Image Style:', imageStyle);
  console.log('🥗 [PROMPT BUILDER] Dietary Preference:', dietaryPreference);

  // Get unified image style configuration
  const imageStyleConfig = IMAGE_STYLES[imageStyle] || IMAGE_STYLES['verkada-classic'];
  console.log('🎨 [PROMPT BUILDER] Image style config:', JSON.stringify(imageStyleConfig, null, 2));

  // Build the dish descriptions with plate assignments
  const dishDescriptions = selectedItems.map((item, index) => {
    const plateType = assignPlateType(item.category, imageStyle);
    return `${index + 1}. **${item.name}** (${item.category})
   - Plate: ${plateType}
   - Visual Notes: ${item.visualAppeal}`;
  }).join('\n\n');

  console.log('🍽️ [PROMPT BUILDER] Dish descriptions created');

  // Translation-based text handling instructions
  const translationConfig = TRANSLATION_LANGUAGES[translationLanguage] || TRANSLATION_LANGUAGES['none'];
  const isTranslationEnabled = translationConfig.code !== null;

  // Build text handling constraints based on translation mode
  let textRenderingConstraint = '';
  let negativePrompts = '';

  if (isTranslationEnabled) {
    // Translation mode: AI renders translated text ON the food scene
    textRenderingConstraint = `
### TEXT RENDERING CONSTRAINT - TRANSLATION MODE
**CRITICAL**: Include translated menu text rendered directly in the generated image:
- Translate ALL menu text to **${translationConfig.name}** (language code: ${translationConfig.code})
- Translate: dish names, descriptions, prices, section headers, menu labels
- **PRESERVE EXACT LAYOUT**: Maintain the same text positioning and layout as the original menu
- **MATCH MENU STYLE**: Use fonts and typography that match the original menu aesthetic
- Render translated text OVER the food photography background
- Text should be clearly legible and professionally formatted
`;
    negativePrompts = `### NEGATIVE PROMPTS (What to Avoid)
- Do NOT create text-only translations without food photography
- Do NOT generate only text or menu cards without the food scene
- Avoid losing the food photography elements
- Do NOT create abstract or minimalist text-only designs`;
  } else {
    // No translation: AI generates clean background (text added in post-processing)
    textRenderingConstraint = `
### TEXT RENDERING CONSTRAINT - NO TRANSLATION MODE
**ABSOLUTELY NO TEXT IN THE IMAGE** - This is a pure food photography background:
- ZERO text of any kind - no letters, numbers, words, labels, or typography
- NO dish names, prices, descriptions, menu headers, or signage
- NO written content visible anywhere in the scene
- NO text on plates, napkins, packaging, or in the background
- NO menu cards, chalkboards, price tags, or labels of any kind
- Generate ONLY the photorealistic food photography scene
- Keep composition completely clean for text overlay in post-processing

**TRIPLE CHECK**: Before finalizing, verify there is ZERO text visible anywhere in the image.
`;
    negativePrompts = `### NEGATIVE PROMPTS (What to Avoid) - CRITICAL
**ABSOLUTELY FORBIDDEN - Remove if present:**
- Any text, letters, numbers, words, labels, or written characters
- Menu cards, price displays, signage, or chalkboards with text
- Text overlays, captions, watermarks, or typography of any kind
- Letter-like shapes, text artifacts, or accidental text patterns
- Packaging with visible text or branded labels with words
- Restaurant signs, menu boards, or any written information
**IF YOU SEE ANY TEXT IN YOUR GENERATED IMAGE - REMOVE IT COMPLETELY**`;
  }

  const prompt = `### PRIMARY OBJECTIVE
Create a photorealistic, magazine-quality food photography scene featuring ${selectedItems.length} dishes with professional styling, lighting, and composition.
${textRenderingConstraint}
${negativePrompts}
## MENU THEME
${menuTheme}

## DISHES TO VISUALIZE
${dishDescriptions}

## VISUAL STYLE: ${imageStyleConfig.name}
${imageStyleConfig.atmosphere}

**CRITICAL COMPOSITION LAYOUT**:
- **TOP 1/3 of image**: Soft, clean background space (for menu text overlay)
  * This area MUST be kept completely clear and simple
  ${imageStyleConfig.background}
  * ABSOLUTELY NO food elements in this upper third - leave space for text
  * Background fades naturally into the surface below

- **BOTTOM 2/3 of image**: Food presentation area
  * This is where ALL ${selectedItems.length} dishes should be arranged
  * Food occupies the lower two-thirds of the frame only
  * GENEROUS spacing between dishes - avoid crowding
  ${imageStyleConfig.surface}

**Spatial Distribution & Perspective**:
- Imagine looking at a table from above at an angle
- TOP 1/3 = empty background wall/space (for menu text)
- BOTTOM 2/3 = table surface with food dishes spread out
- Strong perspective: dishes further back appear smaller (natural depth)
- Dishes arranged with breathing room - not touching or overlapping too much
- Create sense of depth through perspective: back dishes smaller, front dishes larger

${imageStyleConfig.lighting}

**Food Arrangement in Bottom 2/3** (${selectedItems.length} dishes total):
- Arrange ALL ${selectedItems.length} dishes elegantly within the lower two-thirds of the frame
- Use the specified plate for each dish as noted above
- **SPACING RULES** (adjust based on dish count):
  ${selectedItems.length <= 4 ? '* FEW DISHES (≤4): Generous spacing, each dish prominent with lots of breathing room' : ''}
  ${selectedItems.length >= 5 && selectedItems.length <= 7 ? '* MEDIUM COUNT (5-7): Balanced spacing with clear separation between dishes' : ''}
  ${selectedItems.length >= 8 && selectedItems.length <= 10 ? '* MANY DISHES (8-10): Tighter composition but still distinct, slight overlapping OK' : ''}
  ${selectedItems.length > 10 ? '* MANY DISHES (10+): Compact arrangement, overlapping OK but each dish should be identifiable' : ''}
- Keep the composition balanced and visually pleasing with appropriate negative space
- View angle from above at an angle (looking down at 50-60 degrees)
- **LAYOUT STRATEGY**: ${selectedItems.length <= 5 ? 'Spread dishes across the full width for visual impact' : 'Create a natural, organic arrangement with depth - some dishes closer, some further back'}

**Perspective & Depth**:
- Apply natural perspective: dishes in the back row appear smaller/higher in frame
- Dishes in the front row appear larger/lower in frame
- This creates realistic table-top photography depth
- Avoid flat, 2D arrangement - use full 3D depth of the scene
- Camera positioned as if photographer is standing and looking down at the table

**Camera & Quality**:
- Elevated camera angle (50-60 degrees from horizontal) looking down at table
- Strong perspective showing depth from back to front
${imageStyleConfig.camera}
- Restaurant-quality, magazine-worthy presentation
- Make the food look absolutely delicious and irresistible

## PLATE STYLE: ${imageStyleConfig.name}
${imageStyleConfig.materialDescription}

**Specific Plate Assignments**:
${Object.entries(imageStyleConfig.plates).map(([category, plate]) => `- **${category}**: ${plate}`).join('\n')}

## FOOD STYLING REQUIREMENTS
- Each dish should look restaurant-quality and professionally plated
${imageStyleConfig.colorPalette}
- Appropriate garnishes and plating techniques for each dish type
- Proper portion sizes that look generous but not overwhelming
- Steam or freshness indicators where appropriate (e.g., soup should look hot)

## ADAPTIVE COMPOSITION STRATEGY (Based on ${selectedItems.length} dishes)
${selectedItems.length <= 4 ? `
**FEW DISHES STRATEGY** (${selectedItems.length} dishes):
- Each dish is a HERO - give it prominence and breathing room
- Use wide spacing to create visual impact
- Allow plates to be fully visible with minimal overlap
- This is a showcase of select premium items
` : ''}
${selectedItems.length >= 5 && selectedItems.length <= 7 ? `
**BALANCED STRATEGY** (${selectedItems.length} dishes):
- Classic food photography composition
- Arrange in natural groupings with clear focal points
- Front-to-back depth with 2-3 rows of dishes
- Strategic overlapping to create depth without cluttering
` : ''}
${selectedItems.length >= 8 && selectedItems.length <= 10 ? `
**ABUNDANT STRATEGY** (${selectedItems.length} dishes):
- Create a "feast table" impression
- Multiple rows with strong perspective (3-4 rows deep)
- Controlled overlapping - each dish should be 70%+ visible
- Tighter composition but maintain visual hierarchy (larger items in front)
- Use depth and scale variation to maintain clarity
` : ''}
${selectedItems.length > 10 ? `
**MAXIMUM VARIETY STRATEGY** (${selectedItems.length} dishes):
- Full table spread showing menu diversity
- Deep perspective with 4-5 rows
- Strategic overlapping acceptable - aim for 60%+ visibility per dish
- Vary plate sizes naturally (some plates closer/larger, some further/smaller)
- Create visual rhythm - don't make it look crowded, make it look ABUNDANT
- Think "family-style restaurant spread" or "buffet showcase"
` : ''}

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
- Maintain the ${imageStyleConfig.name} aesthetic throughout
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
2. **Bottom 2/3 check**: Are ALL ${selectedItems.length} dishes positioned in the lower two-thirds only?
3. **Text space**: Is there sufficient empty space at the top for menu text overlay?
4. **Spacing**: ${selectedItems.length <= 6 ? 'Is there generous space between dishes?' : 'Are dishes arranged compactly but still identifiable?'}
5. **Count verification**: Are there EXACTLY ${selectedItems.length} dishes visible (not more, not less)?
6. **Perspective**: Do back dishes appear smaller/higher and front dishes larger/lower?
7. **Depth**: Does the scene show natural 3D table-top perspective?
8. **Visual balance**: Does the arrangement feel natural and not cluttered?

## OUTPUT DELIVERABLE
A single, high-resolution PHOTOREALISTIC image (not CGI or 3D render) with the following layout:
- **Top 1/3**: Clean gradient background styled for ${imageStyleConfig.name} (space for menu text)
- **Bottom 2/3**: All ${selectedItems.length} dishes in ${imageStyleConfig.name} presentation with generous spacing and natural perspective depth

The image should look like a professional food photograph taken with a real camera, showing real food that actually exists.`;

  console.log('✅ [PROMPT BUILDER] Dynamic prompt built, length:', prompt.length, 'chars');
  console.log('📝 [PROMPT BUILDER] Full prompt:\n', prompt);

  return prompt;
}
