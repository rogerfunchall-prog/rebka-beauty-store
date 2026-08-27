# Validação da IA de Atendimento — Rebka Beauty

- O painel de atendimento abre pelo botão flutuante “Ajuda” na página inicial.
- A pergunta “Como uso o BeSoft?” foi enviada pela interface e recebeu resposta no painel.
- A resposta exibiu uma recomendação final do BeSoft e link direto para a página de produto.
- As respostas sobre reação de pele seguem o fallback seguro no servidor, sem orientar novo uso do produto.
- O limite de 15 solicitações por janela de 10 minutos foi validado na rota com endereço de teste isolado.

Na validação visual do navegador, o painel mostrou o estado de carregamento após o envio, renderizou a resposta com recomendação e link e exibiu a mensagem clara de limite quando a janela de solicitações foi excedida.

A simulação inicial de falha genérica foi interrompida antes da renderização da mensagem no painel. Na repetição controlada, a interface exibiu corretamente a mensagem “Não consegui responder agora. Tente novamente em instantes ou consulte a página do produto para ver as informações disponíveis.”
