import * as db from "../db";
import { olistClient } from "./client";
import { asRecord, readNumber, readString, toSlug } from "./types";

function productItems(payload: unknown) {
  const record = asRecord(payload);
  const candidates = [record.itens, record.items, record.data];
  return candidates.find(Array.isArray) as unknown[] | undefined ?? [];
}

function imageItems(payload: unknown) {
  return Array.isArray(payload) ? payload : productItems(payload);
}

function readPriceCents(record: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const candidate = readNumber(record[name]);
    if (candidate !== null) return Math.round(candidate * 100);
  }
  return 0;
}

function textFrom(record: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = readString(record[name]);
    if (value) return value;
  }
  return null;
}

/** Normalizes only fields returned by Olist; unmapped optional fields remain null. */
export function normalizeOlistProduct(rawProduct: unknown) {
  const record = asRecord(rawProduct);
  const category = asRecord(record.categoria);
  const id = String(record.id ?? record.idProduto ?? "");
  const sku = textFrom(record, ["sku", "codigo"]) ?? id;
  const name = textFrom(record, ["descricao", "nome"]) ?? sku;
  const activeValue = record.situacao ?? record.ativo;
  const active = activeValue !== false && activeValue !== "I" && activeValue !== "inativo";
  return {
    olistProductId: id,
    sku,
    slug: toSlug(name),
    name,
    shortDescription: textFrom(record, ["descricaoCurta", "descricao"]),
    description: textFrom(record, ["descricaoComplementar", "descricaoLonga"]),
    productType: textFrom(record, ["tipo"]),
    categoryId: category.id === undefined ? null : String(category.id),
    categoryName: textFrom(category, ["descricao", "nome"]),
    priceCents: readPriceCents(record, ["preco", "precoVenda", "precoBase"]),
    compareAtPriceCents: readPriceCents(record, ["precoPromocional", "precoDe"]) || null,
    stockQuantity: readNumber(record.saldo) ?? readNumber(record.estoque) ?? 0,
    active,
    rawPayload: rawProduct,
  };
}

export async function syncOlistProduct(rawProduct: unknown) {
  const product = normalizeOlistProduct(rawProduct);
  if (!product.olistProductId) throw new Error("Produto Olist sem identificador.");
  await db.upsertCachedOlistProduct(product);
  return product;
}

export async function synchronizeCatalog() {
  if (catalogSynchronization) return catalogSynchronization;
  catalogSynchronization = runCatalogSynchronization();
  try {
    return await catalogSynchronization;
  } finally {
    catalogSynchronization = undefined;
  }
}

let catalogSynchronization: Promise<{ synced: number; products: Awaited<ReturnType<typeof syncOlistProduct>>[] }> | undefined;

async function runCatalogSynchronization() {
  const remote = await olistClient.listProducts({ limite: 100 });
  const items = productItems(remote);
  const products: Awaited<ReturnType<typeof syncOlistProduct>>[] = [];
  for (const item of items) {
    const product = await syncOlistProduct(item);
    products.push(product);
    try {
      await synchronizeProductImages(product.olistProductId);
    } catch (error) {
      console.warn("[Olist Catalog] Product cached without images", product.olistProductId, error);
    }
  }
  return { synced: products.length, products };
}

export async function synchronizeProductById(olistProductId: string) {
  const product = await olistClient.getProduct(olistProductId);
  const normalized = await syncOlistProduct(product);
  try {
    const stock = asRecord(await olistClient.getProductStock(olistProductId));
    const quantity = readNumber(stock.saldo) ?? readNumber(stock.estoque) ?? 0;
    await db.upsertCachedOlistProduct({ ...normalized, stockQuantity: quantity });
    return { ...normalized, stockQuantity: quantity };
  } catch (error) {
    console.warn("[Olist Catalog] Product cached without stock", olistProductId, error);
    return normalized;
  }
}

export async function synchronizeProductImages(olistProductId: string) {
  const remote = await olistClient.listProductImages(olistProductId);
  const images = imageItems(remote)
    .map(item => asRecord(item))
    .map((item, position) => ({
      url: readString(item.url),
      storageKey: `olist:${olistProductId}:${String(item.id ?? position)}`,
      position,
    }))
    .filter((image): image is { url: string; storageKey: string; position: number } => Boolean(image.url));
  await db.replaceCachedOlistProductImages(olistProductId, images);
  return images;
}
