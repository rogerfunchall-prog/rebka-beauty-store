import { describe, expect, it } from "vitest";
import { getOlistConfig, getOlistWebhookEndpoint } from "./config";

describe("credenciais Olist", () => {
  it("carrega Client ID e Client Secret novos somente no servidor", () => {
    const config = getOlistConfig();
    expect(config.clientId.length).toBeGreaterThan(10);
    expect(config.clientSecret.length).toBeGreaterThan(10);
    expect(config.redirectUri).toBe("https://www.rebka.com.br/api/olist/oauth/callback");
    expect(config.clientId).not.toContain("undefined");
    expect(config.clientSecret).not.toContain("undefined");
  });

  it("mantém o endpoint de webhook montado com a chave configurada", () => {
    const currentSecret = process.env.TINY_WEBHOOK_SECRET?.trim();
    expect(currentSecret).toBeTruthy();
    const endpoint = new URL(getOlistWebhookEndpoint());
    expect(endpoint.pathname).toBe("/api/olist/webhooks");
    expect(endpoint.searchParams.get("token")).toBe(currentSecret);
  });
});
