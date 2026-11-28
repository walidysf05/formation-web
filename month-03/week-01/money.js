// money.js - prices are stored in CENTS (integers); we only format for display.

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/**
 * Formats an amount in cents as a euro price.
 * @example formatEuro(2990) // "29,90 €" (the space before "€" is a non-breaking space)
 *
 * @param {number} cents - The amount in cents (integer).
 * @returns {string} The formatted amount (fr-FR locale).
 */
export function formatEuro(cents) {
  return euro.format(cents / 100);
}
