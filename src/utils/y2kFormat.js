/**
 * Y2K Old-School Macro Formatting Utilities
 *
 * formatY2KMacro(value, label, opts)
 *   → "PROTEIN: 148.0g"   (label uppercase, colon, .0 decimal, unit)
 *   → "CALORIES: 2,150.0" (comma-separated thousands)
 *
 * formatY2KNumber(value, decimals)
 *   → "2,150.0"
 *
 * isY2KActive()
 *   → true/false (checks DOM for data-ui-mode)
 */

const UI_MODE_KEY = 'macrovault_ui_mode';

export function isY2KActive() {
  if (typeof document === 'undefined') return false;
  return (
    document.documentElement.getAttribute('data-ui-mode') === 'y2k' ||
    localStorage.getItem(UI_MODE_KEY) === 'y2k'
  );
}

/**
 * Format a number in Y2K style: comma thousands + forced decimals.
 * @param {number|string|null} value
 * @param {number} decimals — decimal places (default 1 → ".0")
 * @returns {string}
 */
export function formatY2KNumber(value, decimals = 1) {
  if (value == null || value === '' || isNaN(Number(value))) return '—';
  const num = Number(value);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a macro value with Y2K styling.
 * @param {number|string|null} value — the numeric value
 * @param {string} label — e.g. "Protein", "Calories"
 * @param {object} opts
 * @param {string} opts.unit — suffix like "g", "kcal" (default "")
 * @param {number} opts.decimals — decimal places (default 1)
 * @param {boolean} opts.labelOnly — return only "PROTEIN:" without value
 * @returns {string}
 */
export function formatY2KMacro(value, label, { unit = '', decimals = 1, labelOnly = false } = {}) {
  const upperLabel = (label || '').toUpperCase();
  if (labelOnly) return `${upperLabel}:`;

  const formatted = formatY2KNumber(value, decimals);
  return `${upperLabel}: ${formatted}${unit}`;
}

/**
 * Conditionally format — returns Y2K format if active, otherwise original.
 * @param {number|string|null} value
 * @param {string} label
 * @param {object} opts — same as formatY2KMacro
 * @param {string|function} fallback — what to return when Y2K is off. If function, called with (value).
 * @returns {string}
 */
export function autoFormatMacro(value, label, opts = {}, fallback) {
  if (!isY2KActive()) {
    if (typeof fallback === 'function') return fallback(value);
    if (fallback != null) return fallback;
    // Default: just return the value as-is
    return value != null ? String(value) : '—';
  }
  return formatY2KMacro(value, label, opts);
}
