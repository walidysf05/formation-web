// perishable-product.js

import { Product } from "./product.js";

/**
 * A product with an expiration date (yogurt, bread...).
 * It IS a Product, with one extra rule: an expired product is not available.
 */
export class PerishableProduct extends Product {
  /** @type {Date} */
  #expirationDate;

  /**
   * @param {string} name
   * @param {number} price - Price in cents: integer >= 0.
   * @param {number} stock - Quantity in stock: integer >= 0.
   * @param {Date} expirationDate - Moment when the product expires.
   * @throws {Error} If one argument is invalid.
   */
  constructor(name, price, stock, expirationDate) {
    super(name, price, stock); // Product validates name, price and stock
    if (
      !(expirationDate instanceof Date) ||
      Number.isNaN(expirationDate.getTime())
    ) {
      throw new Error("expirationDate must be a valid Date");
    }
    this.#expirationDate = new Date(expirationDate); // our own copy
  }

  /** @type {Date} A copy: a Date is mutable, so we never give the real one. */
  get expirationDate() {
    return new Date(this.#expirationDate);
  }

  /**
   * @param {Date} [now=new Date()] - Passing a date makes testing easy.
   * @returns {boolean} `true` if the expiration date is passed.
   */
  isExpired(now = new Date()) {
    return now > this.#expirationDate;
  }

  /** Same as Product, but an expired product is never available.
   * @param {number} [quantity=1]
   * @returns {boolean}
   */
  isAvailable(quantity = 1) {
    return !this.isExpired() && super.isAvailable(quantity);
  }
}
