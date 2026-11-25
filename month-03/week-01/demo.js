// demo.js - fills the demo page

import { Product } from "./product.js";
import { PerishableProduct } from "./perishable-product.js";
import { DigitalProduct } from "./digital-product.js";
import { Cart } from "./cart.js";
import { formatEuro } from "./money.js";

const keyboard = new Product("Keyboard", 2990, 5);
const mouse = new Product("Mouse", 1550, 12);
const yogurt = new PerishableProduct("Yogurt", 120, 10, new Date("2077-07-07"));
const ebook = new DigitalProduct("E-book", 999, 4.5);

const cart = new Cart();
cart.add(keyboard, 3);
cart.add(mouse, 2);
cart.add(yogurt, 4);
cart.add(ebook); 

const list = document.querySelector("#cart-lines");
for (const { product, quantity } of cart.lines) {
  const li = document.createElement("li");
  li.textContent = `${quantity} × ${product}`;
  list.append(li);
}

document.querySelector("#cart-total").textContent =
  `${cart.itemCount} items => total: ${formatEuro(cart.total)}`;
