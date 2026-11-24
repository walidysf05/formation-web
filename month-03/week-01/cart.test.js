// cart.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";
import { Cart } from "./cart.js";

const makeKeyboard = (stock = 5) => new Product("Keyboard", 2990, stock);
const makeMouse = (stock = 5) => new Product("Mouse", 1550, stock);

test("a new cart is empty", () => {
  const cart = new Cart();
  assertEqual(cart.itemCount, 0);
  assertEqual(cart.total, 0);
  assertEqual(cart.lines.length, 0);
});

test("add() puts a product in the cart (quantity 1 by default)", () => {
  const cart = new Cart();
  cart.add(makeKeyboard());
  assertEqual(cart.lines.length, 1);
  assertEqual(cart.itemCount, 1);
});

test("add() with a quantity", () => {
  const cart = new Cart();
  cart.add(makeKeyboard(), 3);
  assertEqual(cart.itemCount, 3);
});

test("adding the same product twice adds up on one line", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard();
  cart.add(keyboard, 2);
  cart.add(keyboard, 1);
  assertEqual(cart.lines.length, 1);
  assertEqual(cart.itemCount, 3);
});

test("add() rejects 0, negative, decimal or non-number quantities", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard();
  assertThrows(() => cart.add(keyboard, 0));
  assertThrows(() => cart.add(keyboard, -1));
  assertThrows(() => cart.add(keyboard, 1.5));
  assertThrows(() => cart.add(keyboard, "2"));
  assertEqual(cart.itemCount, 0);
});

test("add() rejects something that is not a Product", () => {
  assertThrows(() => new Cart().add({ name: "Fake", price: 1 }));
});

test("add() refuses when the stock is too low", () => {
  const cart = new Cart();
  assertThrows(() => cart.add(makeKeyboard(2), 3));
  assertEqual(cart.itemCount, 0);
});

test("add() accepts exactly the available stock", () => {
  const cart = new Cart();
  cart.add(makeKeyboard(2), 2);
  assertEqual(cart.itemCount, 2);
});

test("add() counts what is already in the cart for the stock check", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(3);
  cart.add(keyboard, 2);
  assertThrows(() => cart.add(keyboard, 2)); // 2 + 2 > 3
  assertEqual(cart.itemCount, 2);
});

test("add() refuses an out-of-stock product", () => {
  assertThrows(() => new Cart().add(makeKeyboard(0)));
});

test("remove() deletes the whole line of a product", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard();
  const mouse = makeMouse();
  cart.add(keyboard, 2);
  cart.add(mouse);
  cart.remove(keyboard);
  assertEqual(cart.lines.length, 1);
  assertEqual(cart.itemCount, 1);
});

test("remove() of a product not in the cart does nothing", () => {
  const cart = new Cart();
  cart.add(makeKeyboard());
  cart.remove(makeMouse());
  assertEqual(cart.itemCount, 1);
});

test("clear() empties the cart", () => {
  const cart = new Cart();
  cart.add(makeKeyboard(), 2);
  cart.add(makeMouse());
  cart.clear();
  assertEqual(cart.itemCount, 0);
  assertEqual(cart.total, 0);
});

test("total is in cents: 2 x 2990 + 1 x 1550 = 7530", () => {
  const cart = new Cart();
  cart.add(makeKeyboard(), 2);
  cart.add(makeMouse(), 1);
  assertEqual(cart.total, 7530);
});

test("itemCount sums the quantities of all lines", () => {
  const cart = new Cart();
  cart.add(makeKeyboard(), 2);
  cart.add(makeMouse(), 3);
  assertEqual(cart.itemCount, 5);
});

test("lines returns a copy: pushing to it does not change the cart", () => {
  const cart = new Cart();
  cart.add(makeKeyboard());
  const lines = cart.lines;
  lines.push({ product: makeMouse(), quantity: 9 });
  assertEqual(cart.lines.length, 1);
});

test("lines returns a copy: editing a line does not change the cart", () => {
  const cart = new Cart();
  cart.add(makeKeyboard());
  cart.lines[0].quantity = 99;
  assertEqual(cart.itemCount, 1);
});

test("lines returns a copy: emptying it does not change the cart", () => {
  const cart = new Cart();
  cart.add(makeKeyboard());
  cart.lines.length = 0;
  assertEqual(cart.lines.length, 1);
});

test("adding to the cart does not lower the product stock", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(5);
  cart.add(keyboard, 2);
  assertEqual(keyboard.stock, 5);
});

test("add() rejects NaN and null", () => {
  const cart = new Cart();
  assertThrows(() => cart.add(makeKeyboard(), NaN));
  assertThrows(() => cart.add(makeKeyboard(), null));
  assertEqual(cart.itemCount, 0);
});

test("a refused add() leaves an existing line unchanged", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(3);
  cart.add(keyboard, 2);
  assertThrows(() => cart.add(keyboard, 5));
  assertEqual(cart.lines[0].quantity, 2);
  assertEqual(cart.total, 2 * 2990);
});

test("remove() updates the total", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard();
  cart.add(keyboard, 2);
  cart.add(makeMouse());
  cart.remove(keyboard);
  assertEqual(cart.total, 1550);
});

test("two different Product objects make two different lines", () => {
  const cart = new Cart();
  cart.add(makeKeyboard());
  cart.add(makeKeyboard());
  assertEqual(cart.lines.length, 2);
});
