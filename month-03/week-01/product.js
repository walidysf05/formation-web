// product.js
// Money rule: store prices in CENTS (integers), format only for display.

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export class Product {
  constructor(name, price, stock = 0) {
    if (typeof name !== "string" || name.trim() === "")
      throw new Error("name is required");
    if (!Number.isInteger(price) || price < 0)
      throw new Error("price must be a whole number of cents");
    if (!Number.isInteger(stock) || stock < 0)
      throw new Error("stock must be a whole number >= 0");

    this.name = name.trim();
    this.price = price; // in cents: 2990 = 29,90 €
    this.stock = stock;
  }

  toString() {
    return `${this.name} : ${euro.format(this.price / 100)}`;
  }
}
