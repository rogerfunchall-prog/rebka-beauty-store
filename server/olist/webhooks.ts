import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import * as db from "../db";

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function webhookSecretMatches(req: Request) {
  const secret = process.env.TINY_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const received = req.header("x-olist-webhook-secret") ?? (typeof req.query.token === "string" ? req.query.token : "");
  const left = Buffer.from(secret);
  const right = Buffer.from(received);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function receiveOlistWebhook(req: Request, res: Response) {
  if (!webhookSecretMatches(req)) {
    res.status(process.env.TINY_WEBHOOK_SECRET?.trim() ? 401 : 503).json({ error: "Webhook não autorizado ou não configurado." });
    return;
  }
  const payload = req.body ?? {};
  const eventType = req.header("x-olist-event") || (typeof payload?.evento === "string" ? payload.evento : "unknown");
  const payloadHash = createHash("sha256").update(`${eventType}:${stableJson(payload)}`).digest("hex");
  try {
    const isNew = await db.recordOlistWebhook({ payloadHash, eventType, payload });
    res.status(200).json({ ok: true, duplicate: !isNew });
  } catch (error) {
    console.error("[Olist Webhook] Could not record event", error);
    res.status(500).json({ error: "Não foi possível processar o webhook." });
  }
}
