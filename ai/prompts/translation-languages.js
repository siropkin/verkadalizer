// ============================================================================
// TRANSLATION LANGUAGES - Menu translation options
// ============================================================================

import { dedent } from '../../lib/utils.js';

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
    description: dedent`Keep original menu text - overlay on AI background`,
  },
  'en_US': {
    id: 'en_US',
    name: 'English (US)',
    emoji: '🇺🇸',
    code: 'en_US',
    description: dedent`Translate menu to US English`
  },
  'fr': {
    id: 'fr',
    name: 'French',
    emoji: '🇫🇷',
    code: 'fr',
    description: dedent`Translate menu to French`
  },
  'es': {
    id: 'es',
    name: 'Spanish',
    emoji: '🇪🇸',
    code: 'es',
    description: dedent`Translate menu to Spanish`
  },
  'ja': {
    id: 'ja',
    name: 'Japanese',
    emoji: '🇯🇵',
    code: 'ja',
    description: dedent`Translate menu to Japanese`
  },
  'ko-KR': {
    id: 'ko-KR',
    name: 'Korean',
    emoji: '🇰🇷',
    code: 'ko_KR',
    description: dedent`Translate menu to Korean`
  },
  'pt': {
    id: 'pt',
    name: 'Portuguese',
    emoji: '🇵🇹',
    code: 'pt',
    description: dedent`Translate menu to Portuguese`
  },
  'ru': {
    id: 'ru',
    name: 'Russian',
    emoji: '🇷🇺',
    code: 'ru',
    description: dedent`Translate menu to Russian`
  },
  'zh': {
    id: 'zh',
    name: 'Chinese',
    emoji: '🇨🇳',
    code: 'zh',
    description: dedent`Translate menu to Simplified Chinese`
  },
  'de': {
    id: 'de',
    name: 'German',
    emoji: '🇩🇪',
    code: 'de',
    description: dedent`Translate menu to German`
  },
  'nl': {
    id: 'nl',
    name: 'Dutch',
    emoji: '🇳🇱',
    code: 'nl',
    description: dedent`Translate menu to Dutch`
  },
  'da-DK': {
    id: 'da-DK',
    name: 'Danish',
    emoji: '🇩🇰',
    code: 'da_DK',
    description: dedent`Translate menu to Danish`
  },
};


