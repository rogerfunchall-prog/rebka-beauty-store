import { describe, expect, it } from "vitest";
import { fallbackAssistantReply, finalizeAssistantReply, inferRecommendedProduct, isSafetyQuestion, parseAssistantOutput, replyFromModelOutput } from "./rebkaAssistant";

describe("assistente Rebka", () => {
  it("detecta temas que exigem orientação segura", () => {
    expect(isSafetyQuestion("Minha pele ficou vermelha e ardendo")).toBe(true);
    expect(isSafetyQuestion("Minha pele ardeu depois do BeGlow")).toBe(true);
    expect(isSafetyQuestion("Qual a ordem da rotina?")).toBe(false);
  });

  it("sempre encerra recomendações com link direto do produto", () => {
    const response = finalizeAssistantReply({
      answer: "O hidratante entra ao final da rotina.",
      recommendation: "besoft",
      safety: false,
    });
    expect(response).toContain("**Sugestão Rebka:** **BeSoft**");
    expect(response).toContain("https://www.rebka.com.br/produto/besoft");
  });

  it("usa o fechamento informativo em situações de segurança", () => {
    const response = fallbackAssistantReply("Estou grávida e quero saber se posso usar");
    expect(response).toContain("**Informações do produto:**");
    expect(response).not.toContain("**Sugestão Rebka:**");
  });

  it("recupera uma resposta segura quando o modelo devolve JSON inválido", () => {
    expect(parseAssistantOutput("{resposta inválida")).toBeUndefined();
    const response = replyFromModelOutput("Como uso o BeSoft?", "{resposta inválida");
    expect(response).toContain("**Sugestão Rebka:**");
    expect(response).toContain("Ver produto:");
  });

  it("mantém a recomendação coerente no fallback para cada produto", () => {
    expect(inferRecommendedProduct("Como uso o BeClean?")).toBe("beclean");
    expect(inferRecommendedProduct("Para que serve o BeCalm?")).toBe("becalm");
    expect(inferRecommendedProduct("Como uso o BeSoft?")).toBe("besoft");
    expect(inferRecommendedProduct("Como uso o BeGlow?")).toBe("beglow");
    expect(fallbackAssistantReply("Como uso o BeSoft?")).toContain("/produto/besoft");
    expect(fallbackAssistantReply("Para que serve o BeCalm?")).toContain("/produto/becalm");
    expect(fallbackAssistantReply("Como uso o BeClean?")).toContain("/produto/beclean");
    expect(fallbackAssistantReply("Como uso o BeGlow?")).toContain("/produto/beglow");
  });
});
