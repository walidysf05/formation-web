// validation.js - checks shared by Product and Cart

/**
 * Checks that a value is a strictly positive integer.
 * `Number.isInteger` already returns `false` for strings, `NaN`,
 * `Infinity`, `undefined`, etc.
 *
 * @param {*} value - The value to check.
 * @param {string} label - The parameter name, used in the error message.
 * @throws {Error} If `value` is not an integer > 0.
 * @returns {void}
 */
export function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a whole number > 0`);
  }
}
