// ============================================================================
// MENU TRANSLATION PROMPT - Translate menu text while preserving layout
// ============================================================================

import { TRANSLATION_LANGUAGES } from '../prompts.js';
import { dedent, joinSections } from '../../lib/utils.js';

function buildReferenceGlossarySection(parsedMenuData) {
  const items = parsedMenuData?.selectedItems;
  if (!Array.isArray(items) || items.length === 0) return '';

  const entries = items
    .filter(item => item?.translatedName)
    .map(item => `- "${item.name}" → "${item.translatedName}"${item.translatedDescription ? ` (${item.translatedDescription})` : ''}`)
    .join('\n');

  if (!entries) return '';

  return dedent`
    ## REFERENCE GLOSSARY (USE THESE TRANSLATIONS)
    The following translations have been pre-computed. **USE THESE EXACT TRANSLATIONS** when you encounter these dish names:

    ${entries}

    - For dishes in this glossary, use the provided translation exactly (do not modify)
    - For other menu text not in the glossary, translate following the rules below
  `;
}

/**
 * Build a prompt to translate the menu text in an image while preserving layout.
 * Output should be a clean, text-focused menu image (no food), suitable for later compositing.
 *
 * Optionally accepts parsed menu data to provide a reference glossary of translations,
 * reducing hallucinations and ensuring consistency with the parse stage.
 *
 * @param {string} translationLanguage - Translation language ID (e.g., 'fr', 'es', 'none')
 * @param {Object|null} parsedMenuData - Optional parsed menu data with translated fields for reference glossary
 * @returns {string} Translation prompt
 */
export function buildMenuTranslationPrompt(translationLanguage = 'none', parsedMenuData = null) {
  const translationConfig = TRANSLATION_LANGUAGES[translationLanguage] || TRANSLATION_LANGUAGES['none'];
  const isTranslationEnabled = translationConfig.code !== null;

  if (!isTranslationEnabled) {
    // Should not be called when translation is disabled, but keep it safe.
    return dedent`
      You are a menu layout editor. Return the SAME menu text and layout as the input image.

      Rules:
      - Preserve layout/typography/spacing as closely as possible
      - No new content, no hallucinations
      - Output is a clean menu image suitable for compositing
    `;
  }

  const glossarySection = buildReferenceGlossarySection(parsedMenuData);

  return joinSections([
    dedent`
      You are a professional menu translator AND layout/typesetting expert.
    `,
    dedent`
      ## GOAL
      Translate ALL visible menu text into **${translationConfig.name}** (language code: ${translationConfig.code}) while preserving the original menu's layout.
    `,
    glossarySection,
    dedent`
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
    `,
    dedent`
      ## LAYOUT PRESERVATION (CRITICAL)
      - Preserve the original spatial structure: columns, section blocks, alignment, margins, and whitespace
      - Preserve hierarchy: headers bigger/bolder, descriptions smaller, prices distinct
      - Preserve reading order and grouping
      - If the original uses center alignment / left alignment, keep it the same
      - Keep line breaks similar unless required by translation length
    `,
    dedent`
      ## TRANSLATION RULES
      - Fully translate the meaning (no transliteration)
      - Translate: dish names, descriptions, prices labels (keep numeric prices), section headers, and any menu labels
      - Do NOT invent dishes or descriptions not present in the original
      - If text is unclear/unreadable, keep it as-is (do NOT hallucinate)
    `,
    dedent`
      ## TYPOGRAPHY (BEST EFFORT)
      - Match the style (modern/elegant/casual) by description, not by font name
      - Keep character spacing and line height consistent
    `,
    dedent`
      ## OUTPUT
      Return ONLY the translated menu image with preserved layout, suitable for later background removal and overlay.
    `,
  ]);
}


