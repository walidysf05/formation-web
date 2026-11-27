// demo.js - fills the demo page

import { Product } from "./product.js";
import { PerishableProduct } from "./perishable-product.js";
import { DigitalProduct } from "./digital-product.js";
import { Cart } from "./cart.js";
import { formatEuro } from "./money.js";
import { PromoCode } from "./promo.js";

const list = document.querySelector("#cart-lines");
const total = document.querySelector("#cart-total");

try {
  // 4 products: 2 normal, 1 perishable, 1 digital 
const keyboard = new Product("Keyboard", 2990, 5);
const mouse = new Product("Mouse", 1550, 12);
const yogurt = new PerishableProduct("Yogurt", 120, 10, new Date("2077-07-07"));
const ebook = new DigitalProduct("E-book", 999, 4.5);

// Fill the cart
const cart = new Cart();
cart.add(keyboard, 1);
cart.add(mouse, 2);
cart.add(yogurt, 4);
cart.add(ebook);

// Apply a promo code (capital letters and spaces do not matter)
const promo = PromoCode.fromText("soldes20")
cart.applyCode(promo)

// Show the result: one <li> per line, then the promo code
for (const { product, quantity } of cart.lines) {
  const li = document.createElement("li");
  li.textContent = `${quantity} × ${product}`;
  list.append(li);
}

const promoLine = document.createElement("li");
promoLine.textContent = `Promo code ${promo.code}: -${promo.percent} %`;
list.append(promoLine);

total.textContent = 
  `${cart.itemCount} items => to pay: ${formatEuro(cart.totalToPay)}` +
  `(instead of ${formatEuro(cart.total)})`;
} catch (error) {
  total.textContent = `Error: ${error.message}`;
}  