// ============================================================================
// AI PROVIDER PROGRESS STEPS - Step identifiers for AI processing pipeline
// ============================================================================
// This module defines the canonical set of progress steps that AI providers
// emit during processing. These are business logic constants that would be
// returned by a backend API in a future architecture.

/**
 * Progress step identifiers for the image processing pipeline
 * These represent the actual stages of AI processing and should be
 * considered the "API contract" between the AI service and client.
 */
export const PROGRESS_STEPS = {
  // Initial steps
  STARTING: 'STARTING',

  // Menu parsing phase (Stage 1)
  PARSING_MENU_START: 'PARSING_MENU_START',
  FETCHING_MENU_IMAGE: 'FETCHING_MENU_IMAGE',
  PREPARING_AI_ANALYSIS: 'PREPARING_AI_ANALYSIS',
  READING_MENU_WITH_AI: 'READING_MENU_WITH_AI',
  PROCESSING_AI_RESPONSE: 'PROCESSING_AI_RESPONSE',
  EXTRACTING_DISHES: 'EXTRACTING_DISHES',
  MENU_ANALYZED: 'MENU_ANALYZED',

  // Image generation phase (Stage 2)
  BUILDING_PROMPT: 'BUILDING_PROMPT',
  PREPARING_IMAGE_GENERATION: 'PREPARING_IMAGE_GENERATION',
  GENERATING_IMAGE: 'GENERATING_IMAGE',
  FINALIZING_IMAGE: 'FINALIZING_IMAGE',
  IMAGE_GENERATED: 'IMAGE_GENERATED',

  // Merge phase
  MERGING_IMAGES: 'MERGING_IMAGES',

  // Completion
  COMPLETE: 'COMPLETE',
};
