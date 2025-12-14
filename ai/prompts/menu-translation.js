// ============================================================================
// MENU TRANSLATION PROMPT - Translate menu text while preserving layout
// ============================================================================

import { TRANSLATION_LANGUAGES } from '../prompts.js';

/**
 * Build a prompt to translate the menu text in an image while preserving layout.
 * Output should be a clean, text-focused menu image (no food), suitable for later compositing.
 *
 * @param {string} translationLanguage - Translation language ID (e.g., 'fr', 'es', 'none')
 * @returns {string} Translation prompt
 */
export function buildMenuTranslationPrompt(translationLanguage = 'none') {
  const translationConfig = TRANSLATION_LANGUAGES[translationLanguage] || TRANSLATION_LANGUAGES['none'];
  const isTranslationEnabled = translationConfig.code !== null;

  if (!isTranslationEnabled) {
    // Should not be called when translation is disabled, but keep it safe.
    return `You are a menu layout editor. Return the SAME menu text and layout as the input image.

Rules:
- Preserve layout/typography/spacing as closely as possible
- No new content, no hallucinations
- Output is a clean menu image suitable for compositing`;
  }

  return `You are a professional menu translator AND layout/typesetting expert.

## GOAL
Translate ALL visible menu text into **${translationConfig.name}** (language code: ${translationConfig.code}) while preserving the original menu's layout.

## CRITICAL OUTPUT REQUIREMENTS (FOR COMPOSITING)
1. Output should be a **text-focused menu image** only:
   - NO food photography
   - NO decorative scenes
   - NO new graphics, icons, or illustrations
2. Keep the background **SOLID PURE WHITE**:
   - Flat white background (#FFFFFF)
   - NO paper texture, NO grain, NO dots/speckles, NO gradients, NO shadows
   - NO watermarking, NO artifacts, NO background patterns
3. Ensure **high-contrast, crisp, legible text** (no broken characters, no blurring).

## LAYOUT PRESERVATION (CRITICAL)
- Preserve the original spatial structure: columns, section blocks, alignment, margins, and whitespace
- Preserve hierarchy: headers bigger/bolder, descriptions smaller, prices distinct
- Preserve reading order and grouping
- If the original uses center alignment / left alignment, keep it the same
- Keep line breaks similar unless required by translation length

## TRANSLATION RULES
- Fully translate the meaning (no transliteration)
- Translate: dish names, descriptions, prices labels (keep numeric prices), section headers, and any menu labels
- Do NOT invent dishes or descriptions not present in the original
- If text is unclear/unreadable, keep it as-is (do NOT hallucinate)

## TYPOGRAPHY (BEST EFFORT)
- Match the style (modern/elegant/casual) by description, not by font name
- Keep character spacing and line height consistent

## OUTPUT
Return ONLY the translated menu image with preserved layout, suitable for later background removal and overlay.`;
}


