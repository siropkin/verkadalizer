// ============================================================================
// IMAGE STYLES - Plates + visual aesthetics presets
// ============================================================================

import { dedent } from '../../lib/utils.js';

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
    lighting: dedent`
      **Lighting**: Moody natural window light (low-key, filmic)
      - Single directional window light from 10–11 o'clock angle, diffused with a sheer curtain
      - Deeper, softer shadows for depth (NOT flat/bright), while preserving detail in highlights
      - Warm late-afternoon feel (cozy, realistic, not “studio bright”)
      - No harsh artificial light, no flash look
    `,
    background: dedent`
      - Warm cream-to-tan gradient background with subtle vignette at edges
        * Nostalgic, cinematic cookbook vibe (realistic, slightly underexposed)
        * Background fades naturally into the surface below
        * Keep it simple/clean for text overlay, but with filmic depth (not pure white)
    `,
    surface: dedent`
      - Natural tactile surface with character: worn walnut or oak table, OR aged butcher block, OR dark stone with subtle texture and imperfections (avoid bright white marble)
    `,
    colorPalette: dedent`
      - Filmic color grade (Kodak Gold / Portra-inspired): warm highlights, rich midtones, and gently muted saturation
      - Preserve natural food color (realistic, not neon) with deep, soft blacks and smooth highlight rolloff
      - Slight warmth overall; avoid clinical/cool whites
    `,
    atmosphere: `Photorealistic 35mm film food photography: deep, moody, cozy, and extremely realistic — like a real restaurant/cabin table scene shot on film.`,
    camera: dedent`
      - Natural film grain texture (subtle, consistent)
      - Soft vignette at edges (lens-like, not heavy)
      - Gentle halation/bloom on specular highlights (very subtle, realistic)
      - Warm tone curve with filmic contrast (deep shadows but not crushed)
      - Professional analog-lens rendering with realistic bokeh and micro-contrast
    `
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
    lighting: dedent`
      **Lighting**: Natural golden hour sunlight
      - Soft, warm light with honey-golden tones
      - Gentle shadows creating cozy atmosphere
      - Window light quality from afternoon sun
      - Nostalgic, warm illumination
    `,
    background: dedent`
      - Warm cream with subtle vignetting at edges
        * 1970s cookbook aesthetic with nostalgic charm
        * Cozy grandma's kitchen atmosphere
    `,
    surface: dedent`
      - Light wood with honey tones and visible grain, OR vintage tablecloth with subtle texture, OR worn butcher block with character
    `,
    colorPalette: dedent`
      - Kodak Gold film color palette: warm oranges, muted greens, creamy yellows
      - Slightly faded colors like old photographs from the 1970s
      - Warm, nostalgic tones throughout
    `,
    atmosphere: `Vintage 35mm film photography aesthetic - shot on Kodak Gold 200. Nostalgic, warm, homey atmosphere like old cookbooks from the 1970s.`,
    camera: dedent`
      - Natural film grain texture throughout
      - Soft vignetting at edges
      - Warm tone curve with characteristic film lens rendering
      - Gentle bokeh with analog lens quality
    `
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
    lighting: dedent`
      **Lighting**: Futuristic multi-colored LED lighting
      - Dramatic neon lights in electric cyan, hot magenta, and deep purple
      - Colored backlighting creating bold rim lights on food
      - High contrast with glowing neon accents
      - Sci-fi atmosphere with dramatic colored shadows
    `,
    background: dedent`
      - Dark background (near black) with glowing neon strips or holographic elements
        * Blade Runner meets molecular gastronomy aesthetic
        * Add subtle digital/holographic UI elements or neon signs
    `,
    surface: dedent`
      - Glossy black acrylic surface with visible neon reflections and subtle imperfections, OR metallic chrome surface with colored light streaks and realistic reflections, OR dark glass with textured cyberpunk neon glow
    `,
    colorPalette: dedent`
      - Electric, vivid colors: neon cyan, hot magenta, acid green, electric purple
      - Deep blacks contrasting with vibrant neons
      - Futuristic, high-tech color palette
    `,
    atmosphere: `Cyberpunk neon aesthetic - futuristic restaurant from 2077. High-tech molecular gastronomy meets dramatic neon lighting and sci-fi vibes.`,
    camera: dedent`
      - High contrast with chromatic aberration on edges
      - Dramatic lens flares from neon lights with realistic bloom
      - Sharp focus with natural depth of field
      - Slight digital grain for cinematic quality
      - Professional sci-fi cinematography rendering
    `
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
    lighting: dedent`
      **Lighting**: Bright, even lighting with decorative flair
      - Well-lit scene showing all details and patterns
      - Warm ambient light bringing out rich jewel tones
      - No dramatic shadows - everything visible and ornate
      - Grand, luxurious illumination
    `,
    background: dedent`
      - Bold floral wallpaper OR rich jewel-tone damask patterns
        * English tea room meets maximalist Instagram aesthetic
        * Layer decorative elements: add fresh flowers, vintage decorations
    `,
    surface: dedent`
      - Ornate vintage plates with gold trim and visible wear, layered over patterned tablecloth with tactile fabric texture
      - Decorative elements with character: antique lace doilies with detailed weave, vintage silverware with patina, scattered fresh flowers
      - More is more - bold patterns and rich textures with depth
    `,
    colorPalette: dedent`
      - Rich jewel tones: emerald green, sapphire blue, ruby red, gold accents everywhere
      - Saturated, vibrant colors with ornate patterns
      - Eclectic grandmillennial aesthetic with bold choices
    `,
    atmosphere: `Hyper-maximalist grandmillennial aesthetic - more is more! Ornate, bold, eclectic with layers of patterns and decorative vintage elements. English tea room meets maximalist Instagram.`,
    camera: dedent`
      - Saturated, vibrant colors with natural richness
      - Everything in sharp focus with professional lens clarity to show all details
      - Subtle lens vignetting to draw eye to center
      - Natural color grading preserving ornate textures
      - Rich, bold rendering showing patterns and textures with depth
    `
  },

  'verkada-air': {
    id: 'verkada-air',
    name: 'Verkada Air',
    displayName: 'Verkada Air (Floating)',
    emoji: '🌬️',
    description: 'Airy floating food cutouts on a clean pastel gradient tech-hero background (no plates, no table)',

    // Floating-collage layout flag — prompt builder uses this to switch composition
    layout: 'floating-collage',

    // Same Verkada plates as other styles, but flying through air
    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — flying, tilted dynamically',
      'salad': 'Large Flat White Plate (12-inch) — flying, tilted at angle',
      'main': 'Large Flat White Plate (12-inch) — flying, tilted dynamically',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth) — flying, tilted at angle',
      'sandwich': 'Large Flat White Plate (12-inch) — flying, tilted dynamically',
      'pizza': 'Large Flat White Plate (12-inch) — flying, tilted at angle',
      'dessert': 'Large Flat White Plate (12-inch) — flying, tilted dynamically',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — flying, tilted at angle',
    },
    materialDescription: 'Classic Verkada ceramic plates in blue and white finishes, flying through air WITH the food. Each dish tilted at dynamic angles as if caught mid-flight.',

    lighting: dedent`
      **Lighting**: Bright, clean, high-key studio lighting
      - Even illumination with soft shadows (subtle ambient occlusion under each flying item)
      - Gentle rim lighting to separate items from gradient background
      - Crisp, modern "product photography" clarity (no moody/filmic darkness)
      - Subtle specular highlights on food surfaces for appetizing sheen
    `,
    background: dedent`
      - Rich, saturated gradient background: deep violet/purple (#7B68EE) transitioning to bright cyan/teal (#00CED1)
        * Vibrant, not washed out or pastel — strong color saturation
        * PURE, FLAT, SMOOTH gradient from purple to cyan
        * Simple seamless color transition — nothing else
        * NO patterns, NO rays, NO glows, NO sparkles, NO stars, NO particles
        * NO horizon line, NO surface edge
        * Clean negative space in top-left for text overlay
    `,
    surface: dedent`
      - NO surface, NO table, NO horizon line. Pure continuous gradient background.
      - Items float freely in 3D space with nothing beneath them.
    `,
    colorPalette: dedent`
      - Rich, saturated purple-to-cyan gradient (NOT pale/washed out)
      - Deep violet (#7B68EE), electric purple, bright cyan (#00CED1), teal accents
      - Food stays natural and vibrant with appetizing colors
      - Clean whites and smooth tones; avoid warm "rustic" casts
    `,
    atmosphere: `Dynamic SaaS hero-banner aesthetic: PLATED dishes scattered in RADIAL pattern — spreading outward from center. Food flies ON Verkada blue/white plates. Background is a FLAT, SMOOTH purple-cyan gradient with NO effects. Modern, playful, dynamic — like a premium food delivery app hero image.`,
    camera: dedent`
      - Sharp, high-resolution product photography look (no film grain)
      - DRAMATIC depth layering: large dishes in foreground, smaller dishes in background
      - **RADIAL SCATTER PATTERN**: Dishes scattered outward from center
      - All plated dishes SPREAD OUTWARD from an invisible center point
      - Each dish tilted OUTWARD — left dishes tilt left, right dishes tilt right
      - Food stays INTACT on plates — NO loose debris, just clean flying dishes
      - **BACKGROUND IS FLAT GRADIENT ONLY**: 
        * Just a FLAT, SMOOTH purple-to-cyan gradient
        * NO patterns, NO rays, NO glows, NO effects of any kind
      - Subtle drop shadows under flying plates for grounding
    `
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


