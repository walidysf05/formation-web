// cart.js

import { assertPositiveInteger } from "./validation.js";
import { PromoCode } from "./promo.js";

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

  /** @type {PromoCode | null} The promo code is use (only one at a time). */
  #promoCode = null;

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
   * Empties the cart: the lines AND the promo code.
   * @returns {void}
   */
  clear() {
    this.#lines = [];
    this.#promoCode = null;
  }

  /**
   * Buys everything in the cart: removes the quantities from the stocks,
   * empties the cart and returns the amount paid.
   * All or nothing: if one product is no longer available, an error is thrown
   * and NOTHING changes (neither the cart, nor the promo code, nor the stocks).
   *
   * @throws {Error} If a product is no longer available in the wanted quantity.
   * @returns {number} The amount paid in cents (after the promo code).
   */
  checkout() {
    // 1. Check everything first: nothing is changed in this loop.
    for (const { product, quantity } of this.#lines) {
      if (!product.isAvailable(quantity)) {
        throw new Error(`"${product.name}" is no longer available`);
      }
    }

    // 2. Everything is fine: now we can change things.
    const paid = this.totalToPay; // before clear(), which forgets the promo code
    for (const { product, quantity } of this.#lines) {
      product.removeFromStock(quantity);
    }
    this.clear();
    return paid;
  }

  /**
   * Uses a promo code. Only one code at a time: a new code replaces the old one.
   *
   * @param {PromoCode} promoCode - The promo code to use.
   * @throws {Error} If `promoCode` is not a `PromoCode` (the old code is kept).
   * @returns {void}
   */
  applyCode(promoCode) {
    if (!(promoCode instanceof PromoCode)) {
      throw new Error("promoCode must be a PromoCode");
    }
    this.#promoCode = promoCode;
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
   * @type {number} Amount to pay in cents: the total after the promo code
   *  (the same as `total` if there is no code).
   */
  get totalToPay() {
    return this.#promoCode ? this.#promoCode.apply(this.total) : this.total;
  }

  /**
   * The cart lines. This is a copy: changing it does not change the cart.
   * @type {CartLine[]}
   */
  get lines() {
    return this.#lines.map((line) => ({ ...line }));
  }
}
