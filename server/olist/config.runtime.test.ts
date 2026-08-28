import { describe, expect, it } from "vitest";
import { getOlistConfig } from "./config";

describe("configuração protegida da Olist", () => {
  it("possui credenciais, URL de retorno e segredos locais válidos", () => {
    const config = getOlistConfig();
    expect(config.clientId.trim().length).toBeGreaterThan(0);
    expect(config.clientSecret.trim().length).toBeGreaterThan(0);
    expect(config.redirectUri).toBe("https://www.rebka.com.br/api/olist/oauth/callback");
    expect(process.env.TINY_TOKEN_ENCRYPTION_KEY).toMatch(/^[a-f0-9]{64}$/i);
    expect(process.env.TINY_WEBHOOK_SECRET?.length).toBeGreaterThanOrEqual(32);
  });
});
