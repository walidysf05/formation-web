// polymorphism.test.js - the Cart works with every kind of product.

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";
import { Cart } from "./cart.js";
import { PerishableProduct } from "./perishable-product.js";
import { DigitalProduct } from "./digital-product.js";

const past = new Date("2005-05-05");
const future = new Date("2077-07-07");

test("the Cart accepts a PerishableProduct", () => {
  const cart = new Cart();
  cart.add(new PerishableProduct("Yogurt", 120, 5, future), 2);
  assertEqual(cart.itemCount, 2);
  assertEqual(cart.total, 240);
});

test("the Cart refuses an expired PerishableProduct", () => {
  const cart = new Cart();
  assertThrows(() => cart.add(new PerishableProduct("Yogurt", 120, 5, past)));
  assertEqual(cart.itemCount, 0);
});

test("the Cart accepts any quantity of a DigitalProduct", () => {
  const cart = new Cart();
  cart.add(new DigitalProduct("E-book", 999, 4.5), 1000);
  assertEqual(cart.itemCount, 1000);
});

test("the Cart adds up a DigitalProduct added twice", () => {
  const cart = new Cart();
  const book = new DigitalProduct("E-book", 999, 4.5);
  cart.add(book, 500);
  cart.add(book, 500);
  assertEqual(cart.lines.length, 1);
  assertEqual(cart.itemCount, 1000);
});

test("the Cart mixes the three kinds of product", () => {
  const cart = new Cart();
  cart.add(new Product("Keyboard", 2990, 5), 1);
  cart.add(new PerishableProduct("Yogurt", 120, 5, future), 2);
  cart.add(new DigitalProduct("E-book", 999, 4.5), 1);
  assertEqual(cart.total, 2990 + 240 + 999);
});


