// ============================================================================
// MENU PARSING PROMPT - Stage 1: menu OCR + dish extraction (+ optional translation)
// ============================================================================

import { TRANSLATION_LANGUAGES } from './translation-languages.js';

/**
 * Build the prompt for menu parsing (Stage 1)
 * Optionally includes language detection and translation when translationLanguage is provided.
 *
 * @param {Object} preference - Dietary preference configuration
 * @param {string|null} translationLanguage - Translation language ID (e.g., 'fr', 'es') or null/undefined for no translation
 * @returns {string} Menu parsing prompt
 */
export function buildMenuParsingPrompt(preference, translationLanguage = null) {
  // Check if translation is enabled
  const translationConfig = translationLanguage
    ? (TRANSLATION_LANGUAGES[translationLanguage] || TRANSLATION_LANGUAGES['none'])
    : TRANSLATION_LANGUAGES['none'];
  const isTranslationEnabled = translationConfig.code !== null;

  // Build the JSON schema based on whether translation is enabled
  const baseSchema = isTranslationEnabled
    ? `{
  "detectedLanguage": "Primary language code of the menu (BCP-47 primary tag, e.g., 'en', 'fr', 'ja', 'es', 'zh')",
  "menuTheme": "Description of overall menu style/cuisine (e.g., 'Mediterranean Day', 'Asian Fusion', 'Classic American')",
  "allItems": [
    {
      "name": "Dish name (cleaned, without abbreviations)",
      "category": "soup | salad | main | pasta | sandwich | pizza | dessert | side",
      "description": "Brief description if available",
      "translatedName": "Dish name translated to ${translationConfig.name}",
      "translatedDescription": "Description translated to ${translationConfig.name} (or empty if no description)"
    }
  ],
  "selectedItems": [
    {
      "name": "Selected dish name (original language)",
      "category": "category",
      "description": "Why this dish was selected",
      "visualAppeal": "What makes this dish visually interesting",
      "translatedName": "Dish name translated to ${translationConfig.name}",
      "translatedDescription": "Visual appeal description translated to ${translationConfig.name}"
    }
  ]
}`
    : `{
  "detectedLanguage": "Primary language code of the menu (BCP-47 primary tag, e.g., 'en', 'fr', 'ja', 'es', 'zh')",
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
}`;

  // Translation instructions (only if enabled)
  const translationInstructions = isTranslationEnabled
    ? `
## TRANSLATION REQUIREMENTS
**Target Language**: ${translationConfig.name} (language code: ${translationConfig.code})

1. **Detect Menu Language**: Identify the primary language of the menu text and set "detectedLanguage" to the BCP-47 primary tag (e.g., 'en', 'fr', 'ja', 'es', 'zh', 'ko', 'de', 'pt', 'ru', 'nl', 'da').

2. **Translate Dish Names and Descriptions**:
   - For EACH item in "allItems" and "selectedItems", provide:
     - "translatedName": The dish name translated to ${translationConfig.name}
     - "translatedDescription": The description translated to ${translationConfig.name}
   - Fully translate the meaning (do NOT just transliterate)
   - Preserve culinary terms where appropriate (e.g., "croissant" stays "croissant")
   - If the menu is ALREADY in ${translationConfig.name}, copy the original text to the translated fields

3. **Translation Quality**:
   - Accurate, natural translations suitable for a menu
   - Maintain the style/tone of the original (formal/casual)
   - Do NOT invent or hallucinate content not in the original
`
    : `
## LANGUAGE DETECTION
**Required**: Identify the primary language of the menu text and set "detectedLanguage" to the BCP-47 primary tag (e.g., 'en', 'fr', 'ja', 'es', 'zh', 'ko', 'de', 'pt', 'ru', 'nl', 'da').
`;

  return `You are an expert food menu analyzer. Your task is to analyze this menu image and extract the most interesting dishes for visualization.

## TASK
Analyze the menu and return a JSON object with the following structure:

\`\`\`json
${baseSchema}
\`\`\`
${translationInstructions}

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


