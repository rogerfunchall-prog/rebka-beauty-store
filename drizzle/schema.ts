import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Single Olist OAuth connection for the store. Secrets are AES-GCM encrypted
 * before they reach this table and are never returned to the browser.
 */
export const olistConnections = mysqlTable("olist_connections", {
  id: int("id").autoincrement().primaryKey(),
  accountKey: varchar("accountKey", { length: 64 }).notNull().unique(),
  olistAccountId: varchar("olistAccountId", { length: 128 }),
  accessTokenCiphertext: text("accessTokenCiphertext").notNull(),
  refreshTokenCiphertext: text("refreshTokenCiphertext").notNull(),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt").notNull(),
  scope: text("scope"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  reconciliationTaskUid: varchar("reconciliationTaskUid", { length: 65 }).unique(),
  reconciliationCron: varchar("reconciliationCron", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Cached storefront projection of Olist products. Olist remains the operational source of truth. */
export const olistProducts = mysqlTable("olist_products", {
  id: int("id").autoincrement().primaryKey(),
  olistProductId: varchar("olistProductId", { length: 64 }).notNull().unique(),
  sku: varchar("sku", { length: 128 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  shortDescription: text("shortDescription"),
  description: text("description"),
  productType: varchar("productType", { length: 32 }),
  categoryId: varchar("categoryId", { length: 64 }),
  categoryName: varchar("categoryName", { length: 255 }),
  priceCents: int("priceCents").notNull().default(0),
  compareAtPriceCents: int("compareAtPriceCents"),
  stockQuantity: int("stockQuantity").notNull().default(0),
  active: int("active").notNull().default(1),
  rawPayload: text("rawPayload"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Product image metadata references object storage; file bytes never live in the database. */
export const olistProductImages = mysqlTable("olist_product_images", {
  id: int("id").autoincrement().primaryKey(),
  olistProductId: varchar("olistProductId", { length: 64 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  url: varchar("url", { length: 1024 }).notNull(),
  altText: varchar("altText", { length: 255 }),
  position: int("position").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Local order link provides idempotency and maps storefront orders to Olist sale orders. */
export const olistOrders = mysqlTable("olist_orders", {
  id: int("id").autoincrement().primaryKey(),
  clientReference: varchar("clientReference", { length: 128 }).notNull().unique(),
  olistOrderId: varchar("olistOrderId", { length: 64 }).unique(),
  userId: int("userId"),
  customerPayload: text("customerPayload").notNull(),
  itemsPayload: text("itemsPayload").notNull(),
  shippingPayload: text("shippingPayload"),
  totalCents: int("totalCents").notNull().default(0),
  paymentStatus: varchar("paymentStatus", { length: 32 }).notNull().default("pending"),
  fulfillmentStatus: varchar("fulfillmentStatus", { length: 32 }).notNull().default("pending"),
  trackingCode: varchar("trackingCode", { length: 128 }),
  trackingUrl: varchar("trackingUrl", { length: 1024 }),
  rawPayload: text("rawPayload"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Durable audit trail and retry state for Olist writes. */
export const olistSyncOperations = mysqlTable("olist_sync_operations", {
  id: int("id").autoincrement().primaryKey(),
  operationType: varchar("operationType", { length: 64 }).notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 128 }).notNull().unique(),
  targetId: varchar("targetId", { length: 128 }),
  status: varchar("status", { length: 32 }).notNull().default("queued"),
  attempts: int("attempts").notNull().default(0),
  requestPayload: text("requestPayload"),
  responsePayload: text("responsePayload"),
  lastError: text("lastError"),
  availableAt: timestamp("availableAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Idempotent record of Olist webhooks accepted by the storefront. */
export const olistWebhookEvents = mysqlTable("olist_webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  payloadHash: varchar("payloadHash", { length: 128 }).notNull().unique(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  payload: text("payload").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("received"),
  processedAt: timestamp("processedAt"),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OlistConnection = typeof olistConnections.$inferSelect;
export type OlistProduct = typeof olistProducts.$inferSelect;
export type OlistOrder = typeof olistOrders.$inferSelect;
