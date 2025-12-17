// ============================================================================
// IMAGE STYLES - Plates + visual aesthetics presets
// ============================================================================

import { dedent } from '../../lib/utils.js';

// ---------------------------------------------------------------------------
// Style ID normalization / migration
// ---------------------------------------------------------------------------

/**
 * Map deprecated / renamed style IDs to current style IDs.
 * This lets us evolve styles without breaking stored user settings or cache IDs.
 */
export const IMAGE_STYLE_ID_ALIASES = {
  // vNext: replaced with a much bolder non-table spotlight look
  'rustic-film': 'verkada-spotlight',
};

/**
 * Normalize an image style ID to a supported style ID.
 * - Applies aliases
 * - Falls back to 'verkada-classic' if unknown
 * @param {string} id
 * @returns {string}
 */
export function normalizeImageStyleId(id) {
  const maybe = (id && typeof id === 'string') ? id.trim() : '';
  const aliased = IMAGE_STYLE_ID_ALIASES[maybe] || maybe;
  return IMAGE_STYLES[aliased] ? aliased : 'verkada-classic';
}

// Unified image style configurations combining plates and visual aesthetics
export const IMAGE_STYLES = {
  'verkada-classic': {
    id: 'verkada-classic',
    name: 'Verkada Classic',
    displayName: 'Verkada Classic (Default)',
    emoji: '🍽️',
    description: 'Blue and white Verkada plates with moody, realistic film photography',

    layout: 'tabletop',
    textSafeZone: 'leftThird',

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
      - Warm cream-to-tan backdrop gradient with subtle vignette at edges
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
    cameraDirection: dedent`
      **Shot Composition (Signature)**:
      - 3/4 overhead editorial table spread (not perfectly top-down)
      - Strong depth: near dishes feel slightly larger; far dishes recede naturally
      - Keep the left third cleaner for menu text overlay (landscape-friendly)
    `,
    camera: dedent`
      - Natural film grain texture (subtle, consistent)
      - Soft vignette at edges (lens-like, not heavy)
      - Gentle halation/bloom on specular highlights (very subtle, realistic)
      - Warm tone curve with filmic contrast (deep shadows but not crushed)
      - Professional analog-lens rendering with realistic bokeh and micro-contrast
    `
  },

  'verkada-spotlight': {
    id: 'verkada-spotlight',
    name: 'Verkada Spotlight',
    displayName: 'Verkada Spotlight (Stage)',
    emoji: '🎭',
    description: 'A dramatic single-spotlight studio scene—high-contrast, clean, and unmistakable',

    layout: 'theatrical-spotlight',
    textSafeZone: 'leftThird',

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

    // Theatrical studio look (photoreal)
    lighting: dedent`
      **Lighting**: Single theatrical spotlight with controlled falloff
      - One focused key light from above-right (like a stage spotlight)
      - Deep falloff into soft darkness; crisp but realistic shadow edges
      - Minimal fill: keep shadows rich, not crushed
      - No colored gels; monochrome-ish studio mood, still appetizing
    `,
    background: dedent`
      - Seamless dark studio backdrop (near-black to charcoal gradient)
        * Smooth, clean, no patterns, no signage, no props
        * Keep the left third as a quiet dark gradient for text overlay
    `,
    surface: dedent`
      - Matte black tabletop OR dark slate with subtle texture (non-reflective, clean)
    `,
    colorPalette: dedent`
      - Neutral-to-warm highlights, cool shadows (cinematic contrast)
      - Saturation restrained but food stays appetizing and real
    `,
    atmosphere: `Photoreal cinematic stage-light food photography — dramatic, minimal, premium. One spotlight, deep falloff, pristine scene.`,
    styleNegatives: dedent`
      - NO candles, NO bokeh fairy lights, NO neon, NO signage, NO text, NO logos
      - NO extra props competing with food (keep it minimal)
    `,
    camera: dedent`
      - Subtle lens vignette and realistic bloom on highlights (very controlled)
      - Crisp micro-contrast with deep blacks (not crushed)
      - Clean studio sharpness with slight cinematic softness
    `
  },

  'verkada-cyberpunk': {
    id: 'verkada-cyberpunk',
    name: 'Verkada Cyberpunk',
    emoji: '⚡',
    description: 'Gelled neon studio lighting + glossy surfaces—sci-fi mood without any signage/text',

    layout: 'tabletop',
    textSafeZone: 'leftThird',

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
      - Dark studio cyclorama (near black) with abstract neon light bars (no letters/shapes)
        * Blade Runner mood, but purely abstract lighting
        * No UI elements, no holograms, no signs
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
    styleNegatives: dedent`
      - NO text, NO holographic UI, NO symbols, NO signage, NO billboards
      - NO letter-like shapes in highlights or reflections
    `,
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
    description: 'Maximalist patterns + florals everywhere, but the plates stay corporate Verkada blue/white',

    layout: 'tabletop',
    textSafeZone: 'topLeft',

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
        * Layer decorative elements: fresh flowers, patterned textiles, vintage decor (NO text)
    `,
    surface: dedent`
      - Patterned tablecloth with tactile fabric texture (bold, maximal)
      - Decorative elements with character: lace doilies, vintage silverware, scattered fresh flowers
      - IMPORTANT: Plates remain Verkada blue/white only (no ornate non-Verkada plates)
    `,
    colorPalette: dedent`
      - Rich jewel tones: emerald green, sapphire blue, ruby red, gold accents everywhere
      - Saturated, vibrant colors with ornate patterns
      - Eclectic grandmillennial aesthetic with bold choices
    `,
    atmosphere: `Hyper-maximalist grandmillennial aesthetic - more is more! Ornate, bold, eclectic with layers of patterns and decorative vintage elements. English tea room meets maximalist Instagram.`,
    styleNegatives: dedent`
      - NO ornate plates, NO gold-trim plates, NO plate swaps (plates must be Verkada blue/white)
      - NO readable text in wallpaper patterns or decor
    `,
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
    description: 'Floating plated dishes on a flat purple-cyan gradient hero background (no table, no horizon)',

    // Floating-collage layout flag — prompt builder uses this to switch composition
    layout: 'floating-collage',
    textSafeZone: 'topLeft',

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

  'verkada-orbit': {
    id: 'verkada-orbit',
    name: 'Verkada Orbit',
    displayName: 'Verkada Orbit (Floating Ring)',
    emoji: '🌀',
    description: 'Plated dishes floating in a controlled orbital ring—clean, dynamic, unmistakably modern',

    layout: 'floating-orbit',
    textSafeZone: 'topLeft',

    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — floating, angled in orbit',
      'salad': 'Large Flat White Plate (12-inch) — floating, angled in orbit',
      'main': 'Large Flat White Plate (12-inch) — floating, angled in orbit',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth) — floating, angled in orbit',
      'sandwich': 'Large Flat White Plate (12-inch) — floating, angled in orbit',
      'pizza': 'Large Flat White Plate (12-inch) — floating, angled in orbit',
      'dessert': 'Large Flat White Plate (12-inch) — floating, angled in orbit',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — floating, angled in orbit',
    },
    materialDescription: 'Classic Verkada ceramic plates in blue and white finishes, floating in a clean orbital arrangement (no table).',
    lighting: dedent`
      **Lighting**: Controlled studio rim lighting + soft key
      - Soft key from front-left, subtle rim from back-right to separate plates
      - Clean shadows (subtle), realistic specular on ceramics and food
      - High-end product-photography clarity
    `,
    background: dedent`
      - Smooth studio gradient background: deep indigo to teal (no patterns, no effects)
        * No horizon line, no table edge
        * Keep top-left cleaner for text overlay
    `,
    surface: dedent`
      - NO surface, NO table, NO horizon line. Pure continuous gradient background.
    `,
    colorPalette: dedent`
      - Deep indigo + teal gradient with neutral food tones
      - Crisp whites on plates; avoid warm rustic casts
    `,
    atmosphere: `Photoreal modern hero-banner: dishes float in an orbital ring with clean, premium studio lighting — dynamic but controlled.`,
    styleNegatives: dedent`
      - NO stars, NO sparkles, NO particles, NO smoke, NO holograms, NO text
      - NO motion blur; keep it sharp and premium
    `,
    camera: dedent`
      - Clean studio sharpness (no film grain)
      - Strong depth layering: foreground plates slightly larger, background plates smaller
      - Controlled bloom on highlights only (very subtle)
    `
  },

  'verkada-pedestals': {
    id: 'verkada-pedestals',
    name: 'Verkada Pedestals',
    displayName: 'Verkada Pedestals (Museum)',
    emoji: '🗿',
    description: 'Plated dishes presented on clear acrylic pedestals in a seamless studio—like a museum product shoot',

    layout: 'studio-pedestals',
    textSafeZone: 'leftThird',

    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — on a clear acrylic pedestal',
      'salad': 'Large Flat White Plate (12-inch) — on a clear acrylic pedestal',
      'main': 'Large Flat White Plate (12-inch) — on a clear acrylic pedestal',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth) — on a clear acrylic pedestal',
      'sandwich': 'Large Flat White Plate (12-inch) — on a clear acrylic pedestal',
      'pizza': 'Large Flat White Plate (12-inch) — on a clear acrylic pedestal',
      'dessert': 'Large Flat White Plate (12-inch) — on a clear acrylic pedestal',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — on a clear acrylic pedestal',
    },
    materialDescription: 'Corporate Verkada blue/white ceramic plates; dishes sit on clean, transparent acrylic pedestals (museum plinth vibe).',
    lighting: dedent`
      **Lighting**: High-end studio product lighting
      - Large softbox key light for clean highlights
      - Gentle rim light to separate plates from background
      - Realistic shadows from pedestals (soft, grounded)
    `,
    background: dedent`
      - Seamless studio cyclorama: warm-white to light-gray gradient (very clean)
        * No patterns, no props, no horizon edge
        * Keep the left third extra clean for text overlay
    `,
    surface: dedent`
      - Minimal studio floor plane implied by soft grounding shadows only (no visible table texture)
    `,
    colorPalette: dedent`
      - Neutral studio whites + clean blues from plates
      - Natural food colors; modern, premium, not rustic
    `,
    atmosphere: `Photoreal museum-grade product photography: plated dishes on acrylic pedestals, impeccably lit, minimalist and bold.`,
    styleNegatives: dedent`
      - NO table, NO wood, NO rustic props, NO signage, NO text
      - NO clutter; pedestals only
    `,
    camera: dedent`
      - Crisp, high-resolution product look (no grain)
      - Subtle falloff; controlled contrast; minimal distortion
    `
  },

  'verkada-scan': {
    id: 'verkada-scan',
    name: 'Verkada Scan',
    displayName: 'Verkada Scan (Catalog)',
    emoji: '🖨️',
    description: 'Ultra-clean orthographic “catalog scan” of plated dishes—flat, even, and instantly recognizable',

    layout: 'orthographic-scan',
    textSafeZone: 'topLeft',

    plates: {
      'soup': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — catalog scan style',
      'salad': 'Large Flat White Plate (12-inch) — catalog scan style',
      'main': 'Large Flat White Plate (12-inch) — catalog scan style',
      'pasta': 'Large Deep Blue Plate (12-inch, 2-inch depth) — catalog scan style',
      'sandwich': 'Large Flat White Plate (12-inch) — catalog scan style',
      'pizza': 'Large Flat White Plate (12-inch) — catalog scan style',
      'dessert': 'Large Flat White Plate (12-inch) — catalog scan style',
      'side': 'Medium Deep Blue Plate (9-inch, 4-inch depth) — catalog scan style',
    },
    materialDescription: 'Verkada blue/white ceramic plates photographed like a premium catalog / flat-lay scanner—no table styling, just clean presentation.',
    lighting: dedent`
      **Lighting**: Ultra-even lightbox lighting (shadow-minimized)
      - Very soft, uniform illumination from above (like a light tent)
      - Minimal shadows (soft, diffuse), no dramatic directionality
      - Color-accurate, neutral white balance
    `,
    background: dedent`
      - Clean matte off-white background (#F5F5F3) with extremely subtle vignette
        * No patterns, no texture, no props
        * Keep top-left extra clean for text overlay
    `,
    surface: dedent`
      - No table texture; just a matte seamless backdrop
    `,
    colorPalette: dedent`
      - Neutral whites + crisp plate blues
      - True-to-life food color (accurate, appetizing, not stylized)
    `,
    atmosphere: `Photoreal premium catalog flat-lay: orthographic clarity, even lighting, minimal shadows, extremely clean and modern.`,
    styleNegatives: dedent`
      - NO perspective distortion, NO dramatic shadows, NO props, NO text
      - NO rustic surfaces, NO marble veining, NO fabric textures
    `,
    camera: dedent`
      - Orthographic / top-down look (no perspective)
      - Deep focus across entire image; clinical sharpness (but still appetizing)
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
  const normalizedId = normalizeImageStyleId(imageStyleName);
  const imageStyle = IMAGE_STYLES[normalizedId] || IMAGE_STYLES['verkada-classic'];
  return imageStyle.plates[category] || imageStyle.plates['main'];
}


