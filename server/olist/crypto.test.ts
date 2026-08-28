import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decryptOlistSecret, encryptOlistSecret } from "./crypto";
import { getOlistConfigStatus } from "./config";

describe("Olist secret protection", () => {
  beforeEach(() => {
    vi.stubEnv("TINY_CLIENT_ID", "test-client");
    vi.stubEnv("TINY_CLIENT_SECRET", "test-secret");
    vi.stubEnv("TINY_OAUTH_REDIRECT_URI", "https://example.com/callback");
    vi.stubEnv("TINY_TOKEN_ENCRYPTION_KEY", "a".repeat(64));
  });

  afterEach(() => vi.unstubAllEnvs());

  it("encrypts and decrypts an OAuth token without persisting plaintext", () => {
    const token = "access-token-that-must-not-reach-the-browser";
    const encrypted = encryptOlistSecret(token);
    expect(encrypted).not.toContain(token);
    expect(decryptOlistSecret(encrypted)).toBe(token);
  });

  it("reports configuration only when every required server variable exists", () => {
    expect(getOlistConfigStatus().configured).toBe(true);
    vi.stubEnv("TINY_CLIENT_SECRET", "");
    expect(getOlistConfigStatus().configured).toBe(false);
  });
});
