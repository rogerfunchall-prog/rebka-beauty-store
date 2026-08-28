import { assets, type Product } from "./store";

type OlistStorefrontProduct = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  categoryName: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  stockQuantity: number;
  active: boolean;
  imageUrls: string[];
};

function normalizeCategory(categoryName: string | null): Product["category"] {
  const value = categoryName?.toLocaleLowerCase("pt-BR") ?? "";
  if (value.includes("limp")) return "limpeza";
  if (value.includes("tôn") || value.includes("ton")) return "tonicos";
  if (value.includes("sér") || value.includes("ser")) return "seruns";
  if (value.includes("hidr")) return "hidratacao";
  if (value.includes("kit")) return "kits";
  return "seruns";
}

export function mapOlistProductToStoreProduct(product: OlistStorefrontProduct): Product {
  const image = product.imageUrls[0] || assets.logo;
  return {
    id: product.slug,
    name: product.name,
    subtitle: product.categoryName || "Produto Rebka",
    shortDescription: product.shortDescription || product.description || "Produto sincronizado com a operação Rebka.",
    longDescription: product.description || product.shortDescription || "As informações detalhadas deste produto serão atualizadas conforme o cadastro administrativo.",
    benefits: ["Cadastro sincronizado", "Disponibilidade atualizada", "Envio conforme opção selecionada"],
    usage: "Siga sempre as instruções de uso e as recomendações presentes no rótulo do produto.",
    size: "Consulte a descrição",
    price: product.priceCents / 100,
    oldPrice: product.compareAtPriceCents ? product.compareAtPriceCents / 100 : undefined,
    image,
    images: product.imageUrls,
    category: normalizeCategory(product.categoryName),
    badge: product.stockQuantity <= 0 ? "Indisponível" : undefined,
  };
}
