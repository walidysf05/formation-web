// product.js

import { formatEuro } from "./money.js";
import { assertPositiveInteger } from "./validation.js";

/**
 * A product for sale. The price (in cents) and the stock are private:
 * they are read through getters, and the stock can only be changed with
 * {@link Product#removeFromStock}.
 */
export class Product {
  /** @type {string} */
  #name;
  /** @type {number} Price in cents. */
  #price;
  /** @type {number} */
  #stock;

  /**
   * @param {string} name - Product name (non-empty string, surrounding spaces are trimmed).
   * @param {number} price - Price in cents: integer >= 0.
   * @param {number} [stock=0] - Quantity in stock: integer >= 0.
   * @throws {Error} If the name, the price or the stock is invalid.
   */
  constructor(name, price, stock = 0) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("name must be a non-empty string");
    }
    if (!Number.isInteger(price) || price < 0) {
      throw new Error("price must be a whole number of cents >= 0");
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error("stock must be a whole number >= 0");
    }
    this.#name = name.trim();
    this.#price = price;
    this.#stock = stock;
  }

  /** @type {string} Product name (read-only). */
  get name() {
    return this.#name;
  }

  /** @type {number} Price in cents (read-only). */
  get price() {
    return this.#price;
  }

  /** @type {number} Quantity currently in stock (read-only). */
  get stock() {
    return this.#stock;
  }

  /**
   * Tells whether the stock is enough for a given quantity.
   *
   * @param {number} [quantity=1] - Wanted quantity.
   * @returns {boolean} `true` if `stock >= quantity`.
   */
  isAvailable(quantity = 1) {
    return this.#stock >= quantity;
  }

  /**
   * Removes a quantity from the stock.
   *
   * @param {number} quantity - Quantity to remove: integer > 0.
   * @throws {Error} If the quantity is invalid or the stock is too low
   *   (in that case the stock is left unchanged).
   * @returns {void}
   */
  removeFromStock(quantity) {
    assertPositiveInteger(quantity, "quantity");
    if (!this.isAvailable(quantity)) {
      throw new Error(`not enough stock for "${this.#name}"`);
    }
    this.#stock -= quantity;
  }

  /**
   * @example new Product("Keyboard", 2990).toString() // "Keyboard : 29,90 €"
   * @returns {string} The name and the formatted price.
   */
  toString() {
    return `${this.#name} : ${formatEuro(this.#price)}`;
  }
}
