import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  olistConnections,
  olistOrders,
  olistProductImages,
  olistProducts,
  olistSyncOperations,
  olistWebhookEvents,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

function stringifyPayload(value: unknown) {
  return JSON.stringify(value ?? null);
}

export async function getOlistConnection(accountKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(olistConnections).where(eq(olistConnections.accountKey, accountKey)).limit(1))[0];
}

export async function upsertOlistConnection(input: {
  accountKey: string;
  accessTokenCiphertext: string;
  refreshTokenCiphertext: string;
  accessTokenExpiresAt: Date;
  scope?: string | null;
  olistAccountId?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para persistir a conexão Olist.");
  await db.insert(olistConnections).values({ ...input, status: "active" }).onDuplicateKeyUpdate({
    set: {
      accessTokenCiphertext: input.accessTokenCiphertext,
      refreshTokenCiphertext: input.refreshTokenCiphertext,
      accessTokenExpiresAt: input.accessTokenExpiresAt,
      scope: input.scope ?? null,
      olistAccountId: input.olistAccountId ?? null,
      status: "active",
    },
  });
}

export async function setOlistReconciliationSchedule(input: { accountKey: string; taskUid: string | null; cron: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para configurar a reconciliação Olist.");
  await db.update(olistConnections).set({
    reconciliationTaskUid: input.taskUid,
    reconciliationCron: input.cron,
  }).where(eq(olistConnections.accountKey, input.accountKey));
}

export async function listCachedOlistProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(olistProducts).orderBy(desc(olistProducts.updatedAt));
}

export async function getCachedOlistProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(olistProducts).where(eq(olistProducts.slug, slug)).limit(1))[0];
}

export async function listOlistProductImages(olistProductId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(olistProductImages).where(eq(olistProductImages.olistProductId, olistProductId));
}

export async function upsertCachedOlistProduct(input: {
  olistProductId: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  productType?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  stockQuantity: number;
  active: boolean;
  rawPayload: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para sincronizar produtos Olist.");
  const values = {
    ...input,
    active: input.active ? 1 : 0,
    rawPayload: stringifyPayload(input.rawPayload),
    syncedAt: new Date(),
  };
  await db.insert(olistProducts).values(values).onDuplicateKeyUpdate({
    set: {
      sku: values.sku,
      slug: values.slug,
      name: values.name,
      shortDescription: values.shortDescription ?? null,
      description: values.description ?? null,
      productType: values.productType ?? null,
      categoryId: values.categoryId ?? null,
      categoryName: values.categoryName ?? null,
      priceCents: values.priceCents,
      compareAtPriceCents: values.compareAtPriceCents ?? null,
      stockQuantity: values.stockQuantity,
      active: values.active,
      rawPayload: values.rawPayload,
      syncedAt: values.syncedAt,
    },
  });
}

export async function replaceCachedOlistProductImages(
  olistProductId: string,
  images: Array<{ storageKey: string; url: string; altText?: string | null; position: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para sincronizar imagens Olist.");
  await db.delete(olistProductImages).where(eq(olistProductImages.olistProductId, olistProductId));
  if (images.length > 0) await db.insert(olistProductImages).values(images.map(image => ({ ...image, olistProductId })));
}

export async function findOlistOrderByClientReference(clientReference: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(olistOrders).where(eq(olistOrders.clientReference, clientReference)).limit(1))[0];
}

export async function createOlistOrderIntent(input: {
  clientReference: string;
  userId?: number | null;
  customerPayload: unknown;
  itemsPayload: unknown;
  shippingPayload?: unknown;
  totalCents: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para registrar o pedido.");
  await db.insert(olistOrders).values({
    clientReference: input.clientReference,
    userId: input.userId ?? null,
    customerPayload: stringifyPayload(input.customerPayload),
    itemsPayload: stringifyPayload(input.itemsPayload),
    shippingPayload: input.shippingPayload ? stringifyPayload(input.shippingPayload) : null,
    totalCents: input.totalCents,
  });
  return findOlistOrderByClientReference(input.clientReference);
}

export async function updateOlistOrderLink(input: {
  clientReference: string;
  olistOrderId?: string | null;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  rawPayload?: unknown;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar o pedido.");
  await db.update(olistOrders).set({
    olistOrderId: input.olistOrderId,
    paymentStatus: input.paymentStatus,
    fulfillmentStatus: input.fulfillmentStatus,
    trackingCode: input.trackingCode,
    trackingUrl: input.trackingUrl,
    rawPayload: input.rawPayload === undefined ? undefined : stringifyPayload(input.rawPayload),
    syncedAt: new Date(),
  }).where(eq(olistOrders.clientReference, input.clientReference));
}

export async function createOlistSyncOperation(input: { operationType: string; idempotencyKey: string; targetId?: string | null; requestPayload?: unknown }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para registrar a sincronização.");
  await db.insert(olistSyncOperations).values({
    operationType: input.operationType,
    idempotencyKey: input.idempotencyKey,
    targetId: input.targetId ?? null,
    requestPayload: input.requestPayload === undefined ? null : stringifyPayload(input.requestPayload),
  });
}

export async function completeOlistSyncOperation(input: { idempotencyKey: string; status: string; responsePayload?: unknown; lastError?: string | null }) {
  const db = await getDb();
  if (!db) return;
  await db.update(olistSyncOperations).set({
    status: input.status,
    attempts: 1,
    responsePayload: input.responsePayload === undefined ? undefined : stringifyPayload(input.responsePayload),
    lastError: input.lastError ?? null,
    completedAt: new Date(),
  }).where(eq(olistSyncOperations.idempotencyKey, input.idempotencyKey));
}

export async function recordOlistWebhook(input: { payloadHash: string; eventType: string; payload: unknown }) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para registrar o webhook.");
  try {
    await db.insert(olistWebhookEvents).values({
      payloadHash: input.payloadHash,
      eventType: input.eventType,
      payload: stringifyPayload(input.payload),
    });
    return true;
  } catch (error) {
    if (String(error).toLowerCase().includes("duplicate")) return false;
    throw error;
  }
}

export async function getLatestOlistWebhook() {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(olistWebhookEvents).orderBy(desc(olistWebhookEvents.receivedAt)).limit(1))[0];
}
