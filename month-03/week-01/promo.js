// promo.js

/**
 * A promo code: a code and a percentage of discount.
 * Both are private and read through getters.
 */
export class PromoCode {
  /** @type {string} */
  #code;
  /** @type {number} */
  #percent;

  /**
   * The valid codes (in capital letters, without spaces) and their percentage.
   *  `static` = it belongs to the class itself, not to one promo code.
   * @type {Map<string, number>}
   */
  static #VALID_CODES = new Map([
    ["BIENVENUE10", 10],
    ["SOLDES20", 20],
  ]);

  /**
   * @param {string} code - Non-empty string (surrounding spaces are trimmed).
   * @param {number} percent - Discount in percent: integer from 1 to 100.
   * @throws {Error} If the code or the percentage is invalid.
   */
  constructor(code, percent) {
    if (typeof code !== "string" || code.trim() === "") {
      throw new Error("code must be a non-empty string");
    }
    if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
      throw new Error("percent must be a whole number from 1 to 100");
    }
    this.#code = code.trim();
    this.#percent = percent;
  }

  /** @type {string} The code (read-only). */
  get code() {
    return this.#code;
  }

  /** @type {number} The discount in percent (read-only). */
  get percent() {
    return this.#percent;
  }

  /**
   * Applies the discount to a total.
   * @example new PromoCode("SOLDES20", 20).apply(2990) // 2392
   *
   * @param {number} totalInCents - The total before discount: integer >= 0.
   * @throws {Error} If the total is not an integer >= 0.
   * @returns {number} The total after discount, in cents (rounded).
   */
  apply(totalInCents) {
    if (!Number.isInteger(totalInCents) || totalInCents < 0) {
      throw new Error("total must be a whole number of cents >= 0");
    }
    return Math.round((totalInCents * (100 - this.#percent)) / 100);
  }

  /**
   * Creates a PromoCode from a text typed by a user.
   * Capital letters and spaces do not matter: " soldes 20 " is "SOLDES20".
   * @example PromoCode.fromText("bienvenue10").percent =>  10
   *
   * @param {string} text - The text to look for in the list of valid codes.
   * @throws {Error} If the text is not a string or is not a known code.
   * @returns {PromoCode}
   */
  static fromText(text) {
    if (typeof text !== "string") {
      throw new Error("text must be a string");
    }
    const code = text.replace(/\s+/g, "").toUpperCase();
    const percent = PromoCode.#VALID_CODES.get(code);
    if (percent === undefined) {
      throw new Error(`unknown promo code "${text.trim()}"`);
    }
    return new PromoCode(code, percent);
  }
}
