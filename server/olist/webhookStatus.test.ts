import { describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({
  getOlistConnection: vi.fn().mockResolvedValue(undefined),
  getLatestOlistWebhook: vi.fn().mockResolvedValue({
    receivedAt: new Date("2026-09-04T18:42:37.000Z"),
    eventType: "venda",
  }),
}));

vi.mock("./config", () => ({
  OLIST_ACCOUNT_KEY: "primary",
  getOlistConfigStatus: vi.fn().mockReturnValue({ configured: true, redirectUri: "https://www.rebka.com.br/api/olist/oauth/callback", webhookConfigured: true }),
  getOlistWebhookEndpoint: vi.fn().mockReturnValue("https://www.rebka.com.br/api/olist/webhooks?token=redacted"),
}));

import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

describe("olist.admin.status", () => {
  it("informa o último webhook recebido para ativar a confirmação visual", async () => {
    const ctx = {
      user: { id: 1, openId: "admin", name: "Admin", email: "admin@rebka.com.br", loginMethod: "test", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { headers: {} },
      res: {},
    } as unknown as TrpcContext;

    const status = await appRouter.createCaller(ctx).olist.admin.status();

    expect(status.lastWebhookReceivedAt).toEqual(new Date("2026-09-04T18:42:37.000Z"));
    expect(status.lastWebhookEventType).toBe("venda");
    expect(status.webhookEndpoint).toContain("/api/olist/webhooks");
  });
});
