import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({
  getOlistConnection: vi.fn(),
  upsertOlistConnection: vi.fn(),
}));

import * as db from "../db";
import { encryptOlistSecret } from "./crypto";
import { OlistClient } from "./client";

describe("OlistClient", () => {
  beforeEach(() => {
    vi.stubEnv("TINY_CLIENT_ID", "test-client");
    vi.stubEnv("TINY_CLIENT_SECRET", "test-secret");
    vi.stubEnv("TINY_OAUTH_REDIRECT_URI", "https://example.com/callback");
    vi.stubEnv("TINY_TOKEN_ENCRYPTION_KEY", "b".repeat(64));
    vi.mocked(db.getOlistConnection).mockResolvedValue({
      accessTokenCiphertext: encryptOlistSecret("test-access-token"),
      refreshTokenCiphertext: encryptOlistSecret("test-refresh-token"),
      accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      scope: "openid",
      olistAccountId: null,
    } as Awaited<ReturnType<typeof db.getOlistConnection>>);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("calls the v3 product endpoint from the server with a bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ itens: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const client = new OlistClient();
    await client.listProducts({ limite: 25, pesquisa: "BeGlow" });
    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(String(url)).toBe("https://api.tiny.com.br/public-api/v3/produtos?limite=25&pesquisa=BeGlow");
    expect(options.headers).toMatchObject({ authorization: "Bearer test-access-token" });
  });

  it("updates only the price fields through the dedicated product endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ preco: 49.9 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const client = new OlistClient();
    await client.updateProductPrice("42", { preco: 49.9, precoPromocional: 44.9 });
    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(String(url)).toBe("https://api.tiny.com.br/public-api/v3/produtos/42/preco");
    expect(options).toMatchObject({ method: "PUT", body: JSON.stringify({ preco: 49.9, precoPromocional: 44.9 }) });
  });
});
