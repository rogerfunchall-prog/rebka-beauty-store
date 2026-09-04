import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  upsertUser: vi.fn().mockResolvedValue(undefined),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("adminAuth.login", () => {
  it("aceita as credenciais administrativas fornecidas pelo ambiente seguro", async () => {
    const cookie = vi.fn();
    const ctx = {
      user: null,
      req: { protocol: "https", headers: {} },
      res: { cookie },
    } as unknown as TrpcContext;
    const result = await appRouter.createCaller(ctx).adminAuth.login({
      email: process.env.REBKA_ADMIN_EMAIL ?? "",
      password: process.env.REBKA_ADMIN_PASSWORD ?? "",
    });

    expect(result).toEqual({ success: true });
    expect(cookie).toHaveBeenCalledWith(expect.any(String), expect.any(String), expect.objectContaining({ httpOnly: true }));
  });
});
