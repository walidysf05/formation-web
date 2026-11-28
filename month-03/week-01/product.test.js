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

// Product.fromObject

test("fromObject() creates a Product from an object", () => {
  const product = Product.fromObject({ name: "Keyboard", price: 2990, stock: 5 });
  assertEqual(product instanceof Product, true);
  assertEqual(product.name, "Keyboard");
  assertEqual(product.price, 2990);
  assertEqual(product.stock, 5);
});

test("fromObject() uses a stock of 0 when the stock is missing", () => {
  assertEqual(Product.fromObject({ name: "Mouse", price: 1550 }).stock, 0);
});

test("fromObject() ignores the other properties", () => {
  const product = Product.fromObject({ name: "Mouse", price: 1550, color: "red" });
  assertEqual(product.color, undefined);
  assertEqual(product.name, "Mouse");
});

test("fromObject() has the same checks as the constructor", () => {
  assertThrows(() => Product.fromObject({ name: "", price: 100 }));
  assertThrows(() => Product.fromObject({ name: "A", price: -1 }));
  assertThrows(() => Product.fromObject({ name: "A", price: 29.9 }));
  assertThrows(() => Product.fromObject({ name: "A", price: "2990" }));
  assertThrows(() => Product.fromObject({ name: "A", price: 100, stock: -1 }));
  assertThrows(() => Product.fromObject({ name: "A", price: 100, stock: null }));
});

test("fromObject() throws if a property is missing", () => {
  assertThrows(() => Product.fromObject({}));
  assertThrows(() => Product.fromObject({ name: "A" }));
  assertThrows(() => Product.fromObject({ price: 100 }));
});

test("fromObject() throws if it does not receive an object", () => {
  assertThrows(() => Product.fromObject());
  assertThrows(() => Product.fromObject(null));
  assertThrows(() => Product.fromObject("Keyboard"));
  assertThrows(() => Product.fromObject(42));
});

test("fromObject() trims the name like the constructor", () => {
  assertEqual(Product.fromObject({ name: "  Mouse  ", price: 100 }).name, "Mouse");
});

test("fromObject() is static: it belongs to the class, not to an instance", () => {
  const product = new Product("A", 100);
  assertEqual(product.fromObject, undefined);
  assertEqual(typeof Product.fromObject, "function");
});

test("a Product made by fromObject works in a Cart-like use", () => {
  const product = Product.fromObject({ name: "A", price: 100, stock: 3 });
  assertEqual(product.isAvailable(3), true);
  product.removeFromStock(2);
  assertEqual(product.stock, 1);
});

test("isAvailable() rejects a quantity that is not a whole number > 0", () => {
  const product = new Product("A", 100, 5);
  assertThrows(() => product.isAvailable(0));
  assertThrows(() => product.isAvailable(-1));
  assertThrows(() => product.isAvailable(1.5));
  assertThrows(() => product.isAvailable("2"));
  assertThrows(() => product.isAvailable(NaN));
});