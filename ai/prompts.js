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
    description: 'Blue and white Verkada plates with moody, realistic film photography',

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

    // Visual style modifiers (Rustic Film-inspired mood, but keeping Verkada plates)
    lighting: `**Lighting**: Moody natural window light (low-key, filmic)
- Single directional window light from 10–11 o'clock angle, diffused with a sheer curtain
- Deeper, softer shadows for depth (NOT flat/bright), while preserving detail in highlights
- Warm late-afternoon feel (cozy, realistic, not “studio bright”)
- No harsh artificial light, no flash look`,
    background: `- Warm cream-to-tan gradient background with subtle vignette at edges
  * Nostalgic, cinematic cookbook vibe (realistic, slightly underexposed)
  * Background fades naturally into the surface below
  * Keep it simple/clean for text overlay, but with filmic depth (not pure white)`,
    surface: `- Natural tactile surface with character: worn walnut or oak table, OR aged butcher block, OR dark stone with subtle texture and imperfections (avoid bright white marble)`,
    colorPalette: `- Filmic color grade (Kodak Gold / Portra-inspired): warm highlights, rich midtones, and gently muted saturation
- Preserve natural food color (realistic, not neon) with deep, soft blacks and smooth highlight rolloff
- Slight warmth overall; avoid clinical/cool whites`,
    atmosphere: `Photorealistic 35mm film food photography: deep, moody, cozy, and extremely realistic — like a real restaurant/cabin table scene shot on film.`,
    camera: `- Natural film grain texture (subtle, consistent)
- Soft vignette at edges (lens-like, not heavy)
- Gentle halation/bloom on specular highlights (very subtle, realistic)
- Warm tone curve with filmic contrast (deep shadows but not crushed)
- Professional analog-lens rendering with realistic bokeh and micro-contrast`
  },

  'rustic-film': {
    id: 'rustic-film',
    name: 'Verkada Rustic Film',
    displayName: 'Verkada Rustic (Filmic)',
    emoji: '📷',
    description: 'Verkada blue & white plates with deep, moody, realistic film photography',

    // Verkada plates (keep the classic blue/white plate set)
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
    emoji: '🏳️',
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
**CRITICAL - LAYOUT PRESERVATION WITH TRANSLATION**: You must generate this image as a **menu translation with preserved layout**.

This is a two-part task:
1. **Generate the food photography scene** (bottom 2/3 of image) with all ${selectedItems.length} dishes
2. **Translate and render menu text** (overlaid on the image) while preserving the original menu's visual structure

**Translation Requirements**:
- Translate ALL menu text to **${translationConfig.name}** (language code: ${translationConfig.code})
- Translate: dish names, descriptions, prices, section headers, menu labels
- Maintain accurate translations - do not transliterate, fully translate the meaning

**LAYOUT PRESERVATION - CRITICAL**:
- **Semantic Layout Matching**: Analyze the original menu's text positioning and replicate the EXACT spatial structure
- **Position Mapping**: If original has text in top-left, translated text must be in top-left at same relative position
- **Hierarchy Preservation**: Match text size hierarchy (headers larger, descriptions smaller, prices distinct)
- **Alignment Consistency**: If original uses center-aligned titles, use center-aligned. If left-aligned lists, use left-aligned.
- **Spacing Rules**: Maintain similar whitespace, margins, and line spacing as original menu
- **Reading Order**: Preserve top-to-bottom, left-to-right reading flow matching original layout

**Typography Instructions** (2025 Best Practices):
- **DO NOT try to match exact fonts by name** - instead use DESCRIPTIVE font characteristics:
  * For menu titles: "clean, bold, sans-serif font with professional weight"
  * For dish names: "modern, medium-weight sans-serif, clearly legible"
  * For descriptions: "light, readable sans-serif with comfortable letter spacing"
  * For prices: "clean, numeric-friendly sans-serif font"
- **Font Style Matching**: Observe if original is modern/elegant/casual/bold and apply similar STYLE characteristics
- **Text Color**: Match the color scheme - if original has dark text on light background, maintain that contrast
- **Text Effects**: If original has shadows, outlines, or other effects, apply similar treatment

**Text Rendering Quality**:
- All text must be **crystal-clear and legible** - no blurry, distorted, or broken characters
- Use **high-fidelity text rendering** - characters should be sharp and professionally typeset
- **Kerning and spacing**: Proper letter spacing and word spacing for readability
- **Multi-line handling**: If text wraps, maintain consistent line height and alignment
- **Special characters**: Render accents, diacritics, and language-specific characters correctly

**Composition Integration**:
- Text should integrate naturally with the food photography background
- Maintain clear contrast between text and background for readability
- Text overlay should not obscure the beauty of the food photography
- Balance text density with visual breathing room
`;
    negativePrompts = `### NEGATIVE PROMPTS (What to Avoid) - CRITICAL FOR TRANSLATION MODE
**ABSOLUTELY FORBIDDEN**:
- Do NOT create text-only translations without food photography
- Do NOT generate only menu cards or text layouts without the food scene
- Do NOT lose or minimize the food photography elements
- Do NOT create abstract or minimalist text-only designs
- Do NOT randomize text positions - maintain original layout structure
- Do NOT use placeholder or Lorem Ipsum text
- Do NOT create blurry, distorted, or illegible text
- Do NOT mix languages - only use ${translationConfig.name}
- Do NOT ignore the spatial positioning of original menu text
- Do NOT create new layout designs - preserve the original structure`;
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

  const prompt = `## PRIMARY OBJECTIVE
Generate a photorealistic, studio-grade professional food photography scene featuring exactly ${selectedItems.length} dishes.

${textRenderingConstraint}
${negativePrompts}

## MENU THEME CONTEXT
${menuTheme}

## DISHES TO VISUALIZE
${dishDescriptions}

## VISUAL STYLE & ATMOSPHERE
${imageStyleConfig.name}: ${imageStyleConfig.atmosphere}

## CAMERA DIRECTION (Cinematographer-Style - CRITICAL FOR GEMINI 3 PRO IMAGE)
**Shot Composition:**
- **Camera Angle**: High-angle overhead shot at 50-60 degrees from horizontal, positioned as if photographer standing and looking down at dining table
- **Lens**: 50mm prime lens at f/2.8 aperture for natural compression and selective focus
- **Focus Point**: Sharp focus on central/front dishes, gradual bokeh falloff toward background dishes
- **Depth of Field**: Shallow depth (f/2.8) - foreground dishes crystal sharp, background dishes naturally blurred
- **Framing**: Full table spread composition showing spatial depth from back to front
- **Perspective**: Strong linear perspective - back dishes smaller/higher in frame, front dishes larger/lower

**Lighting Setup:**
${imageStyleConfig.lighting}
- **Key Light**: ${imageStyleConfig.lighting.includes('natural') ? 'Soft window light from 10 o\'clock position' : 'Primary light source positioned at 45-degree angle'}
- **Fill Light**: Gentle ambient bounce light to soften shadows without eliminating depth
- **Rim/Back Light**: Subtle backlighting on dish edges for separation and dimension
- **Light Quality**: Diffused, soft shadows creating depth without harshness
- **Color Temperature**: ${imageStyleConfig.lighting.includes('warm') ? 'Warm 3200K for appetizing glow' : imageStyleConfig.lighting.includes('neon') ? 'Multi-color LED neon (cyan/magenta/purple)' : 'Neutral 5500K daylight'}

**Color Grading:**
${imageStyleConfig.colorPalette}
- **Tone Curve**: ${imageStyleConfig.lighting.includes('cyberpunk') ? 'High contrast with crushed blacks and vibrant highlights' : 'Natural S-curve with lifted shadows and gentle highlight rolloff'}
- **Saturation**: Vibrant but natural - not oversaturated or artificial looking
- **White Balance**: Consistent across all dishes, matching lighting color temperature

## COMPOSITION LAYOUT (CRITICAL)
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

## PHOTOREALISM REQUIREMENTS - GEMINI 3 PRO IMAGE (NANO BANANA PRO) 2025
**CRITICAL**: This MUST be indistinguishable from professional food photography shot with real camera equipment. NOT CGI, NOT 3D render, NOT artificial.

**Execute This Like a Professional Food Photographer Would:**

**Camera Setup (Directive - Execute These Settings):**
- Shoot with: Canon EOS R5 with RF 50mm f/1.2L lens
- Set aperture to: f/2.8 (for shallow depth, food sharp, background bokeh)
- ISO: 400 (clean image, minimal noise)
- Shutter speed: 1/125s (handheld stability)
- White balance: 5500K daylight (natural, appetizing tones)
- Focus mode: Single-point AF on central dish
- Shoot in: Manual mode with RAW capture quality

**Food Styling Directive (Execute Like Professional Food Stylist):**

**Texture Detail - Macro-Level Focus:**
- Crispy fried items: Show individual crackles, golden-brown color gradients, slight oil sheen
- Grilled proteins: Visible char marks (not perfect lines - organic patterns), caramelized edges
- Fresh vegetables: Water droplets, natural color variations, visible imperfections (small spots, irregular shapes)
- Sauces: Real viscosity behavior - drizzles follow gravity, dots have surface tension, pools reflect light
- Breads: Irregular air pockets in cross-section, flour dusting with natural scatter, crusty texture with cracks
- Cheese: Realistic melt patterns (stretching if hot, crumbling if aged), oil separation on surface
- Garnishes: Microgreens with tiny leaves, herb sprigs with natural wilting, visible leaf veins

**Natural Imperfections (Realism Markers):**
- Grill marks: Irregular char patterns, not perfectly parallel
- Browning: Uneven caramelization with darker and lighter spots
- Plating: Small sauce splatter on rim edge, stray herb leaf, tiny bread crumb
- Vegetables: Natural size variations, slight bruising, irregular shapes
- Proteins: Natural marbling in meat, visible grain structure, uneven cooking levels
- Surfaces: Realistic bumps, ridges, organic textures (NO AI-smooth surfaces)

**Lighting Execution (Critical for Photorealism):**
- Cast realistic shadows: Soft-edged shadows between layers, under garnishes (show 3D depth)
- Specular highlights: Bright reflections on wet surfaces (sauce pools, oil glazes, fresh vegetables)
- Rim light: Subtle hair light on food edges for separation from background
- Subsurface scattering: Translucent items (tomato slices, citrus, thin vegetables) glow slightly when backlit
- Shadow depth: Gentle gradient from shadow to highlight (not harsh cutoff)
- NO flat/even lighting: Must have dimension, depth, and visual interest

**Moisture and Freshness (Visual Cues):**
- Hot dishes: Subtle steam wisps rising (not overdone - realistic amount)
- Fresh vegetables: Tiny water droplets, slight sheen/moisture
- Sauces: Glossy surface with light reflections, realistic viscosity
- Grilled items: Light oil sheen, slight smoke traces
- Cold items: Condensation appropriate for temperature
- Herbs: Fresh appearance - vibrant color, natural moisture, not dry or plastic

**Plating Style (Human Touch - Not AI Perfect):**
- Sauce drizzle: Organic flow patterns following gravity, small splatter on rim
- Garnish scatter: Random placement - herbs dropped naturally, not arranged
- Stacking: Real-world physics - items settled naturally, slight lean/tilt
- Height variation: Natural 3D composition, not flat
- Negative space: Breathing room on plate, not overly crowded or perfectly centered
- Edge clarity: Some ingredients near rim, not all centered

**Post-Production Color Grade (Apply These Settings):**
- Lift blacks slightly (no crushed pure black - keep shadow detail)
- Gentle highlight rolloff (prevent blown-out whites)
- S-curve tone: Lifted shadows, controlled highlights
- Warmth: +5 to +10 warmth for appetizing glow
- Saturation: +10 to +15 vibrance (natural, not oversaturated)
- Tint: Slight magenta/warm shift for food appeal
- Vignette: Subtle natural lens vignette at edges (draws eye to center)

**Lens Rendering (Replicate Real Glass Optics):**
- Bokeh: Circular, smooth out-of-focus areas (f/1.2-f/2.8 lens characteristic)
- Focus transition: Gradual falloff from sharp to blur (not abrupt AI blur)
- Chromatic aberration: Tiny color fringing at high-contrast edges (optional, subtle)
- Lens compression: 50mm compression - natural perspective, not wide-angle distortion
- Edge softness: Slight softness at image edges (natural lens behavior)

**Quality Control - Image Must Pass These Tests:**
1. ✓ Could a Canon R5 with 50mm f/1.2 lens capture this image?
2. ✓ Do all textures show macro-level realistic detail?
3. ✓ Are there visible natural imperfections (not CGI-perfect)?
4. ✓ Does lighting create authentic dimensionality?
5. ✓ Would this pass as real food photography in Bon Appétit or Food & Wine magazine?
6. ✓ Is the color grading warm, appetizing, and professionally treated?
7. ✓ Does the bokeh and depth of field match real f/2.8 lens rendering?

**Reference Mental Model:**
Think: "Close-up shot of artisan sourdough bread on wooden board, flour dusted across surface, golden crispy crust with cracked details, warm directional side lighting, moody dark background, crumbs scattered naturally, ultra-sharp food textures, cinematic kitchen atmosphere, shot on Canon R5, 50mm f/1.2, shallow depth of field."

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
