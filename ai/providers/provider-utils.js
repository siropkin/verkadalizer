// ============================================================================
// PROVIDER UTILS - Shared helpers for AI providers
// ============================================================================

/**
 * Extracts the JSON payload from a model response.
 * Supports fenced markdown blocks (```json ... ```) and raw JSON.
 *
 * @param {string} text
 * @returns {string}
 */
export function extractJsonString(text) {
  if (typeof text !== 'string') {
    return '';
  }

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : text;
  return jsonString.trim();
}

/**
 * Parses a model response as JSON, handling fenced markdown blocks.
 *
 * @param {string} text
 * @returns {any}
 */
export function parseJsonFromModelText(text) {
  const jsonString = extractJsonString(text);
  return JSON.parse(jsonString);
}

/**
 * Best-effort extraction of an error message from a failed fetch Response.
 *
 * @param {Response} response
 * @returns {Promise<string>}
 */
export async function readErrorMessage(response) {
  const fallback = response?.statusText || 'Request failed';

  try {
    const errorData = await response.json();
    return (
      errorData?.error?.message ||
      errorData?.error?.status ||
      errorData?.message ||
      fallback
    );
  } catch (_) {
    try {
      const text = await response.text();
      return text || fallback;
    } catch (_) {
      return fallback;
    }
  }
}
