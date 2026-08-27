import { describe, expect, it } from "vitest";
import { getChatErrorMessage } from "../shared/rebkaChatCopy";

describe("mensagens de erro do chat Rebka", () => {
  it("informa o limite de solicitações de forma clara", () => {
    expect(getChatErrorMessage("TOO_MANY_REQUESTS")).toContain("muitas mensagens");
  });

  it("exibe uma orientação de recuperação em falhas gerais", () => {
    expect(getChatErrorMessage()).toContain("Tente novamente");
  });
});
