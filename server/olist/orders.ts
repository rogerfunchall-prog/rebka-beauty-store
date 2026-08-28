import { randomUUID } from "node:crypto";
import * as db from "../db";
import { olistClient } from "./client";
import { asRecord, type OlistOrderWrite } from "./types";

function remoteOrderId(payload: unknown) {
  const record = asRecord(payload);
  const direct = record.id ?? record.idPedido;
  if (direct !== undefined) return String(direct);
  const nested = asRecord(record.pedido);
  return nested.id === undefined ? null : String(nested.id);
}

export async function createIdempotentOlistOrder(input: {
  clientReference?: string;
  userId?: number | null;
  customer: unknown;
  items: unknown;
  shipping?: unknown;
  totalCents: number;
  olistPayload: OlistOrderWrite;
}) {
  const clientReference = input.clientReference || `rebka-${randomUUID()}`;
  const existing = await db.findOlistOrderByClientReference(clientReference);
  if (existing?.olistOrderId) return { order: existing, created: false };

  if (!existing) {
    await db.createOlistOrderIntent({
      clientReference,
      userId: input.userId,
      customerPayload: input.customer,
      itemsPayload: input.items,
      shippingPayload: input.shipping,
      totalCents: input.totalCents,
    });
  }

  const idempotencyKey = `order:${clientReference}`;
  try {
    await db.createOlistSyncOperation({
      operationType: "create_order",
      idempotencyKey,
      targetId: clientReference,
      requestPayload: input.olistPayload,
    });
  } catch (error) {
    if (!String(error).toLowerCase().includes("duplicate")) throw error;
  }

  try {
    const remote = await olistClient.createOrder(input.olistPayload);
    const olistOrderId = remoteOrderId(remote);
    if (!olistOrderId) throw new Error("A Olist não retornou o identificador do pedido criado.");
    await db.updateOlistOrderLink({ clientReference, olistOrderId, rawPayload: remote });
    await db.completeOlistSyncOperation({ idempotencyKey, status: "completed", responsePayload: remote });
    return { order: await db.findOlistOrderByClientReference(clientReference), created: true };
  } catch (error) {
    await db.completeOlistSyncOperation({
      idempotencyKey,
      status: "failed",
      lastError: error instanceof Error ? error.message : "Falha desconhecida ao criar pedido Olist.",
    });
    throw error;
  }
}
