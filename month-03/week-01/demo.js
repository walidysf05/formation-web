// demo.js - fills the demo page

import { Product } from "./product.js";
import { Cart } from "./cart.js";
import { formatEuro } from "./money.js";

const keyboard = new Product("Keyboard", 2990, 5);
const mouse = new Product("Mouse", 1550, 12);

const cart = new Cart();
cart.add(keyboard, 3);
cart.add(mouse, 2);

const list = document.querySelector("#cart-lines");
for (const { product, quantity } of cart.lines) {
  const li = document.createElement("li");
  li.textContent = `${quantity} × ${product}`;
  list.append(li);
}

document.querySelector("#cart-total").textContent =
  `${cart.itemCount} items => total: ${formatEuro(cart.total)}`;
