import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { assistantInputSchema, fallbackAssistantReply, rebkaSystemPrompt, isSafetyQuestion, replyFromModelOutput } from "./rebkaAssistant";

const requestWindows = new Map<string, { count: number; resetAt: number }>();

function getModelText(content: string | Array<{ type: string; text?: string }> | undefined) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part): part is { type: "text"; text: string } => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n");
}

export function enforceChatRateLimit(forwardedFor: string | undefined) {
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = requestWindows.get(ip);
  if (!current || current.resetAt < now) {
    requestWindows.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return;
  }
  if (current.count >= 15) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Aguarde alguns minutos antes de enviar outra mensagem." });
  }
  current.count += 1;
}

type ChatHistory = Array<{ role: "user" | "assistant"; content: string }>;

export async function generateRebkaAssistantMessage(
  latestQuestion: string,
  history: ChatHistory,
  callModel: typeof invokeLLM = invokeLLM
) {
  if (isSafetyQuestion(latestQuestion)) return fallbackAssistantReply(latestQuestion);

  try {
    const response = await callModel({
      model: "gpt-5-mini",
      messages: [{ role: "system", content: rebkaSystemPrompt }, ...history],
      maxTokens: 1800,
      reasoning: { effort: "minimal" },
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rebka_assistant_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              answer: { type: "string" },
              recommendation: { type: "string", enum: ["beclean", "beglow", "becalm", "besoft"] },
              safety: { type: "boolean" },
            },
            required: ["answer", "recommendation", "safety"],
            additionalProperties: false,
          },
        },
      },
    });
    const raw = getModelText(response.choices[0]?.message?.content);
    return replyFromModelOutput(latestQuestion, raw);
  } catch (error) {
    console.error("[Rebka Assistant] Failed to generate response", error);
    return fallbackAssistantReply(latestQuestion);
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  assistant: router({
    reply: publicProcedure.input(assistantInputSchema).mutation(async ({ input, ctx }) => {
      enforceChatRateLimit(ctx.req.headers["x-forwarded-for"] as string | undefined);
      const latestQuestion = [...input.messages].reverse().find((message) => message.role === "user")?.content || "";
      const history = input.messages.map((message) => ({ role: message.role, content: message.content }));
      return { message: await generateRebkaAssistantMessage(latestQuestion, history) };
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
