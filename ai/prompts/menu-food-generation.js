// ============================================================================
// MENU FOOD GENERATION PROMPT - Generate food/background only (NO MENU TEXT)
// ============================================================================

import { IMAGE_STYLES, assignPlateType } from '../prompts.js';
import { dedent, joinSections } from '../../lib/utils.js';

function buildDishDescriptions(selectedItems, imageStyle) {
  return selectedItems.map((item, index) => {
    const plateType = assignPlateType(item.category, imageStyle);
    // Always use original dish names for image generation (better model training on English names)
    return dedent`
      ${index + 1}. **${item.name}** (${item.category})
         - Plate: ${plateType}
         - Visual Notes: ${item.visualAppeal}
    `;
  }).join('\n\n');
}

function buildPlateAssignments(imageStyleConfig) {
  return Object.entries(imageStyleConfig.plates)
    .map(([category, plate]) => `- **${category}**: ${plate}`)
    .join('\n');
}

function buildNoTextConstraintSection() {
  // Keeping this as a named section makes the final prompt easier to scan and tweak.
  return dedent`
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
}

function buildNegativePromptsSection() {
  // Named section to make it obvious what is "rules" vs "avoid list".
  return dedent`
    ### NEGATIVE PROMPTS (What to Avoid) - CRITICAL
    **ABSOLUTELY FORBIDDEN - Remove if present:**
    - Any text, letters, numbers, words, labels, or written characters
    - Menu cards, price displays, signage, or chalkboards with text
    - Text overlays, captions, watermarks, or typography of any kind
    - Letter-like shapes, text artifacts, or accidental text patterns
    - Packaging with visible text or branded labels with words
    - Restaurant signs, menu boards, or any written information
    **IF YOU SEE ANY TEXT IN YOUR GENERATED IMAGE - REMOVE IT COMPLETELY**
  `;
}

// ---------------------------------------------------------------------------
// FLOATING-COLLAGE LAYOUT HELPERS (for Verkada Air style)
// ---------------------------------------------------------------------------

function buildFloatingCameraDirection(imageStyleConfig, lightingText) {
  return dedent`
    ## CAMERA DIRECTION (Flying Plated Food - Dynamic Product Photography)
    **Shot Composition:**
    - **Camera Angle**: Straight-on or slight low angle, as if plated food is FLYING TOWARD the viewer
    - **Lens**: 50mm prime lens at f/4 aperture for clean, sharp images
    - **Focus**: All dishes in sharp focus (deep depth of field)
    - **Framing**: Hero-banner composition with plated dishes scattered dynamically
    - **Perspective**: DRAMATIC size variation — large dishes in front, small dishes in back
    - **Motion Feel**: Plated dishes flying TOWARD the viewer with energy
    - **NO horizon line, NO table edge, NO surface visible — pure gradient background**

    **Dish Positioning — RADIAL SCATTER PATTERN (CRITICAL):**
    - Dishes are arranged in a RADIAL pattern, scattered outward from an invisible center point
    - All plated dishes SPREAD OUTWARD in different directions
    - **RADIAL ROTATION**: Each dish tilts OUTWARD from center:
      * Left-side dishes: tilt toward the LEFT
      * Right-side dishes: tilt toward the RIGHT
      * Top dishes: tilt backward
      * Bottom dishes: tilt forward
    - Creates dynamic scattered composition with varied angles
    - Food stays INTACT on plates — NO loose debris, just clean plated dishes

    **Lighting Setup:**
    ${lightingText}
    - **Key Light**: Bright, even studio lighting from above/front
    - **Fill Light**: Ambient fill for clean shadows
    - **Rim Light**: Subtle edge lighting to separate dishes from gradient background
    - **Light Quality**: Clean, modern, high-key with appetizing food highlights
    - **Color Temperature**: Neutral 5500K daylight

    **Color Grading:**
    ${imageStyleConfig.colorPalette}
    - **Tone Curve**: Bright, punchy with clean highlight rolloff
    - **Saturation**: Vibrant, appetizing food colors
    - **White Balance**: Neutral/cool to complement purple-cyan gradient
  `;
}

function buildFloatingCompositionLayout(imageStyleConfig, itemCount) {
  return dedent`
    ## COMPOSITION LAYOUT (FLYING PLATED FOOD - CRITICAL)
    - **TOP-LEFT area**: Cleaner gradient space (for menu text overlay)
      * Fewer dishes in this zone, or smaller background dishes only
      * Keep readable space for text

    - **CENTER & RIGHT areas**: Main flying plated food collage
      * All ${itemCount} dishes FLYING ON PLATES toward the viewer
      * Plated dishes scattered dynamically across the gradient
      * Food stays INTACT on plates/bowls — clean, well-composed dishes
      * NO loose flying ingredients, crumbs, or debris — CLEAN composition

    **Background (CRITICAL):**
    ${imageStyleConfig.background}

    **Flying Plated Food Distribution — RADIAL SCATTER PATTERN**:
    - Dishes are scattered outward from an invisible center point
    - All dishes SPREAD OUTWARD from center in a radial pattern
    - LARGE dishes in foreground (closer to camera), SMALL dishes in background
    - **RADIAL ROTATION FROM CENTER**:
      * Left dishes tilt LEFT
      * Right dishes tilt RIGHT
      * Top dishes tilt backward, Bottom dishes tilt forward
    - Dynamic scattered arrangement with energy
    - GENEROUS spacing between dishes — avoid crowding or overlapping
    - **BACKGROUND IS A FLAT, SMOOTH GRADIENT — NO EFFECTS**:
      * Just a PURE, FLAT, SMOOTH purple-to-cyan gradient
      * NO patterns, NO rays, NO glows, NO effects
      * NO sparkles, NO stars, NO particles, NO noise
    - NO table surface, NO horizon line
  `;
}

function buildFloatingCompositionVerification(itemCount) {
  return dedent`
    ## COMPOSITION VERIFICATION
    Before finalizing the image, verify:
    1. **Radial scatter**: Are dishes scattered outward from center in different directions?
    2. **Dish rotation**: Does each dish tilt outward? (left dishes tilt left, right dishes tilt right)
    3. **Verkada plates**: Are dishes on blue and white ceramic Verkada plates?
    4. **Food intact**: Is food staying INTACT on plates? NO loose debris?
    5. **Clean composition**: Is the image CLEAN without floating food pieces?
    6. **FLAT GRADIENT BACKGROUND**:
       - Is the background JUST a flat, smooth purple-to-cyan gradient?
       - Are there NO patterns, rays, glows, or any visual effects?
    7. **No noise**: NO sparkles, NO stars, NO particles?
    8. **No surface**: NO horizon line, NO table surface?
    9. **Depth layering**: Are foreground dishes LARGER than background dishes?
    10. **Count verification**: Are there EXACTLY ${itemCount} distinct plated dishes?
    11. **Text space**: Is the top-left area relatively clear for menu text overlay?
  `;
}

function buildFloatingOutputDeliverable(imageStyleConfig, itemCount) {
  return dedent`
    ## OUTPUT DELIVERABLE
    A single, high-resolution PRODUCT PHOTOGRAPHY image:
    - **Dish arrangement**: Dishes scattered outward from center in a radial pattern
    - **BACKGROUND**: 
      * FLAT, SMOOTH purple-to-cyan gradient ONLY
      * Just a pure, simple gradient — NO patterns, NO rays, NO glows, NO effects
    - **Food items**: All ${itemCount} dishes ON VERKADA PLATES (blue/white ceramic)
    - **Dish rotation**: Each dish tilts outward (left dishes tilt left, right tilt right)
    - **Depth**: Large dishes in foreground, smaller dishes in background
    - **CLEAN composition**: Food stays INTACT on plates — NO loose debris
    - **Top-left area**: Cleaner zone with fewer items (space for menu text overlay)
    - **Style**: Premium food delivery app hero-banner aesthetic — dynamic, appetizing

    The background is JUST a flat, smooth gradient. The dishes are scattered dynamically but the background has NO visual effects.
  `;
}

/**
 * Build the food/background generation prompt from parsed menu data.
 * This prompt MUST produce a clean food photography background with NO text,
 * because menu text will be composited later (original or translated menu layer).
 *
 * Always uses ORIGINAL dish names (typically English) for image generation,
 * as image models have better training data on English dish names.
 * Translated names are used separately for the text overlay layer.
 *
 * @param {Object} parsedMenuData - Parsed menu data from Stage 1
 * @param {string} imageStyle - Image style ID (default: 'verkada-classic')
 * @returns {string} Image generation prompt
 */
export function buildMenuFoodGenerationPrompt(
  parsedMenuData,
  imageStyle = 'verkada-classic'
) {
  const { menuTheme, selectedItems } = parsedMenuData;

  const imageStyleConfig = IMAGE_STYLES[imageStyle] || IMAGE_STYLES['verkada-classic'];
  const plateAssignments = buildPlateAssignments(imageStyleConfig);
  const dishDescriptions = buildDishDescriptions(selectedItems, imageStyle);
  const lightingText = imageStyleConfig.lighting;

  // Branch on layout type: floating-collage vs traditional tabletop
  const isFloatingCollage = imageStyleConfig.layout === 'floating-collage';

  if (isFloatingCollage) {
    // FLYING FOOD COLLAGE LAYOUT (Verkada Air style)
    return joinSections([
      dedent`
        ## PRIMARY OBJECTIVE
        Generate a dynamic, high-energy product photography image featuring exactly ${selectedItems.length} dishes arranged in a RADIAL SCATTER pattern on a rich purple-to-cyan gradient background.
        - Dishes are scattered outward from the center of the frame
        - All plated dishes RADIATE OUTWARD in different directions
        - Each dish rotated AWAY from center (left dishes tilt left, right dishes tilt right)
        - Food stays INTACT on Verkada plates — clean composition, no loose debris
        - Background is a FLAT, SMOOTH gradient — NO visual effects
      `,
      buildNoTextConstraintSection(),
      buildNegativePromptsSection(),
      dedent`
        ## MENU THEME CONTEXT
        ${menuTheme}
      `,
      dedent`
        ## DISHES TO VISUALIZE (FLYING ON PLATES)
        ${dishDescriptions}

        **IMPORTANT**: Each dish flies ON its plate/bowl through the air.
        - Sandwiches: on a flying plate, tilted dynamically (or flying solo)
        - Soups/bowls: in flying bowls, tilted at angle with liquid visible
        - Salads: in flying bowls, food intact on the plate
        - All items: plates/bowls fly WITH the food, tilted at dynamic angles
        - Food stays INTACT on plates — NO loose flying ingredients or scattered debris
      `,
      dedent`
        ## VISUAL STYLE & ATMOSPHERE
        ${imageStyleConfig.name}: ${imageStyleConfig.atmosphere}
      `,
      buildFloatingCameraDirection(imageStyleConfig, lightingText),
      buildFloatingCompositionLayout(imageStyleConfig, selectedItems.length),
      dedent`
        ## FOOD PRESENTATION: ${imageStyleConfig.name}
        ${imageStyleConfig.materialDescription}

        **Plate/Bowl Assignments (Verkada Blue & White)**:
        ${plateAssignments}

        **FLYING PLATED DISHES**:
        - Each dish flies ON its Verkada plate or bowl through the air
        - Classic blue and white ceramic plates (same style as other Verkada menus)
        - Plates and bowls are TILTED at dynamic angles (15-45°)
        - Food stays INTACT and well-composed on each plate
        - NO loose flying ingredients, crumbs, or scattered debris
        - CLEAN composition — just the beautifully plated dishes flying
      `,
      dedent`
        ## CRITICAL REQUIREMENTS
        - EXACTLY ${selectedItems.length} plated dishes MUST be visible - NO MORE, NO LESS
        - Each dish listed above should appear EXACTLY ONCE (no duplicates)
        - **RADIAL SCATTER PATTERN**: Dishes scattered outward from center
        - Left dishes tilt LEFT, right dishes tilt RIGHT
        - ALL dishes FLYING ON VERKADA PLATES (blue and white ceramic)
        - **CLEAN COMPOSITION**: Food stays INTACT on plates — NO loose debris
        - **BACKGROUND IS FLAT GRADIENT ONLY**:
          * Just a FLAT, SMOOTH purple-to-cyan gradient
          * NO patterns, NO rays, NO glows, NO effects of any kind
        - Dramatic depth: LARGE dishes in front, SMALL dishes in back
        - Final image should feel dynamic, premium, and appetizing
      `,
      dedent`
        ## ANTI-DUPLICATION CHECK
        Before generating, verify:
        1. Are there exactly ${selectedItems.length} distinct food items in the scene?
        2. Does each item match one from the list above?
        3. Are there any duplicate items? (If yes, remove duplicates)
      `,
      buildFloatingCompositionVerification(selectedItems.length),
      buildFloatingOutputDeliverable(imageStyleConfig, selectedItems.length),
    ]);
  }

  // TRADITIONAL TABLETOP LAYOUT (all other styles)
  const keyLight = lightingText.includes('natural')
    ? 'Soft window light from 10 o\'clock position'
    : 'Primary light source positioned at 45-degree angle';
  const colorTemperature = lightingText.includes('warm')
    ? 'Warm 3200K for appetizing glow'
    : lightingText.includes('neon')
      ? 'Multi-color LED neon (cyan/magenta/purple)'
      : 'Neutral 5500K daylight';
  const toneCurve = lightingText.includes('cyberpunk')
    ? 'High contrast with crushed blacks and vibrant highlights'
    : 'Natural S-curve with lifted shadows and gentle highlight rolloff';

  return joinSections([
    dedent`
      ## PRIMARY OBJECTIVE
      Generate a photorealistic, studio-grade professional food photography scene featuring exactly ${selectedItems.length} dishes.
    `,
    buildNoTextConstraintSection(),
    buildNegativePromptsSection(),
    dedent`
      ## MENU THEME CONTEXT
      ${menuTheme}
    `,
    dedent`
      ## DISHES TO VISUALIZE
      ${dishDescriptions}
    `,
    dedent`
      ## VISUAL STYLE & ATMOSPHERE
      ${imageStyleConfig.name}: ${imageStyleConfig.atmosphere}
    `,
    dedent`
      ## CAMERA DIRECTION (Cinematographer-Style - CRITICAL FOR GEMINI 3 PRO IMAGE)
      **Shot Composition:**
      - **Camera Angle**: High-angle overhead shot at 50-60 degrees from horizontal, positioned as if photographer standing and looking down at dining table
      - **Lens**: 50mm prime lens at f/2.8 aperture for natural compression and selective focus
      - **Focus Point**: Sharp focus on central/front dishes, gradual bokeh falloff toward background dishes
      - **Depth of Field**: Shallow depth (f/2.8) - foreground dishes crystal sharp, background dishes naturally blurred
      - **Framing**: Full table spread composition showing spatial depth from back to front
      - **Perspective**: Strong linear perspective - back dishes smaller/higher in frame, front dishes larger/lower

      **Lighting Setup:**
      ${lightingText}
      - **Key Light**: ${keyLight}
      - **Fill Light**: Gentle ambient bounce light to soften shadows without eliminating depth
      - **Rim/Back Light**: Subtle backlighting on dish edges for separation and dimension
      - **Light Quality**: Diffused, soft shadows creating depth without harshness
      - **Color Temperature**: ${colorTemperature}

      **Color Grading:**
      ${imageStyleConfig.colorPalette}
      - **Tone Curve**: ${toneCurve}
      - **Saturation**: Vibrant but natural - not oversaturated or artificial looking
      - **White Balance**: Consistent across all dishes, matching lighting color temperature
    `,
    dedent`
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
    `,
    dedent`
      ## PLATE STYLE: ${imageStyleConfig.name}
      ${imageStyleConfig.materialDescription}

      **Specific Plate Assignments**:
      ${plateAssignments}
    `,
    dedent`
      ## CRITICAL REQUIREMENTS
      - EXACTLY ${selectedItems.length} dishes MUST be visible - NO MORE, NO LESS
      - Each dish listed above should appear EXACTLY ONCE in the image (no duplicates)
      - DO NOT create multiple versions of the same dish
      - Use the exact plate types specified for each dish
      - Maintain the ${imageStyleConfig.name} aesthetic throughout
      - Keep the scene clean and uncluttered
      - Make the food the star - background supports but doesn't compete
      - Final image should make viewers hungry and excited to eat
    `,
    dedent`
      ## ANTI-DUPLICATION CHECK
      Before generating, verify:
      1. Are there exactly ${selectedItems.length} distinct dishes in the scene?
      2. Does each dish match one from the list above?
      3. Are there any duplicate dishes? (If yes, remove duplicates)
    `,
    dedent`
      ## COMPOSITION VERIFICATION
      Before finalizing the image, verify this critical layout:
      1. **Top 1/3 check**: Is the upper third of the image clear background space (no food)?
      2. **Bottom 2/3 check**: Are ALL ${selectedItems.length} dishes positioned in the lower two-thirds only?
      3. **Text space**: Is there sufficient empty space at the top for menu text overlay?
      4. **Count verification**: Are there EXACTLY ${selectedItems.length} dishes visible (not more, not less)?
      5. **Perspective**: Do back dishes appear smaller/higher and front dishes larger/lower?
      6. **Depth**: Does the scene show natural 3D table-top perspective?
    `,
    dedent`
      ## OUTPUT DELIVERABLE
      A single, high-resolution PHOTOREALISTIC image (not CGI or 3D render) with the following layout:
      - **Top 1/3**: Clean gradient background styled for ${imageStyleConfig.name} (space for menu text)
      - **Bottom 2/3**: All ${selectedItems.length} dishes in ${imageStyleConfig.name} presentation with generous spacing and natural perspective depth

      The image should look like a professional food photograph taken with a real camera, showing real food that actually exists.
    `,
  ]);
}


