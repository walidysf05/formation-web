
import { Product } from "./product.js";

const products = [
  new Product("Keyboard", 2990, 5),
  new Product("Mouse", 1550, 12),
  new Product("27-inch monitor", 189900, 0),
];

const list = document.querySelector("#product-list");
for (const product of products) {
  const li = document.createElement("li");
  li.textContent = `${product} (stock: ${product.stock})`;
  list.append(li);
}

console.log(0.1 + 0.2, "floating point");
console.log(String(products[0]));
