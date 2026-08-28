import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";
import { createHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";
import { sdk } from "../_core/sdk";
import { OLIST_ACCOUNT_KEY } from "./config";
import { synchronizeCatalog } from "./catalog";

const JOB_NAME = "olist-catalog-reconciliation";
const CALLBACK_PATH = "/api/scheduled/olist-reconciliation";

export async function configureOlistReconciliation(cron: string, cookieHeader: string | undefined) {
  const connection = await db.getOlistConnection(OLIST_ACCOUNT_KEY);
  if (!connection) throw new Error("Autorize a conta Olist antes de configurar a reconciliação.");
  const sessionToken = parseCookieHeader(cookieHeader ?? "")[COOKIE_NAME] ?? "";
  if (!sessionToken) throw new Error("Sessão de administrador não encontrada para criar o agendamento.");

  if (connection.reconciliationTaskUid) {
    const updated = await updateHeartbeatJob(connection.reconciliationTaskUid, { cron, enable: true }, sessionToken);
    await db.setOlistReconciliationSchedule({ accountKey: OLIST_ACCOUNT_KEY, taskUid: connection.reconciliationTaskUid, cron });
    return { taskUid: connection.reconciliationTaskUid, nextExecutionAt: updated.nextExecutionAt, updated: true };
  }

  const created = await createHeartbeatJob({
    name: JOB_NAME,
    cron,
    path: CALLBACK_PATH,
    method: "POST",
    description: "Reconcilia catálogo e disponibilidade da Rebka Beauty com a Olist ERP.",
  }, sessionToken);
  await db.setOlistReconciliationSchedule({ accountKey: OLIST_ACCOUNT_KEY, taskUid: created.taskUid, cron });
  return { taskUid: created.taskUid, nextExecutionAt: created.nextExecutionAt, updated: false };
}

export async function runOlistReconciliation(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      res.status(403).json({ error: "Somente o agendamento da plataforma pode executar esta rota." });
      return;
    }
    const connection = await db.getOlistConnection(OLIST_ACCOUNT_KEY);
    if (!connection || connection.reconciliationTaskUid !== user.taskUid) {
      res.json({ ok: true, skipped: "unmatched_or_orphan_schedule" });
      return;
    }
    const result = await synchronizeCatalog();
    res.json({ ok: true, synced: result.synced, timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida na reconciliação Olist.";
    console.error("[Olist Reconciliation] Failed", error);
    res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
