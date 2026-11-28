// cart.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";
import { Cart } from "./cart.js";
import { PromoCode } from "./promo.js";
import { DigitalProduct } from "./digital-product.js";

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

test("add() rejects an object without isAvailable()", () => {
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

// promo code: applyCode() and totalToPay

const makeCartOf7530 = () => {
  const cart = new Cart();
  cart.add(makeKeyboard(), 2); // 5980
  cart.add(makeMouse(), 1);    // 1550
  return cart;                 // total = 7530
};

test("totalToPay equals total when there is no promo code", () => {
  const cart = makeCartOf7530();
  assertEqual(cart.totalToPay, 7530);
});

test("applyCode() lowers totalToPay: 10 % of 7530 = 6777", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  assertEqual(cart.totalToPay, 6777);
});

test("applyCode() does not change total (the price before discount)", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  assertEqual(cart.total, 7530);
});

test("a second code replaces the first one (no stacking)", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  cart.applyCode(new PromoCode("B", 20));
  assertEqual(cart.totalToPay, 6024); // 20 % of 7530, not 10 % then 20 %
});

test("applying the same code twice does not stack either", () => {
  const cart = makeCartOf7530();
  const promo = new PromoCode("A", 10);
  cart.applyCode(promo);
  cart.applyCode(promo);
  assertEqual(cart.totalToPay, 6777);
});

test("totalToPay follows the cart: add() and remove() after applyCode()", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard();
  cart.applyCode(new PromoCode("A", 10));
  cart.add(keyboard, 2);
  assertEqual(cart.totalToPay, 5382); // 10 % of 5980
  cart.remove(keyboard);
  assertEqual(cart.totalToPay, 0);
});

test("a code with PromoCode.fromText() works in the cart", () => {
  const cart = makeCartOf7530();
  cart.applyCode(PromoCode.fromText(" soldes20 "));
  assertEqual(cart.totalToPay, 6024);
});

test("100 % makes the cart free", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("FREE", 100));
  assertEqual(cart.totalToPay, 0);
});

test("applyCode() rejects something that is not a PromoCode", () => {
  const cart = makeCartOf7530();
  assertThrows(() => cart.applyCode("SOLDES20"));
  assertThrows(() => cart.applyCode(undefined));
  assertThrows(() => cart.applyCode({ percent: 10, apply: () => 0 }));
});

test("a refused applyCode() keeps the previous code", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  assertThrows(() => cart.applyCode("nope"));
  assertEqual(cart.totalToPay, 6777);
});

// clear() and the promo code 

test("clear() also removes the promo code", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  cart.clear();
  cart.add(makeKeyboard(), 1);
  assertEqual(cart.totalToPay, 2990); // no discount any more
});

// checkout()

test("checkout() removes the quantities from the stocks", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(5);
  const mouse = makeMouse(5);
  cart.add(keyboard, 2);
  cart.add(mouse, 1);
  cart.checkout();
  assertEqual(keyboard.stock, 3);
  assertEqual(mouse.stock, 4);
});

test("checkout() can take the last items of the stock", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(2);
  cart.add(keyboard, 2);
  cart.checkout();
  assertEqual(keyboard.stock, 0);
});

test("checkout() returns the amount paid", () => {
  const cart = makeCartOf7530();
  assertEqual(cart.checkout(), 7530);
});

test("checkout() returns the amount after the promo code", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  assertEqual(cart.checkout(), 6777);
});

test("checkout() empties the cart", () => {
  const cart = makeCartOf7530();
  cart.checkout();
  assertEqual(cart.lines.length, 0);
  assertEqual(cart.itemCount, 0);
  assertEqual(cart.total, 0);
});

test("checkout() forgets the promo code", () => {
  const cart = makeCartOf7530();
  cart.applyCode(new PromoCode("A", 10));
  cart.checkout();
  cart.add(makeKeyboard(), 1);
  assertEqual(cart.totalToPay, 2990);
});

test("checkout() throws if a product is no longer available", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(5);
  cart.add(keyboard, 3);
  keyboard.removeFromStock(4); // someone else bought it: 1 left
  assertThrows(() => cart.checkout());
});

test("a refused checkout() changes nothing: cart, promo code and stocks", () => {
  const cart = new Cart();
  const keyboard = makeKeyboard(5);
  const mouse = makeMouse(3);
  cart.add(keyboard, 2); // this line is fine...
  cart.add(mouse, 3);    // ...this one will fail
  cart.applyCode(new PromoCode("A", 10));
  mouse.removeFromStock(1); // someone else bought one: 2 left, 3 wanted

  assertThrows(() => cart.checkout());

  assertEqual(keyboard.stock, 5); // NOT lowered, even if its line was fine
  assertEqual(mouse.stock, 2);
  assertEqual(cart.lines.length, 2);
  assertEqual(cart.itemCount, 5);
  assertEqual(cart.totalToPay, 9567); // 10 % off 10630
});

test("checkout() of an empty cart does nothing and returns 0", () => {
  assertEqual(new Cart().checkout(), 0);
});

test("checkout() works with a DigitalProduct (the stock stays unlimited)", () => {
  const cart = new Cart();
  const book = new DigitalProduct("E-book", 999, 4.5);
  cart.add(book, 3);
  assertEqual(cart.checkout(), 2997);
  assertEqual(book.stock, Infinity);
  assertEqual(cart.itemCount, 0);
});
