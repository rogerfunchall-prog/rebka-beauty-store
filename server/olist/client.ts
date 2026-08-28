import * as db from "../db";
import { OLIST_ACCOUNT_KEY, OLIST_API_BASE_URL, OLIST_OAUTH_BASE_URL, getOlistConfig } from "./config";
import { decryptOlistSecret, encryptOlistSecret } from "./crypto";
import { asRecord, type OlistApiErrorDetails, type OlistOrderWrite, type OlistProductWrite, type OlistStockWrite, type OlistTokenResponse } from "./types";

const REFRESH_SKEW_MS = 2 * 60 * 1000;
const MAX_RETRIES = 2;

export class OlistApiError extends Error {
  readonly details: OlistApiErrorDetails;

  constructor(details: OlistApiErrorDetails) {
    super(details.message);
    this.name = "OlistApiError";
    this.details = details;
  }
}

class OlistRateLimiter {
  private blockedUntil = 0;

  async waitForAvailability() {
    const waitMs = this.blockedUntil - Date.now();
    if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  observe(headers: Headers) {
    const remaining = Number(headers.get("x-ratelimit-remaining"));
    const resetSeconds = Number(headers.get("x-ratelimit-reset"));
    if (Number.isFinite(remaining) && remaining <= 0 && Number.isFinite(resetSeconds) && resetSeconds > 0) {
      this.blockedUntil = Math.max(this.blockedUntil, Date.now() + resetSeconds * 1000);
    }
  }

  retryAfter(headers: Headers) {
    const headerValue = Number(headers.get("retry-after"));
    const resetSeconds = Number(headers.get("x-ratelimit-reset"));
    const seconds = Number.isFinite(headerValue) && headerValue > 0 ? headerValue : Number.isFinite(resetSeconds) && resetSeconds > 0 ? resetSeconds : 5;
    const waitMs = seconds * 1000;
    this.blockedUntil = Math.max(this.blockedUntil, Date.now() + waitMs);
    return waitMs;
  }
}

const rateLimiter = new OlistRateLimiter();

function responseMessage(payload: unknown, fallback: string) {
  const record = asRecord(payload);
  return (typeof record.mensagem === "string" && record.mensagem) || (typeof record.message === "string" && record.message) || fallback;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function requestRefreshToken(): Promise<OlistTokenResponse> {
  const connection = await db.getOlistConnection(OLIST_ACCOUNT_KEY);
  if (!connection) throw new OlistApiError({ status: 401, message: "A conta Olist ainda não foi autorizada." });
  const config = getOlistConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: decryptOlistSecret(connection.refreshTokenCiphertext),
  });
  const response = await fetch(`${OLIST_OAUTH_BASE_URL}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await parseResponse(response);
  if (!response.ok) throw new OlistApiError({ status: response.status, message: responseMessage(payload, "Não foi possível renovar a autorização Olist.") });
  const token = payload as Partial<OlistTokenResponse>;
  const expiresIn = token.expires_in;
  if (!token.access_token || !token.refresh_token || typeof expiresIn !== "number" || !Number.isFinite(expiresIn)) {
    throw new OlistApiError({ status: 502, message: "A Olist retornou uma renovação de token incompleta." });
  }
  await db.upsertOlistConnection({
    accountKey: OLIST_ACCOUNT_KEY,
    accessTokenCiphertext: encryptOlistSecret(token.access_token),
    refreshTokenCiphertext: encryptOlistSecret(token.refresh_token),
    accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    scope: token.scope ?? connection.scope,
    olistAccountId: connection.olistAccountId,
  });
  return token as OlistTokenResponse;
}

async function accessToken(forceRefresh = false) {
  const connection = await db.getOlistConnection(OLIST_ACCOUNT_KEY);
  if (!connection) throw new OlistApiError({ status: 401, message: "A conta Olist ainda não foi autorizada." });
  if (forceRefresh || connection.accessTokenExpiresAt.getTime() <= Date.now() + REFRESH_SKEW_MS) {
    return (await requestRefreshToken()).access_token;
  }
  return decryptOlistSecret(connection.accessTokenCiphertext);
}

export class OlistClient {
  async request(path: string, options: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown; query?: Record<string, string | number | undefined> } = {}) {
    const method = options.method ?? "GET";
    const url = new URL(`${OLIST_API_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) if (value !== undefined) url.searchParams.set(key, String(value));

    let lastError: OlistApiError | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      await rateLimiter.waitForAvailability();
      const token = await accessToken(attempt === 1 && lastError?.details.status === 401);
      const response = await fetch(url, {
        method,
        headers: {
          authorization: `Bearer ${token}`,
          accept: "application/json",
          ...(options.body === undefined ? {} : { "content-type": "application/json" }),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      rateLimiter.observe(response.headers);
      const payload = await parseResponse(response);
      if (response.ok) return payload;

      if (response.status === 429 && attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, rateLimiter.retryAfter(response.headers)));
        continue;
      }
      const apiError = new OlistApiError({
        status: response.status,
        message: responseMessage(payload, `A Olist retornou o status ${response.status}.`),
        retryAfterMs: response.status === 429 ? rateLimiter.retryAfter(response.headers) : undefined,
      });
      if (response.status === 401 && attempt < 1) {
        lastError = apiError;
        continue;
      }
      throw apiError;
    }
    throw lastError ?? new OlistApiError({ status: 502, message: "Não foi possível concluir a chamada à Olist." });
  }

  listProducts(query?: { pagina?: number; limite?: number; pesquisa?: string }) {
    return this.request("/produtos", { query });
  }

  getProduct(olistProductId: string) {
    return this.request(`/produtos/${encodeURIComponent(olistProductId)}`);
  }

  createProduct(payload: OlistProductWrite) {
    return this.request("/produtos", { method: "POST", body: payload });
  }

  updateProduct(olistProductId: string, payload: OlistProductWrite) {
    return this.request(`/produtos/${encodeURIComponent(olistProductId)}`, { method: "PUT", body: payload });
  }

  updateProductPrice(olistProductId: string, payload: { preco: number; precoPromocional?: number | null }) {
    return this.request(`/produtos/${encodeURIComponent(olistProductId)}/preco`, { method: "PUT", body: payload });
  }

  listProductImages(olistProductId: string) {
    return this.request(`/produtos/${encodeURIComponent(olistProductId)}/anexos`);
  }

  addProductImages(olistProductId: string, payload: Array<{ url: string; externo: boolean }>) {
    return this.request(`/produtos/${encodeURIComponent(olistProductId)}/anexos`, { method: "POST", body: payload });
  }

  getProductStock(olistProductId: string) {
    return this.request(`/estoque/${encodeURIComponent(olistProductId)}`);
  }

  updateProductStock(olistProductId: string, payload: OlistStockWrite) {
    return this.request(`/estoque/${encodeURIComponent(olistProductId)}`, { method: "POST", body: payload });
  }

  listShippingMethods() {
    return this.request("/formas-envio");
  }

  listOrders(query?: { pagina?: number; limite?: number; numero?: number }) {
    return this.request("/pedidos", { query });
  }

  getOrder(olistOrderId: string) {
    return this.request(`/pedidos/${encodeURIComponent(olistOrderId)}`);
  }

  createOrder(payload: OlistOrderWrite) {
    return this.request("/pedidos", { method: "POST", body: payload });
  }

  updateOrderDispatch(olistOrderId: string, payload: Record<string, unknown>) {
    return this.request(`/pedidos/${encodeURIComponent(olistOrderId)}/despacho`, { method: "PUT", body: payload });
  }
}

export const olistClient = new OlistClient();
