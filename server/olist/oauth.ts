import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { OLIST_ACCOUNT_KEY, OLIST_OAUTH_BASE_URL, getOlistConfig } from "./config";
import { encryptOlistSecret } from "./crypto";
import type { OlistTokenResponse } from "./types";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";

const OLIST_OAUTH_STATE_COOKIE = "__Host-olist_oauth_state";
const OLIST_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

function olistStateSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não está configurado para proteger o OAuth Olist.");
  return secret;
}

function signOlistState(nonce: string, expiresAt: number) {
  const payload = `${nonce}.${expiresAt}`;
  const signature = createHmac("sha256", olistStateSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function createOlistOAuthState(now = Date.now()) {
  return signOlistState(randomBytes(32).toString("base64url"), now + OLIST_OAUTH_STATE_TTL_MS);
}

export function isValidOlistOAuthState(state: string | undefined, now = Date.now()) {
  if (!state) return false;
  const [nonce, expiresAtString, receivedSignature, ...extra] = state.split(".");
  const expiresAt = Number(expiresAtString);
  if (!nonce || !receivedSignature || extra.length > 0 || !Number.isFinite(expiresAt) || expiresAt < now) return false;
  return constantTimeMatch(receivedSignature, signOlistState(nonce, expiresAt).split(".")[2]);
}

function queryValue(req: Request, key: string) {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function constantTimeMatch(left: string | undefined, right: string | undefined) {
  if (!left || !right) return false;
  const leftValue = Buffer.from(left);
  const rightValue = Buffer.from(right);
  return leftValue.length === rightValue.length && timingSafeEqual(leftValue, rightValue);
}

async function requireOlistAdministrator(req: Request) {
  const user = await sdk.authenticateRequest(req);
  if (user.role !== "admin") throw new Error("Apenas administradores podem autorizar a integração Olist.");
  return user;
}

async function exchangeCodeForOlistToken(code: string): Promise<OlistTokenResponse> {
  const config = getOlistConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
  });
  const response = await fetch(`${OLIST_OAUTH_BASE_URL}/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`A Olist recusou a autorização (${response.status}).`);
  const payload = (await response.json()) as Partial<OlistTokenResponse>;
  if (!payload.access_token || !payload.refresh_token || !Number.isFinite(payload.expires_in)) {
    throw new Error("A Olist retornou uma resposta de token incompleta.");
  }
  return payload as OlistTokenResponse;
}

export function registerOlistOAuthRoutes(app: Express) {
  app.get("/api/olist/oauth/start", async (req: Request, res: Response) => {
    try {
      await requireOlistAdministrator(req);
      const config = getOlistConfig();
      const state = createOlistOAuthState();
      res.cookie(OLIST_OAUTH_STATE_COOKIE, state, {
        ...getSessionCookieOptions(req),
        httpOnly: true,
        maxAge: OLIST_OAUTH_STATE_TTL_MS,
        path: "/api/olist/oauth/callback",
      });
      const authorizationUrl = new URL(`${OLIST_OAUTH_BASE_URL}/auth`);
      authorizationUrl.search = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: "openid",
        response_type: "code",
        state,
      }).toString();
      res.redirect(302, authorizationUrl.toString());
    } catch (error) {
      console.error("[Olist OAuth] Failed to start authorization", error);
      res.status(403).json({ error: error instanceof Error ? error.message : "Não foi possível iniciar a autorização Olist." });
    }
  });

  app.get("/api/olist/oauth/callback", async (req: Request, res: Response) => {
    const code = queryValue(req, "code");
    const state = queryValue(req, "state");
    const expectedState = parseCookieHeader(req.headers.cookie ?? "")[OLIST_OAUTH_STATE_COOKIE];
    res.clearCookie(OLIST_OAUTH_STATE_COOKIE, { path: "/api/olist/oauth/callback" });
    const cookieStateMatches = constantTimeMatch(state, expectedState);
    const signedStateMatches = isValidOlistOAuthState(state);
    if (!code || (!cookieStateMatches && !signedStateMatches)) {
      res.redirect(302, "/admin/olist?connection=expired");
      return;
    }

    try {
      const token = await exchangeCodeForOlistToken(code);
      await db.upsertOlistConnection({
        accountKey: OLIST_ACCOUNT_KEY,
        accessTokenCiphertext: encryptOlistSecret(token.access_token),
        refreshTokenCiphertext: encryptOlistSecret(token.refresh_token),
        accessTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
        scope: token.scope ?? null,
      });
      res.redirect(302, "/admin/olist?connection=success");
    } catch (error) {
      console.error("[Olist OAuth] Failed to complete authorization", error);
      res.redirect(302, "/admin/olist?connection=failed");
    }
  });
}
