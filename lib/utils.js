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

// ============================================================================
// PROMPT TEXT HELPERS - Make large template strings readable
// ============================================================================

/**
 * Template tag that removes common indentation from multi-line template literals.
 * Lets you write prompts starting on a new line while keeping the source code indented.
 *
 * Example:
 *   return dedent`
 *     Line 1
 *       Line 2
 *   `;
 */
export function dedent(strings, ...values) {
  // Build the raw string with interpolations.
  //
  // Important: if an interpolated value is multi-line, we re-indent its subsequent lines
  // to match the indentation of where it is inserted. This keeps overall block indentation
  // stable and prevents interpolations from affecting the dedent calculation (e.g. headings
  // ending up with leading spaces).
  let raw = '';
  for (let i = 0; i < strings.length; i++) {
    raw += strings[i];
    if (i < values.length) {
      const indent = (raw.match(/(?:^|\n)([ \t]*)[^\n]*$/)?.[1]) ?? '';
      const v = String(values[i]).replace(/\r\n/g, '\n');
      raw += v.includes('\n') ? v.replace(/\n/g, `\n${indent}`) : v;
    }
  }

  // Normalize newlines
  raw = raw.replace(/\r\n/g, '\n');

  // Drop a single leading newline for nicer `dedent`\n... formatting
  if (raw.startsWith('\n')) raw = raw.slice(1);

  // Compute minimum indentation across non-empty lines.
  // Important: interpolated values may contain multi-line strings that start at column 0.
  // If we include those in the min-indent calculation, the minimum becomes 0 and we fail
  // to strip indentation from the rest of the template (making headings look tab-indented).
  //
  // So we compute minIndent from lines that actually have indentation (>0), and then
  // only strip that amount from lines that have at least that indentation.
  const lines = raw.split('\n');
  let minIndent = Infinity;
  for (const line of lines) {
    if (!line.trim()) continue;
    const indent = line.match(/^[ \t]*/)?.[0]?.length ?? 0;
    if (indent > 0) minIndent = Math.min(minIndent, indent);
  }

  if (minIndent === Infinity || minIndent === 0) {
    return raw.trimEnd();
  }

  const out = lines
    .map((line) => {
      if (!line.trim()) return line;
      const indent = line.match(/^[ \t]*/)?.[0]?.length ?? 0;
      return indent >= minIndent ? line.slice(minIndent) : line;
    })
    .join('\n');

  return out.trimEnd();
}

/**
 * Join prompt "sections" with a blank line between them, skipping empty sections.
 */
export function joinSections(sections) {
  return sections.filter(Boolean).join('\n\n').trim();
}

