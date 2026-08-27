/* Editorial Rosé Sensorial: atendimento que parece parte da marca, não uma janela genérica de chat. */
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { getChatErrorMessage } from "@shared/rebkaChatCopy";
import { MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

const suggestedPrompts = [
  "Qual produto uso primeiro?",
  "Como monto uma rotina simples?",
  "Para que serve o BeSoft?",
];

export function RebkaAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatMutation = trpc.assistant.reply.useMutation({
    onSuccess: ({ message }) => {
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    },
    onError: (error) => {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: getChatErrorMessage(error.data?.code),
        },
      ]);
    },
  });

  const sendMessage = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    chatMutation.mutate({
      messages: nextMessages.map(({ role, content: text }) => ({ role: role === "assistant" ? "assistant" : "user", content: text })),
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" className="rebka-chat-trigger" aria-label="Abrir atendimento Rebka">
          <MessageCircle size={22} />
          <span>Ajuda</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="rebka-chat-sheet" aria-describedby="rebka-chat-description">
        <SheetHeader className="rebka-chat-header">
          <div className="rebka-chat-mark"><Sparkles size={19} /></div>
          <div>
            <SheetTitle>Oi, eu sou a assistente Rebka.</SheetTitle>
            <SheetDescription id="rebka-chat-description">Tire dúvidas sobre os cuidados e encontre seu próximo produto.</SheetDescription>
          </div>
        </SheetHeader>
        <AIChatBox
          className="rebka-ai-chat"
          height="calc(100vh - 170px)"
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={chatMutation.isPending}
          placeholder="Escreva sua dúvida por aqui..."
          emptyStateMessage="O que você quer descobrir hoje?"
          suggestedPrompts={suggestedPrompts}
        />
        <div className="rebka-chat-safety"><ShieldCheck size={14} /><span>Atendimento informativo. Em caso de reação ou sensibilidade, procure orientação profissional.</span></div>
      </SheetContent>
    </Sheet>
  );
}
