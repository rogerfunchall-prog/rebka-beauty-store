export type OlistTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  scope?: string;
};

export type OlistApiErrorDetails = {
  status: number;
  message: string;
  retryAfterMs?: number;
};

export type CachedStoreProduct = {
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
  syncedAt: Date;
};

export type OlistProductWrite = Record<string, unknown>;
export type OlistOrderWrite = Record<string, unknown>;
export type OlistStockWrite = Record<string, unknown>;

export function toSlug(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return normalized || "produto";
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
