// ============================================================================
// PROGRESS UI MAPPING - Client-side UI configuration for progress steps
// ============================================================================
// This module maps progress steps (from ai/providers/progress-steps.js) to
// UI-ready data like text, progress percentages, and fun facts.
// This is pure presentation logic that lives on the client side.

import { PROGRESS_STEPS } from '../ai/providers/progress-steps.js';

// Re-export for convenience
export { PROGRESS_STEPS };

/**
 * Food facts for entertainment during processing
 */
const FOOD_FACTS = [
  'Honey never spoils - archaeologists found 3000-year-old honey in Egyptian tombs that was still edible! 🍯',
  'Carrots were originally purple - orange carrots were developed in the Netherlands in the 17th century 🥕',
  'Apples float because they are 25% air 🍎',
  'Pistachios can spontaneously combust when stored in large quantities 🔥',
  'Chocolate was once used as currency by the Aztecs 🍫',
  'Peanuts aren\'t actually nuts - they\'re legumes! 🥜',
  'A strawberry is not a berry, but a banana is 🍓🍌',
  'Tomatoes have more genes than humans 🍅',
  'White chocolate isn\'t actually chocolate 🤍',
  'Avocados are berries, but strawberries aren\'t 🥑',
  'The most expensive pizza in the world costs $12,000 💰',
  'Ranch dressing is most popular in the United States but virtually unknown elsewhere 🇺🇸',
  'Nutmeg is a hallucinogen in large quantities ⚠️',
  'Ketchup was sold as medicine in the 1830s 💊',
  'The popsicle was invented by an 11-year-old 🧊',
];

function getRandomFoodFact() {
  return FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)];
}

/**
 * Step metadata including progress percentage and UI text
 */
export const STEP_CONFIG = {
  [PROGRESS_STEPS.STARTING]: {
    progress: 5,
    statusText: 'Starting menu analysis...',
    detailText: () => getRandomFoodFact(),
  },

  // Menu parsing phase
  [PROGRESS_STEPS.PARSING_MENU_START]: {
    progress: 5,
    statusText: 'Analyzing menu...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.FETCHING_MENU_IMAGE]: {
    progress: 10,
    statusText: 'Loading menu image...',
    detailText: 'Fetching high-resolution image',
  },
  [PROGRESS_STEPS.PREPARING_AI_ANALYSIS]: {
    progress: 15,
    statusText: 'Preparing AI analysis...',
    detailText: (extra) => `Analyzing for ${extra?.preferenceName || 'dietary'} preferences`,
  },
  [PROGRESS_STEPS.READING_MENU_WITH_AI]: {
    progress: 20,
    statusText: 'Reading menu with AI...',
    detailText: () => 'This takes 20-30 seconds. ' + getRandomFoodFact(),
  },
  [PROGRESS_STEPS.PROCESSING_AI_RESPONSE]: {
    progress: 40,
    statusText: 'Processing AI response...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.EXTRACTING_DISHES]: {
    progress: 45,
    statusText: 'Extracting dishes...',
    detailText: 'Identifying the best menu items',
  },
  [PROGRESS_STEPS.MENU_ANALYZED]: {
    progress: 50,
    statusText: 'Menu analyzed!',
    detailText: (extra) => {
      if (extra?.selectedDishes) {
        const maxDisplayItems = 3;
        const dishes = extra.selectedDishes.slice(0, maxDisplayItems);
        const remaining = extra.selectedDishes.length - maxDisplayItems;
        return remaining > 0
          ? `Selected: ${dishes.join(', ')}, and ${remaining} more`
          : `Selected: ${dishes.join(', ')}`;
      }
      return 'Dishes selected successfully';
    },
  },

  // Image generation phase
  [PROGRESS_STEPS.BUILDING_PROMPT]: {
    progress: 52,
    statusText: 'Building visualization prompt...',
    detailText: 'Creating detailed food photography instructions',
  },
  [PROGRESS_STEPS.PREPARING_IMAGE_GENERATION]: {
    progress: 55,
    statusText: 'Preparing for image generation...',
    detailText: () => getRandomFoodFact(),
  },
  [PROGRESS_STEPS.GENERATING_IMAGE]: {
    progress: 60,
    statusText: 'Generating food visualization...',
    detailText: () => 'This takes 60-90 seconds. ' + getRandomFoodFact(),
  },
  [PROGRESS_STEPS.FINALIZING_IMAGE]: {
    progress: 85,
    statusText: 'Finalizing image...',
    detailText: 'Processing AI-generated visualization',
  },
  [PROGRESS_STEPS.IMAGE_GENERATED]: {
    progress: 88,
    statusText: 'Image generated!',
    detailText: 'Preparing to merge with menu text',
  },

  // Merge phase
  [PROGRESS_STEPS.MERGING_IMAGES]: {
    progress: 90,
    statusText: 'Merging images...',
    detailText: 'Creating final visualization',
  },

  // Completion
  [PROGRESS_STEPS.COMPLETE]: {
    progress: 100,
    statusText: 'Complete!',
    detailText: 'Your menu is ready',
  },
};

// Cache for generated detail text per step (so food facts don't change on every poll)
const stepDetailCache = {};

/**
 * Convert a progress step to UI-ready data
 * @param {string} step - Progress step identifier
 * @param {Object} extra - Optional extra data for dynamic content
 * @returns {Object} { progress, statusText, detailText }
 */
export function stepToProgressData(step, extra = {}) {
  const config = STEP_CONFIG[step];

  if (!config) {
    console.warn(`Unknown progress step: ${step}`);
    return {
      progress: 0,
      statusText: 'Processing...',
      detailText: '',
    };
  }

  // Generate detail text only once per step (cache it)
  let detailText;
  if (typeof config.detailText === 'function') {
    // Create a cache key that includes extra data for dynamic messages
    const cacheKey = step + JSON.stringify(extra);
    if (!stepDetailCache[cacheKey]) {
      stepDetailCache[cacheKey] = config.detailText(extra);
    }
    detailText = stepDetailCache[cacheKey];
  } else {
    detailText = config.detailText;
  }

  return {
    progress: config.progress,
    statusText: config.statusText,
    detailText: detailText,
  };
}
