// ============================================================================
// MENU FOOD GENERATION PROMPT - Generate food/background only (NO MENU TEXT)
// ============================================================================

import { IMAGE_STYLES, assignPlateType } from '../prompts.js';

/**
 * Build the food/background generation prompt from parsed menu data.
 * This prompt MUST produce a clean food photography background with NO text,
 * because menu text will be composited later (original or translated menu layer).
 *
 * @param {Object} parsedMenuData - Parsed menu data from Stage 1
 * @param {string} imageStyle - Image style ID (default: 'verkada-classic')
 * @param {string} dietaryPreference - Dietary preference ID (default: 'regular')
 * @param {string} providerType - AI provider type ('openai' or 'gemini') used for logging only
 * @returns {string} Image generation prompt
 */
export function buildMenuFoodGenerationPrompt(
  parsedMenuData,
  imageStyle = 'verkada-classic',
  dietaryPreference = 'regular',
  providerType = 'openai'
) {
  const { menuTheme, selectedItems } = parsedMenuData;

  console.log('🎨 [PROMPT BUILDER] Building FOOD (no-text) image generation prompt...');
  console.log('📋 [PROMPT BUILDER] Provider:', providerType);
  console.log('📋 [PROMPT BUILDER] Menu Theme:', menuTheme);
  console.log('🍽️ [PROMPT BUILDER] Selected Items:', selectedItems.length);
  console.log('🎨 [PROMPT BUILDER] Image Style:', imageStyle);
  console.log('🥗 [PROMPT BUILDER] Dietary Preference:', dietaryPreference);

  const imageStyleConfig = IMAGE_STYLES[imageStyle] || IMAGE_STYLES['verkada-classic'];

  const dishDescriptions = selectedItems.map((item, index) => {
    const plateType = assignPlateType(item.category, imageStyle);
    return `${index + 1}. **${item.name}** (${item.category})
   - Plate: ${plateType}
   - Visual Notes: ${item.visualAppeal}`;
  }).join('\n\n');

  const textRenderingConstraint = `
### TEXT RENDERING CONSTRAINT - CRITICAL
**ABSOLUTELY NO TEXT IN THE IMAGE** - This is a pure food photography background:
- ZERO text of any kind - no letters, numbers, words, labels, or typography
- NO dish names, prices, descriptions, menu headers, or signage
- NO written content visible anywhere in the scene
- NO text on plates, napkins, packaging, or in the background
- NO menu cards, chalkboards, price tags, or labels of any kind
- Generate ONLY the photorealistic food photography scene
- Keep composition completely clean for later menu text overlay

**TRIPLE CHECK**: Before finalizing, verify there is ZERO text visible anywhere in the image.
`;

  const negativePrompts = `### NEGATIVE PROMPTS (What to Avoid) - CRITICAL
**ABSOLUTELY FORBIDDEN - Remove if present:**
- Any text, letters, numbers, words, labels, or written characters
- Menu cards, price displays, signage, or chalkboards with text
- Text overlays, captions, watermarks, or typography of any kind
- Letter-like shapes, text artifacts, or accidental text patterns
- Packaging with visible text or branded labels with words
- Restaurant signs, menu boards, or any written information
**IF YOU SEE ANY TEXT IN YOUR GENERATED IMAGE - REMOVE IT COMPLETELY**`;

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
- TOP 1/3 = empty background wall/space (for menu text)
- BOTTOM 2/3 = table surface with food dishes spread out
- Strong perspective: dishes further back appear smaller (natural depth)
- Dishes arranged with breathing room - not touching or overlapping too much

${imageStyleConfig.lighting}

## PLATE STYLE: ${imageStyleConfig.name}
${imageStyleConfig.materialDescription}

**Specific Plate Assignments**:
${Object.entries(imageStyleConfig.plates).map(([category, plate]) => `- **${category}**: ${plate}`).join('\n')}

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
4. **Count verification**: Are there EXACTLY ${selectedItems.length} dishes visible (not more, not less)?
5. **Perspective**: Do back dishes appear smaller/higher and front dishes larger/lower?
6. **Depth**: Does the scene show natural 3D table-top perspective?

## OUTPUT DELIVERABLE
A single, high-resolution PHOTOREALISTIC image (not CGI or 3D render) with the following layout:
- **Top 1/3**: Clean gradient background styled for ${imageStyleConfig.name} (space for menu text)
- **Bottom 2/3**: All ${selectedItems.length} dishes in ${imageStyleConfig.name} presentation with generous spacing and natural perspective depth

The image should look like a professional food photograph taken with a real camera, showing real food that actually exists.`;

  console.log('✅ [PROMPT BUILDER] Food prompt built, length:', prompt.length, 'chars');
  return prompt;
}


