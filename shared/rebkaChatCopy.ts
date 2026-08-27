export function getChatErrorMessage(code?: string) {
  if (code === "TOO_MANY_REQUESTS") {
    return "Você enviou muitas mensagens em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }
  return "Não consegui responder agora. Tente novamente em instantes ou consulte a página do produto para ver as informações disponíveis.";
}
