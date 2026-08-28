import { describe, expect, it } from "vitest";
import { normalizeOlistProduct } from "./catalog";
import { toSlug } from "./types";

describe("Olist catalog normalization", () => {
  it("creates a stable storefront projection from a product payload", () => {
    const product = normalizeOlistProduct({
      id: 42,
      sku: "REBKA-GLOW-120",
      descricao: "BeGlow Tônico Facial",
      descricaoComplementar: "Descrição completa",
      preco: 49.9,
      saldo: 15,
      categoria: { id: 3, descricao: "Tônicos" },
    });
    expect(product).toMatchObject({
      olistProductId: "42",
      sku: "REBKA-GLOW-120",
      slug: "beglow-tonico-facial",
      priceCents: 4990,
      stockQuantity: 15,
      categoryName: "Tônicos",
      active: true,
    });
  });

  it("normalizes Brazilian characters for public product slugs", () => {
    expect(toSlug("Tônico Facial — Edição 2026")).toBe("tonico-facial-edicao-2026");
  });
});
