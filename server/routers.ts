import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { assistantInputSchema, fallbackAssistantReply, rebkaSystemPrompt, isSafetyQuestion, replyFromModelOutput } from "./rebkaAssistant";
import { z } from "zod";
import * as db from "./db";
import { olistClient } from "./olist/client";
import { getOlistConfigStatus, OLIST_ACCOUNT_KEY } from "./olist/config";
import { synchronizeCatalog, synchronizeProductById } from "./olist/catalog";
import { createIdempotentOlistOrder } from "./olist/orders";
import { storagePut } from "./storage";
import { synchronizeProductImages } from "./olist/catalog";
import { configureOlistReconciliation } from "./olist/reconciliation";

const requestWindows = new Map<string, { count: number; resetAt: number }>();

function getModelText(content: string | Array<{ type: string; text?: string }> | undefined) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n");
}

export function enforceChatRateLimit(forwardedFor: string | undefined) {
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = requestWindows.get(ip);
  if (!current || current.resetAt < now) {
    requestWindows.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return;
  }
  if (current.count >= 15) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Aguarde alguns minutos antes de enviar outra mensagem." });
  }
  current.count += 1;
}

type ChatHistory = Array<{ role: "user" | "assistant"; content: string }>;

export async function generateRebkaAssistantMessage(
  latestQuestion: string,
  history: ChatHistory,
  callModel: typeof invokeLLM = invokeLLM
) {
  if (isSafetyQuestion(latestQuestion)) return fallbackAssistantReply(latestQuestion);

  try {
    const response = await callModel({
      model: "gpt-5-mini",
      messages: [{ role: "system", content: rebkaSystemPrompt }, ...history],
      maxTokens: 1800,
      reasoning: { effort: "minimal" },
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rebka_assistant_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              answer: { type: "string" },
              recommendation: { type: "string", enum: ["beclean", "beglow", "becalm", "besoft"] },
              safety: { type: "boolean" },
            },
            required: ["answer", "recommendation", "safety"],
            additionalProperties: false,
          },
        },
      },
    });
    const raw = getModelText(response.choices[0]?.message?.content);
    return replyFromModelOutput(latestQuestion, raw);
  } catch (error) {
    console.error("[Rebka Assistant] Failed to generate response", error);
    return fallbackAssistantReply(latestQuestion);
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  assistant: router({
    reply: publicProcedure.input(assistantInputSchema).mutation(async ({ input, ctx }) => {
      enforceChatRateLimit(ctx.req.headers["x-forwarded-for"] as string | undefined);
      const latestQuestion = [...input.messages].reverse().find((message) => message.role === "user")?.content || "";
      const history = input.messages.map((message) => ({ role: message.role, content: message.content }));
      return { message: await generateRebkaAssistantMessage(latestQuestion, history) };
    }),
  }),

  olist: router({
    storefrontProducts: publicProcedure.query(async () => {
      const cachedProducts = await db.listCachedOlistProducts();
      return Promise.all(cachedProducts.filter(product => product.active === 1).map(async product => ({
        id: product.olistProductId,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        categoryName: product.categoryName,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        stockQuantity: product.stockQuantity,
        active: product.active === 1,
        imageUrls: (await db.listOlistProductImages(product.olistProductId)).sort((left, right) => left.position - right.position).map(image => image.url),
        syncedAt: product.syncedAt,
      })));
    }),
    storefrontProduct: publicProcedure.input(z.object({ slug: z.string().min(1).max(255) })).query(async ({ input }) => {
      const product = await db.getCachedOlistProductBySlug(input.slug);
      if (!product || product.active !== 1) return null;
      return {
        id: product.olistProductId,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        categoryName: product.categoryName,
        priceCents: product.priceCents,
        compareAtPriceCents: product.compareAtPriceCents,
        stockQuantity: product.stockQuantity,
        active: true,
        imageUrls: (await db.listOlistProductImages(product.olistProductId)).sort((left, right) => left.position - right.position).map(image => image.url),
        syncedAt: product.syncedAt,
      };
    }),
    shippingMethods: publicProcedure.query(() => olistClient.listShippingMethods()),
    admin: router({
      status: adminProcedure.query(async () => {
        const config = getOlistConfigStatus();
        const connection = await db.getOlistConnection(OLIST_ACCOUNT_KEY);
        return {
          ...config,
          connected: Boolean(connection?.status === "active"),
          tokenExpiresAt: connection?.accessTokenExpiresAt ?? null,
          scope: connection?.scope ?? null,
        };
      }),
      synchronizeCatalog: adminProcedure.mutation(async () => synchronizeCatalog()),
      synchronizeProduct: adminProcedure.input(z.object({ olistProductId: z.string().min(1).max(64) })).mutation(({ input }) => synchronizeProductById(input.olistProductId)),
      listProducts: adminProcedure.input(z.object({ pagina: z.number().int().positive().optional(), limite: z.number().int().min(1).max(100).optional(), pesquisa: z.string().max(255).optional() }).optional()).query(({ input }) => olistClient.listProducts(input)),
      getProduct: adminProcedure.input(z.object({ olistProductId: z.string().min(1).max(64) })).query(({ input }) => olistClient.getProduct(input.olistProductId)),
      createProduct: adminProcedure.input(z.object({ payload: z.record(z.string(), z.unknown()) })).mutation(async ({ input }) => {
        const remote = await olistClient.createProduct(input.payload);
        const remoteId = (remote as Record<string, unknown>).id ?? (remote as Record<string, unknown>).idProduto;
        if (remoteId !== undefined) await synchronizeProductById(String(remoteId));
        return remote;
      }),
      updateProduct: adminProcedure.input(z.object({ olistProductId: z.string().min(1).max(64), payload: z.record(z.string(), z.unknown()) })).mutation(async ({ input }) => {
        const remote = await olistClient.updateProduct(input.olistProductId, input.payload);
        await synchronizeProductById(input.olistProductId);
        return remote;
      }),
      updatePrice: adminProcedure.input(z.object({ olistProductId: z.string().min(1).max(64), price: z.number().nonnegative(), promotionalPrice: z.number().nonnegative().nullable().optional() })).mutation(async ({ input }) => {
        const remote = await olistClient.updateProductPrice(input.olistProductId, { preco: input.price, precoPromocional: input.promotionalPrice });
        await synchronizeProductById(input.olistProductId);
        return remote;
      }),
      updateStock: adminProcedure.input(z.object({ olistProductId: z.string().min(1).max(64), payload: z.record(z.string(), z.unknown()) })).mutation(async ({ input }) => {
        const remote = await olistClient.updateProductStock(input.olistProductId, input.payload);
        await synchronizeProductById(input.olistProductId);
        return remote;
      }),
      attachProductImage: adminProcedure.input(z.object({
        olistProductId: z.string().min(1).max(64),
        filename: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._-]+$/),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        base64: z.string().min(4).max(14_000_000),
        altText: z.string().max(255).optional(),
      })).mutation(async ({ input }) => {
        const encoded = input.base64.replace(/^data:image\/(?:jpeg|png|webp);base64,/, "");
        const data = Buffer.from(encoded, "base64");
        if (data.length === 0 || data.length > 10 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "A imagem deve ter até 10 MB." });
        const { key, url } = await storagePut(`olist/products/${input.olistProductId}/${Date.now()}-${input.filename}`, data, input.contentType);
        const remote = await olistClient.addProductImages(input.olistProductId, [{ url, externo: true }]);
        const existing = await db.listOlistProductImages(input.olistProductId);
        await db.replaceCachedOlistProductImages(input.olistProductId, [
          ...existing.map(image => ({ storageKey: image.storageKey, url: image.url, altText: image.altText, position: image.position })),
          { storageKey: key, url, altText: input.altText ?? null, position: existing.length },
        ]);
        return { key, url, remote };
      }),
      synchronizeProductImages: adminProcedure.input(z.object({ olistProductId: z.string().min(1).max(64) })).mutation(({ input }) => synchronizeProductImages(input.olistProductId)),
      listOrders: adminProcedure.input(z.object({ pagina: z.number().int().positive().optional(), limite: z.number().int().min(1).max(100).optional(), numero: z.number().int().positive().optional() }).optional()).query(({ input }) => olistClient.listOrders(input)),
      updateDispatch: adminProcedure.input(z.object({ olistOrderId: z.string().min(1).max(64), payload: z.record(z.string(), z.unknown()) })).mutation(({ input }) => olistClient.updateOrderDispatch(input.olistOrderId, input.payload)),
      configureReconciliation: adminProcedure.input(z.object({ cron: z.string().regex(/^\S+\s+\S+\s+\S+\s+\S+\s+\S+\s+\S+$/, "Use seis campos cron, em UTC.") })).mutation(({ input, ctx }) => configureOlistReconciliation(input.cron, ctx.req.headers.cookie)),
    }),
  }),
  checkout: router({
    createOrder: protectedProcedure.input(z.object({
      clientReference: z.string().min(1).max(128).optional(),
      customer: z.record(z.string(), z.unknown()),
      items: z.array(z.record(z.string(), z.unknown())).min(1).max(100),
      shipping: z.record(z.string(), z.unknown()).optional(),
      totalCents: z.number().int().nonnegative(),
      olistPayload: z.record(z.string(), z.unknown()),
    })).mutation(async ({ input, ctx }) => createIdempotentOlistOrder({
      clientReference: input.clientReference,
      userId: ctx.user.id,
      customer: input.customer,
      items: input.items,
      shipping: input.shipping,
      totalCents: input.totalCents,
      olistPayload: input.olistPayload,
    })),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
