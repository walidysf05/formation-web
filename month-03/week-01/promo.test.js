// promo.test.js

import { test, assertEqual, assertThrows } from "./tests.js";
import { PromoCode } from "./promo.js";

test("exposes the code and the percentage through getters", () => {
  const promo = new PromoCode("SOLDES20", 20);
  assertEqual(promo.code, "SOLDES20");
  assertEqual(promo.percent, 20);
});

test("trims the code", () => {
  assertEqual(new PromoCode("  SOLDES20  ", 20).code, "SOLDES20");
});

test("rejects an empty code or a code that is not a string", () => {
  assertThrows(() => new PromoCode("   ", 10));
  assertThrows(() => new PromoCode(42, 10));
  assertThrows(() => new PromoCode(undefined, 10));
});

test("accepts the limits 1 % and 100 %", () => {
  assertEqual(new PromoCode("MIN", 1).percent, 1);
  assertEqual(new PromoCode("MAX", 100).percent, 100);
});

test("rejects a percentage outside 1..100", () => {
  assertThrows(() => new PromoCode("A", 0));
  assertThrows(() => new PromoCode("A", -5));
  assertThrows(() => new PromoCode("A", 101));
});

test("rejects a percentage that is not a whole number", () => {
  assertThrows(() => new PromoCode("A", 10.5));
  assertThrows(() => new PromoCode("A", "10"));
  assertThrows(() => new PromoCode("A", NaN));
  assertThrows(() => new PromoCode("A", undefined));
});

test("code and percent are read-only from outside", () => {
  const promo = new PromoCode("SOLDES20", 20);
  assertThrows(() => { promo.code = "X"; });
  assertThrows(() => { promo.percent = 99; });
});

test("apply() takes the percentage off the total", () => {
  assertEqual(new PromoCode("A", 10).apply(2990), 2691);
  assertEqual(new PromoCode("A", 20).apply(2990), 2392);
});

test("apply() rounds to the nearest cent", () => {
  assertEqual(new PromoCode("A", 10).apply(1999), 1799); // 1799.1 => 1799
  assertEqual(new PromoCode("A", 50).apply(5), 3);       // 2.5 => 3
});

test("apply() with 100 % gives 0, and a total of 0 stays 0", () => {
  assertEqual(new PromoCode("A", 100).apply(2990), 0);
  assertEqual(new PromoCode("A", 20).apply(0), 0);
});

test("apply() rejects a total that is negative, decimal or not a number", () => {
  const promo = new PromoCode("A", 10);
  assertThrows(() => promo.apply(-1));
  assertThrows(() => promo.apply(29.9));
  assertThrows(() => promo.apply("2990"));
  assertThrows(() => promo.apply(NaN));
});

// PromoCode.fromText

test("fromText() finds a valid code", () => {
  const promo = PromoCode.fromText("BIENVENUE10");
  assertEqual(promo.code, "BIENVENUE10");
  assertEqual(promo.percent, 10);
});

test("fromText() finds the other valid code", () => {
  assertEqual(PromoCode.fromText("SOLDES20").percent, 20);
});

test("fromText() ignores the case", () => {
  assertEqual(PromoCode.fromText("bienvenue10").code, "BIENVENUE10");
  assertEqual(PromoCode.fromText("SoLdEs20").percent, 20);
});

test("fromText() ignores the spaces", () => {
  assertEqual(PromoCode.fromText("  soldes20  ").code, "SOLDES20");
  assertEqual(PromoCode.fromText("soldes 20").code, "SOLDES20");
});

test("fromText() returns a PromoCode that can be applied", () => {
  const promo = PromoCode.fromText("soldes20");
  assertEqual(promo instanceof PromoCode, true);
  assertEqual(promo.apply(2990), 2392);
});

test("fromText() throws for an unknown code", () => {
  assertThrows(() => PromoCode.fromText("NOPE50"));
  assertThrows(() => PromoCode.fromText("SOLDES2"));
});

test("fromText() throws for an empty text", () => {
  assertThrows(() => PromoCode.fromText(""));
  assertThrows(() => PromoCode.fromText("   "));
});

test("fromText() throws if the text is not a string", () => {
  assertThrows(() => PromoCode.fromText(undefined));
  assertThrows(() => PromoCode.fromText(null));
  assertThrows(() => PromoCode.fromText(20));
});

test("fromText() is static: it belongs to the class, not to an instance", () => {
  const promo = new PromoCode("A", 10);
  assertEqual(promo.fromText, undefined);
  assertEqual(typeof PromoCode.fromText, "function");
});
