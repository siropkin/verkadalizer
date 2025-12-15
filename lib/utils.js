// ============================================================================
// UTILITIES - Helper functions and utilities
// ============================================================================

/**
 * Validate that a setting value exists
 * @throws {Error} if value is undefined, null, or empty string
 */
export function assertSetting(value, message) {
  if (value === undefined || value === null || value === '') throw new Error(message);
}

/**
 * Throw an AbortError if the signal has been aborted
 * @throws {DOMException} AbortError if signal is aborted
 */
export function throwIfAborted(signal) {
  if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

