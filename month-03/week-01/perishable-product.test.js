// perishable-product.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { Product } from "./product.js";
import { PerishableProduct } from "./perishable-product.js";

const past = new Date("2005-05-05");
const future = new Date("2077-07-07");

test("a PerishableProduct is a Product", () => {
  assertEqual(
    new PerishableProduct("Yogurt", 120, 5, future) instanceof Product,
    true,
  );
});

test("PerishableProduct keeps the Product features", () => {
  const yogurt = new PerishableProduct("Yogurt", 120, 5, future);
  assertEqual(yogurt.name, "Yogurt");
  assertEqual(yogurt.price, 120);
  assertEqual(yogurt.stock, 5);
});

test("PerishableProduct rejects an invalid expiration date", () => {
  assertThrows(() => new PerishableProduct("Yogurt", 120, 5, "2027-07-07"));
  assertThrows(() => new PerishableProduct("Yogurt", 120, 5, new Date("nope")));
  assertThrows(() => new PerishableProduct("Yogurt", 120, 5));
});

test("PerishableProduct still validates the Product fields", () => {
  assertThrows(() => new PerishableProduct("", 120, 5, future));
  assertThrows(() => new PerishableProduct("Yogurt", -1, 5, future));
});

test("isExpired() compares the expiration date with now", () => {
  assertEqual(new PerishableProduct("Y", 100, 1, past).isExpired(), true);
  assertEqual(new PerishableProduct("Y", 100, 1, future).isExpired(), false);
});

test("isExpired(now) accepts a given date", () => {
  const yogurt = new PerishableProduct("Y", 100, 1, new Date("2030-06-01"));
  assertEqual(yogurt.isExpired(new Date("2030-05-31")), false);
  assertEqual(yogurt.isExpired(new Date("2030-06-02")), true);
});

test("a fresh product is available as usual", () => {
  const yogurt = new PerishableProduct("Y", 100, 3, future);
  assertEqual(yogurt.isAvailable(), true);
  assertEqual(yogurt.isAvailable(3), true);
  assertEqual(yogurt.isAvailable(4), false);
});

test("an expired product is never available, even with stock", () => {
  const yogurt = new PerishableProduct("Y", 100, 10, past);
  assertEqual(yogurt.isAvailable(), false);
  assertEqual(yogurt.isAvailable(1), false);
});

test("an expired product cannot be removed from the stock", () => {
  const yogurt = new PerishableProduct("Y", 100, 10, past);
  assertThrows(() => yogurt.removeFromStock(1));
  assertEqual(yogurt.stock, 10);
});

test("expirationDate returns a copy: changing it changes nothing", () => {
  const yogurt = new PerishableProduct("Y", 100, 1, future);
  yogurt.expirationDate.setFullYear(2000);
  assertEqual(yogurt.isExpired(), false);
});

test("the original Date given to the constructor is copied", () => {
  const date = new Date("2077-07-07");
  const yogurt = new PerishableProduct("Y", 100, 1, date);
  date.setFullYear(2000);
  assertEqual(yogurt.isExpired(), false);
});
