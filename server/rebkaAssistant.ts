import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1200),
});

export const assistantOutputSchema = z.object({
  answer: z.string().trim().min(1).max(1600),
  recommendation: z.enum(["beclean", "beglow", "becalm", "besoft"]),
  safety: z.boolean(),
});

export const assistantInputSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(12),
});

export function parseAssistantOutput(raw: string) {
  try {
    const result = assistantOutputSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

const productLinks = {
  beclean: {
    name: "BeClean",
    link: "https://www.rebka.com.br/produto/beclean",
    reason: "é o primeiro passo prático para começar uma rotina simples.",
  },
  beglow: {
    name: "BeGlow",
    link: "https://www.rebka.com.br/produto/beglow",
    reason: "é o tônico facial em spray para complementar a etapa depois da limpeza.",
  },
  becalm: {
    name: "BeCalm",
    link: "https://www.rebka.com.br/produto/becalm",
    reason: "entra depois da limpeza como uma etapa de cuidado com textura leve.",
  },
  besoft: {
    name: "BeSoft",
    link: "https://www.rebka.com.br/produto/besoft",
    reason: "é a etapa de hidratação confortável para finalizar a rotina.",
  },
} as const;

const safetyTerms = /alerg|irrita|ardor|ardeu|ard[eê]ncia|ardend|queima|vermelhid|incha[cç]|dor|ferida|les[aã]o|dermatite|eczema|ros[aá]cea|acne|espinha|gr[aá]vid|gesta|amament|medicamento|rem[eé]dio|tratamento|p[oó]s.?procedimento/i;

export const isSafetyQuestion = (content: string) => safetyTerms.test(content);

export function inferRecommendedProduct(content: string): "beclean" | "beglow" | "becalm" | "besoft" {
  const normalized = content.toLowerCase();
  if (/(beglow|be glow|t[oô]nico|tonic)/i.test(normalized)) return "beglow";
  if (/(becalm|be calm|s[eé]rum)/i.test(normalized)) return "becalm";
  if (/(besoft|be soft|hidratante|hidrata[cç][aã]o)/i.test(normalized)) return "besoft";
  return "beclean";
}

export const rebkaSystemPrompt = `
Você é a assistente digital da Rebka Beauty, uma marca brasileira de skincare. Fale em português do Brasil com um tom acolhedor, claro, jovem e respeitoso. Responda primeiro à pergunta com no máximo dois parágrafos curtos.

Informações confirmadas: BeClean é um gel de limpeza facial de 120 ml, usado na pele úmida, massageado suavemente e enxaguado. BeGlow é um tônico facial em spray de 120 ml, aplicado sobre a pele limpa em borrifadas leves, evitando os olhos e seguindo o rótulo. BeCalm é um sérum facial de 30 ml, aplicado em poucas gotas sobre a pele limpa e espalhado até a absorção. BeSoft é um creme hidratante de 30 ml, aplicado em pequena quantidade sobre o rosto limpo, pela manhã e à noite conforme o rótulo. A sequência sugerida é limpar, tonificar, aplicar sérum e hidratar. A página pode oferecer combo de dois itens com 20% de desconto e parcelamento em até 6x sem juros; ambas as condições devem ser confirmadas no checkout.

Nunca invente ingredientes, resultados, disponibilidade, preços, prazo de entrega, cupom, política, avaliação de cliente ou alegação como hipoalergênico, vegano, cruelty-free, dermatologicamente testado e não comedogênico. Não faça diagnóstico e não prometa tratar acne, alergias, manchas, dermatite ou qualquer condição. Em perguntas sobre reação, alergia, ardor, dor, lesão, acne persistente, medicação, gravidez, amamentação ou pós-procedimento, oriente interromper o uso se houve reação, conferir o rótulo e buscar orientação profissional; não incentive uso individual.

Retorne SOMENTE JSON válido com as chaves answer, recommendation e safety. recommendation deve ser beclean, beglow, becalm ou besoft. safety deve ser true quando a orientação exige cautela de saúde. answer não deve conter preço, link, recomendação final nem markdown.`;

export function finalizeAssistantReply(output: z.infer<typeof assistantOutputSchema>) {
  const product = productLinks[output.recommendation];
  const suffix = output.safety
    ? `**Informações do produto:** **${product.name}** — confira o rótulo completo antes de decidir pelo uso.\n**Ver produto:** [${product.link}](${product.link})`
    : `**Sugestão Rebka:** **${product.name}** — ${product.reason}\n**Ver produto:** [${product.link}](${product.link})`;

  return `${output.answer.trim()}\n\n${suffix}`;
}

export function fallbackAssistantReply(content: string) {
  const safety = isSafetyQuestion(content);
  return finalizeAssistantReply({
    answer: safety
      ? "Para uma dúvida de saúde ou sensibilidade, é importante conferir o rótulo completo e pedir orientação a um profissional antes de incluir um produto novo na rotina."
      : "Posso ajudar você a montar uma rotina simples. Para começar, limpar a pele e depois hidratar costuma ser uma sequência direta e fácil de manter.",
    recommendation: inferRecommendedProduct(content),
    safety,
  });
}

export function replyFromModelOutput(question: string, raw: string) {
  const parsed = parseAssistantOutput(raw);
  if (!parsed) return fallbackAssistantReply(question);
  return finalizeAssistantReply({ ...parsed, safety: false });
}
