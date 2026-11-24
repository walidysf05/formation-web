// product.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";

test("floats are not exact: 0.1 + 0.2 !== 0.3", () => {
  assertEqual(0.1 + 0.2 === 0.3, false);
});

test("exposes name, price (cents) and stock through getters", () => {
  const product = new Product("Keyboard", 2990, 5);
  assertEqual(product.name, "Keyboard");
  assertEqual(product.price, 2990);
  assertEqual(product.stock, 5);
});

test("stock defaults to 0", () => {
  assertEqual(new Product("Mouse", 1500).stock, 0);
});

test("price and stock are read-only from outside", () => {
  const product = new Product("Keyboard", 2990, 5);
  assertThrows(() => { product.price = 1; });  // modules are strict: no setter -> error
  assertThrows(() => { product.stock = 99; });
});

test("rejects an empty name", () => {
  assertThrows(() => new Product("  ", 100));
});

test("rejects a negative price", () => {
  assertThrows(() => new Product("A", -1));
});

test("rejects a decimal price", () => {
  assertThrows(() => new Product("A", 29.9));
});

test("rejects a price that is not a number", () => {
  assertThrows(() => new Product("A", "2990"));
  assertThrows(() => new Product("A", NaN));
  assertThrows(() => new Product("A", undefined));
});

test("accepts a price of 0", () => {
  assertEqual(new Product("Freebie", 0, 1).price, 0);
});

test("rejects a negative stock", () => {
  assertThrows(() => new Product("A", 100, -1));
});

test("isAvailable() checks one item by default", () => {
  assertEqual(new Product("A", 100, 1).isAvailable(), true);
  assertEqual(new Product("A", 100, 0).isAvailable(), false);
});

test("isAvailable(quantity) compares with the stock", () => {
  const product = new Product("A", 100, 3);
  assertEqual(product.isAvailable(3), true);
  assertEqual(product.isAvailable(4), false);
});

test("removeFromStock() lowers the stock", () => {
  const product = new Product("A", 100, 5);
  product.removeFromStock(2);
  assertEqual(product.stock, 3);
});

test("removeFromStock() can empty the stock exactly", () => {
  const product = new Product("A", 100, 2);
  product.removeFromStock(2);
  assertEqual(product.stock, 0);
});

test("removeFromStock() throws if the stock is too low (and changes nothing)", () => {
  const product = new Product("A", 100, 2);
  assertThrows(() => product.removeFromStock(3));
  assertEqual(product.stock, 2);
});

test("removeFromStock() rejects 0, negative or decimal quantities", () => {
  const product = new Product("A", 100, 5);
  assertThrows(() => product.removeFromStock(0));
  assertThrows(() => product.removeFromStock(-1));
  assertThrows(() => product.removeFromStock(1.5));
  assertEqual(product.stock, 5);
});

// The space before "€" is a non-breaking space, so we only check "29,90".
test("toString shows the name and the price", () => {
  const text = new Product("Keyboard", 2990, 5).toString();
  assertEqual(text.startsWith("Keyboard : "), true);
  assertEqual(text.includes("29,90"), true);
});

test("rejects a name that is not a string", () => {
  assertThrows(() => new Product(42, 100));
  assertThrows(() => new Product(undefined, 100));
});

test("trims the name", () => {
  assertEqual(new Product("  Mouse  ", 100).name, "Mouse");
});

test("rejects a decimal or non-number stock", () => {
  assertThrows(() => new Product("A", 100, 1.5));
  assertThrows(() => new Product("A", 100, "3"));
  assertThrows(() => new Product("A", 100, NaN));
});

test("removeFromStock() rejects a quantity that is not a number", () => {
  const product = new Product("A", 100, 5);
  assertThrows(() => product.removeFromStock("2"));
  assertThrows(() => product.removeFromStock(NaN));
  assertEqual(product.stock, 5);
});
