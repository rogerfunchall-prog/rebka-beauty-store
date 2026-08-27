import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { enforceChatRateLimit, generateRebkaAssistantMessage } from "./routers";
import type { InvokeResult } from "./_core/llm";

describe("limite do atendimento Rebka", () => {
  it("bloqueia a décima sexta solicitação da mesma janela", () => {
    const testIp = `vitest-${Date.now()}`;
    for (let index = 0; index < 15; index += 1) enforceChatRateLimit(testIp);
    expect(() => enforceChatRateLimit(testIp)).toThrow(TRPCError);
  });

  it("retorna fallback coerente para os três produtos quando o modelo devolve JSON inválido", async () => {
    const invalidModel = async () => ({
      id: "invalid-test",
      created: 0,
      model: "gpt-5-mini",
      choices: [{ index: 0, message: { role: "assistant", content: "{json inválido" }, finish_reason: "stop" }],
    }) as InvokeResult;

    const cases = [
      ["Como uso o BeClean?", "/produto/beclean"],
      ["Para que serve o BeCalm?", "/produto/becalm"],
      ["Como uso o BeSoft?", "/produto/besoft"],
    ] as const;

    for (const [question, expectedLink] of cases) {
      const response = await generateRebkaAssistantMessage(question, [{ role: "user", content: question }], invalidModel as never);
      expect(response).toContain("**Sugestão Rebka:**");
      expect(response).toContain(expectedLink);
    }
  });
});
