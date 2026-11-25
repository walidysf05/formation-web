// digital-product.js

import { Product } from "./product.js";
import { assertPositiveInteger } from "./validation.js";

/**
 * A digital product (e-book...): copies never run out, so the stock is unlimited.
 */
export class DigitalProduct extends Product {
  /** @type {number} */
  #sizeMb;

  /**
   * @param {string} name
   * @param {number} price - Price in cents: integer >= 0.
   * @param {number} sizeMb - File size in MB: number > 0.
   * @throws {Error} If one argument is invalid.
   */
  constructor(name, price, sizeMb) {
    super(name, price, 0); // the parent stock is never used
    if (!Number.isFinite(sizeMb) || sizeMb <= 0) {
      throw new Error("sizeMb must be a number > 0");
    }
    this.#sizeMb = sizeMb;
  }

  /** @type {number} File size in MB (read-only). */
  get sizeMb() {
    return this.#sizeMb;
  }

  /** @type {number} Unlimited stock. */
  get stock() {
    return Infinity;
  }

  /** @returns {boolean} Always `true`: there is always a copy left. */
  isAvailable() {
    return true;
  }

  /**
   * Nothing to remove (unlimited stock), but the quantity is still validated.
   * @param {number} quantity - Integer > 0.
   * @throws {Error} If the quantity is invalid.
   * @returns {void}
   */
  removeFromStock(quantity) {
    assertPositiveInteger(quantity, "quantity");
  }
}
