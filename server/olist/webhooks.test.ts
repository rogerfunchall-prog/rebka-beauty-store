import { describe, expect, it, vi } from "vitest";
import { webhookSecretMatches } from "./webhooks";

function request(secret: string | undefined, received?: string) {
  if (secret === undefined) delete process.env.TINY_WEBHOOK_SECRET;
  else process.env.TINY_WEBHOOK_SECRET = secret;
  return {
    header: vi.fn().mockReturnValue(received),
    query: {},
  } as never;
}

describe("Olist webhooks", () => {
  it("rejects webhooks until a secret is configured", () => {
    expect(webhookSecretMatches(request(undefined))).toBe(false);
  });

  it("accepts only a matching configured secret", () => {
    expect(webhookSecretMatches(request("secret-for-tests", "secret-for-tests"))).toBe(true);
    expect(webhookSecretMatches(request("secret-for-tests", "different-secret"))).toBe(false);
  });
});
