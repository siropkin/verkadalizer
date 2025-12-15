// ============================================================================
// PROGRESS UI MAPPING - Client-side UI configuration for progress steps
// ============================================================================
// This module maps progress steps (from ai/providers/progress-steps.js) to
// UI-ready data like text and progress percentages.
// This is pure presentation logic that lives on the client side.

import { PROGRESS_STEPS } from '../ai/providers/progress-steps.js';

// Re-export for convenience
export { PROGRESS_STEPS };

/**
 * Step metadata including progress percentage and UI text
 */
export const STEP_CONFIG = {
  [PROGRESS_STEPS.STARTING]: {
    progress: 5,
    statusText: 'Starting menu analysis...',
    detailText: '',
  },

  // Menu parsing phase
  [PROGRESS_STEPS.PARSING_MENU_START]: {
    progress: 5,
    statusText: 'Analyzing menu...',
    detailText: '',
  },
  [PROGRESS_STEPS.FETCHING_MENU_IMAGE]: {
    progress: 10,
    statusText: 'Loading menu image...',
    detailText: '',
  },
  [PROGRESS_STEPS.PREPARING_AI_ANALYSIS]: {
    progress: 15,
    statusText: 'Preparing AI analysis...',
    detailText: '',
  },
  [PROGRESS_STEPS.READING_MENU_WITH_AI]: {
    progress: 20,
    statusText: 'Reading menu with AI...',
    timeEstimate: '20-30 seconds',
    detailText: '',
  },
  [PROGRESS_STEPS.PROCESSING_AI_RESPONSE]: {
    progress: 40,
    statusText: 'Processing AI response...',
    detailText: '',
  },
  [PROGRESS_STEPS.EXTRACTING_DISHES]: {
    progress: 45,
    statusText: 'Extracting dishes...',
    detailText: '',
  },
  [PROGRESS_STEPS.MENU_ANALYZED]: {
    progress: 50,
    statusText: 'Menu analyzed!',
    detailText: '',
  },

  // Image generation phase
  [PROGRESS_STEPS.BUILDING_PROMPT]: {
    progress: 52,
    statusText: 'Building visualization prompt...',
    detailText: '',
  },
  [PROGRESS_STEPS.PREPARING_IMAGE_GENERATION]: {
    progress: 55,
    statusText: 'Preparing for image generation...',
    detailText: '',
  },
  [PROGRESS_STEPS.GENERATING_IMAGE]: {
    progress: 60,
    statusText: 'Generating visualization...',
    timeEstimate: '60-90 seconds',
    detailText: '',
  },
  [PROGRESS_STEPS.FINALIZING_IMAGE]: {
    progress: 85,
    statusText: 'Finalizing image...',
    detailText: '',
  },
  [PROGRESS_STEPS.IMAGE_GENERATED]: {
    progress: 88,
    statusText: 'Image generated!',
    detailText: '',
  },

  // Merge phase
  [PROGRESS_STEPS.MERGING_IMAGES]: {
    progress: 90,
    statusText: 'Merging images...',
    detailText: '',
  },

  // Completion
  [PROGRESS_STEPS.COMPLETE]: {
    progress: 100,
    statusText: 'Complete!',
    detailText: '',
  },
};

// Cache for generated detail text per step (so dynamic messages don't change on every poll)
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

  // Combine status text with time estimate if present
  let statusText = config.statusText;
  if (config.timeEstimate) {
    statusText = `${config.statusText} (${config.timeEstimate})`;
  }

  return {
    progress: config.progress,
    statusText: statusText,
    detailText: detailText,
  };
}
