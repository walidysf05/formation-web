// digital-product.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";
import { DigitalProduct } from "./digital-product.js";

test("a DigitalProduct is a Product", () => {
  assertEqual(new DigitalProduct("E-book", 999, 4.5) instanceof Product, true);
});

test("DigitalProduct exposes name, price and size", () => {
  const book = new DigitalProduct("E-book", 999, 4.5);
  assertEqual(book.name, "E-book");
  assertEqual(book.price, 999);
  assertEqual(book.sizeMb, 4.5);
});

test("DigitalProduct rejects an invalid size", () => {
  assertThrows(() => new DigitalProduct("E-book", 999, 0));
  assertThrows(() => new DigitalProduct("E-book", 999, -2));
  assertThrows(() => new DigitalProduct("E-book", 999, "4"));
  assertThrows(() => new DigitalProduct("E-book", 999, NaN));
});

test("the stock of a DigitalProduct is unlimited", () => {
  assertEqual(new DigitalProduct("E-book", 999, 4.5).stock, Infinity);
});

test("a DigitalProduct is always available, whatever the quantity", () => {
  const book = new DigitalProduct("E-book", 999, 4.5);
  assertEqual(book.isAvailable(), true);
  assertEqual(book.isAvailable(1000000), true);
});

test("removeFromStock() does not change the unlimited stock", () => {
  const book = new DigitalProduct("E-book", 999, 4.5);
  book.removeFromStock(50);
  assertEqual(book.stock, Infinity);
});

test("removeFromStock() still rejects an invalid quantity", () => {
  const book = new DigitalProduct("E-book", 999, 4.5);
  assertThrows(() => book.removeFromStock(0));
  assertThrows(() => book.removeFromStock(1.5));
  assertThrows(() => book.removeFromStock("2"));
});

test("isAvailable() still rejects an invalid quantity", () => {
  const book = new DigitalProduct("E-book", 999, 4.5);
  assertThrows(() => book.isAvailable(0));
  assertThrows(() => book.isAvailable(-1));
  assertThrows(() => book.isAvailable("2"));
});