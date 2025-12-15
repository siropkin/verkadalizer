// ============================================================================
// LOGGER - Standardized console logging with consistent prefixes
// ============================================================================
// Usage:
//   import { logInfo, logWarn, logError } from './lib/logger.js';
//   logInfo('background', 'pipeline', 'Stage 1 complete');
//   logWarn('provider', 'gemini', 'Retrying request');
//   logError('storage', 'cache', 'Failed to save', error);

/**
 * Format a log message with consistent prefix
 * @param {string} area - Top-level area (e.g., 'background', 'provider', 'lib')
 * @param {string} subsystem - Subsystem within the area (e.g., 'pipeline', 'openai', 'storage')
 * @param {string} message - Log message
 * @returns {string} Formatted log string
 */
function formatMessage(area, subsystem, message) {
  return `[VK][${area}][${subsystem}] ${message}`;
}

/**
 * Log an info message (high-level lifecycle milestones)
 * @param {string} area - Top-level area
 * @param {string} subsystem - Subsystem within the area
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments to log
 */
export function logInfo(area, subsystem, message, ...args) {
  if (args.length > 0) {
    console.log(formatMessage(area, subsystem, message), ...args);
  } else {
    console.log(formatMessage(area, subsystem, message));
  }
}

/**
 * Log a warning message (recoverable issues, fallbacks, validation trims)
 * @param {string} area - Top-level area
 * @param {string} subsystem - Subsystem within the area
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments to log
 */
export function logWarn(area, subsystem, message, ...args) {
  if (args.length > 0) {
    console.warn(formatMessage(area, subsystem, message), ...args);
  } else {
    console.warn(formatMessage(area, subsystem, message));
  }
}

/**
 * Log an error message (failures that return { success: false } or throw)
 * @param {string} area - Top-level area
 * @param {string} subsystem - Subsystem within the area
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments to log (typically the error object)
 */
export function logError(area, subsystem, message, ...args) {
  if (args.length > 0) {
    console.error(formatMessage(area, subsystem, message), ...args);
  } else {
    console.error(formatMessage(area, subsystem, message));
  }
}

