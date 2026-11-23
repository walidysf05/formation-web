// product.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";

test("floats are not exact: 0.1 + 0.2 !== 0.3", () => {
  assertEqual(0.1 + 0.2 === 0.3, false);
});

test("stores name, price (cents) and stock", () => {
  const product = new Product("Keyboard", 2990, 5);
  assertEqual(product.name, "Keyboard");
  assertEqual(product.price, 2990);
  assertEqual(product.stock, 5);
});

test("stock defaults to 0", () => {
  assertEqual(new Product("Mouse", 1500).stock, 0);
});

test("rejects an empty name", () => {
  assertThrows(() => new Product("  ", 100));
});

test("rejects a missing or non-string name with a clear message", () => {
  for (const bad of [undefined, null, 42]) {
    let message = "";
    try {
      new Product(bad, 100);
    } catch (error) {
      message = error.message;
    }
    assertEqual(message, "name is required");
  }
});

test("accepts a price of 0", () => {
  assertEqual(new Product("Free sample", 0).price, 0);
});

test("rejects a decimal stock", () => {
  assertThrows(() => new Product("A", 100, 1.5));
});

test("rejects a negative or decimal price", () => {
  assertThrows(() => new Product("A", -1));
  assertThrows(() => new Product("A", 29.9));
});

test("rejects a negative stock", () => {
  assertThrows(() => new Product("A", 100, -1));
});

// The space before "€" is a non-breaking space, so we only check "29,90".
test("toString shows the name and the price", () => {
  const text = new Product("Keyboard", 2990, 5).toString();
  assertEqual(text.startsWith("Keyboard : "), true);
  assertEqual(text.includes("29,90"), true);
});
