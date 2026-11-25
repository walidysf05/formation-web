// cart.js

import { assertPositiveInteger } from "./validation.js";

/** @typedef {import("./product.js").Product} Product */

/**
 * One line of the cart.
 * @typedef {Object} CartLine
 * @property {Product} product - The product.
 * @property {number} quantity - The quantity (integer > 0).
 */

/**
 * A shopping cart. Lines are private; `lines` returns a copy.
 * Adding to the cart does not lower the product's stock.
 */
export class Cart {
  /** @type {CartLine[]} */
  #lines = [];

  /**
   * Finds the line of a product (compared by object reference).
   * @param {Product} product
   * @returns {CartLine | undefined}
   */
  #findLine(product) {
    return this.#lines.find((line) => line.product === product);
  }

  /**
   * Adds a product to the cart. If it is already there, the quantities add up.
   * The stock check includes what is already in the cart.
   *
   * @param {Product} product - The product to add.
   * @param {number} [quantity=1] - Quantity: integer > 0.
   * @throws {Error} If the quantity is invalid or the product is not available
   *   (the cart is left unchanged).
   * @returns {void}
   */
  add(product, quantity = 1) {
    assertPositiveInteger(quantity, "quantity");

    const line = this.#findLine(product);
    const alreadyInCart = line ? line.quantity : 0;

    if (!product.isAvailable(alreadyInCart + quantity)) {
      throw new Error(`not enough stock for "${product.name}"`);
    }

    if (line) {
      line.quantity += quantity;
    } else {
      this.#lines.push({ product, quantity });
    }
  }

  /**
   * Deletes the whole line of a product.
   * Does nothing if the product is not in the cart.
   *
   * @param {Product} product - The product to remove.
   * @returns {void}
   */
  remove(product) {
    this.#lines = this.#lines.filter((line) => line.product !== product);
  }

  /**
   * Empties the cart.
   * @returns {void}
   */
  clear() {
    this.#lines = [];
  }

  /** @type {number} Total number of items (sum of the quantities). */
  get itemCount() {
    return this.#lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  /** @type {number} Cart total in cents. */
  get total() {
    return this.#lines.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );
  }

  /**
   * The cart lines. This is a copy: changing it does not change the cart.
   * @type {CartLine[]}
   */
  get lines() {
    return this.#lines.map((line) => ({ ...line }));
  }
}
