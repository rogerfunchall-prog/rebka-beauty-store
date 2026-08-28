import { describe, expect, it } from "vitest";
import { products } from "./store";

const productById = (id: string) => products.find(product => product.id === id);

describe("preços e combos Rebka", () => {
  it("aplica os quatro preços comerciais solicitados", () => {
    expect(productById("becalm")?.price).toBe(79.9);
    expect(productById("beclean")?.price).toBe(39.9);
    expect(productById("besoft")?.price).toBe(54.9);
    expect(productById("beglow")?.price).toBe(39.9);
  });

  it("mantém todos os combos com 20% de desconto sobre os produtos incluídos", () => {
    expect(productById("ritual-clean")).toMatchObject({ price: 63.84, oldPrice: 79.8 });
    expect(productById("duo-calm")).toMatchObject({ price: 107.84, oldPrice: 134.8 });
    expect(productById("trio-essencial")).toMatchObject({ name: "Ritual Completo", price: 171.68, oldPrice: 214.6 });
  });
});
