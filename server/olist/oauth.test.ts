import { describe, expect, it } from "vitest";
import { createOlistOAuthState, isValidOlistOAuthState } from "./oauth";

describe("OAuth Olist state", () => {
  it("aceita o estado assinado mesmo quando o cookie de outro subdomínio não retorna", () => {
    const now = Date.now();
    expect(isValidOlistOAuthState(createOlistOAuthState(now), now + 1_000)).toBe(true);
  });

  it("rejeita estados alterados ou expirados", () => {
    const now = Date.now();
    const state = createOlistOAuthState(now);
    expect(isValidOlistOAuthState(`${state}x`, now + 1_000)).toBe(false);
    expect(isValidOlistOAuthState(state, now + 10 * 60 * 1000 + 1)).toBe(false);
  });
});
