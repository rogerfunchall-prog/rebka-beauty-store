import { describe, expect, it } from "vitest";
import { getChatErrorMessage } from "./RebkaAssistant";

describe("interface de atendimento Rebka", () => {
  it("fornece uma mensagem clara quando a solicitação falha", () => {
    expect(getChatErrorMessage()).toContain("Não consegui responder agora");
  });
});
