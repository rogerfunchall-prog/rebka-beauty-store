# Direção visual — Rebka Beauty

## Referência como especificação principal

O layout fornecido pela usuária é a referência central do projeto. A estrutura deve preservar: barra promocional superior, cabeçalho claro com navegação compacta, hero rosé assimétrico, faixa de benefícios, categorias em cartões horizontais, vitrine de produtos, seção de diagnóstico de pele e rodapé editorial. A composição será recriada como uma experiência responsiva e contemporânea, sem copiar ativos de terceiros nem adicionar back-end.

## Abordagem escolhida: Editorial Rosé Sensorial

**Design Movement:** minimalismo editorial de beleza contemporânea, inspirado em campanhas de skincare premium e catálogos cosméticos brasileiros.

**Core Principles:** hierarquia editorial clara; delicadeza sem aparência infantil; fotografia realista do produto; equilíbrio entre áreas claras, blocos rosé e detalhes vinho; interface orientada à compra com baixa fricção.

**Color Philosophy:** a paleta oficial do site combina o rosa principal `#F2A7B4` para ações e assinatura, o rosa médio `#F7C6CE` para blocos sensoriais, o rosa claro `#FDEBEB` para grandes fundos e o branco `#FFFFFF` para superfícies e respiro. Textos em tinta escura são mantidos exclusivamente para assegurar leitura e contraste.

**Layout Paradigm:** navegação horizontal leve, hero assimétrico dividido entre copy e fotografia, faixas editoriais sobrepostas, carrosséis horizontais no mobile e grades arejadas no desktop. O conteúdo alterna superfícies brancas e névoa rosé para criar ritmo.

**Signature Elements:** cápsulas rosé finas; linhas curvas que lembram o movimento de um sérum; molduras verticais com recortes suaves para fotos de produto; pequenos selos circulares com ícones lineares.

**Interaction Philosophy:** microinterações discretas e rápidas. Produtos elevam poucos pixels no hover, botões comprimem ao clique, gavetas aparecem com transição curta e mensagens de confirmação substituem fluxos de back-end.

**Animation:** entradas com opacidade e deslocamento vertical curto; cascata de 45 ms nos cartões; duração entre 160 e 260 ms; somente transform e opacity; respeito a `prefers-reduced-motion`.

**Typography System:** `Montserrat` em toda a experiência para manter unidade com o branding oficial. Títulos usam peso 500 e espaçamento negativo controlado; corpo, navegação, preços e controles alternam pesos 400, 500, 600 e 700. Letras maiúsculas ficam restritas à microcopy e às etiquetas.

**Brand Essence:** skincare essencial para pessoas que buscam uma rotina bonita, simples e consciente. Personalidade: **acolhedora, inteligente, delicada**.

**Brand Voice:** manchetes curtas, sensoriais e claras; CTAs diretos e gentis; microcopy que orienta sem prometer resultados médicos. Exemplos: “Sua pele, no ritmo certo.” e “Encontre o cuidado que combina com você.”

**Wordmark & Logo:** o wordmark oficial “rebka” possui construção linear, delicada e customizada, acompanhado da assinatura “SKIN CARE THAT CONNECTS”. Ele deve aparecer integralmente no cabeçalho, rodapé e aplicações institucionais, sem reconstrução tipográfica.

**Signature Brand Color:** Rosa Rebka `#F2A7B4`, acompanhado por `#F7C6CE`, `#FDEBEB` e `#FFFFFF`.

## Aplicação por arquivo

Todo arquivo de página, componente ou CSS deverá trazer no topo um comentário curto reforçando sua função dentro da linguagem Editorial Rosé Sensorial.

## Style Decisions

- O símbolo de pétala/R deve reaparecer como selo editorial em títulos, cartões de rotina, manifesto e rodapé.
- As áreas de catálogo devem quebrar o ritmo de prateleira convencional com cards destacados, composições horizontais e notas de ritual.
- A linguagem de motivos próprios é “curvas de sérum + selos de pétala + cápsulas rosé finas”; arredondamentos genéricos devem ser evitados quando não reforçam um desses elementos.
- Hierarquia editorial: cada página deve ter uma mensagem principal em escala display Montserrat 500–600; microcopy em maiúsculas funciona apenas como etiqueta de apoio.
- Motivos Rebka: todo bloco editorial importante deve usar ao menos um sinal próprio — curva de sérum, selo da marca ou cápsula rosé fina.
- Ritmo visual: grandes áreas claras ou rosé devem ser ancoradas por fotografia, produto, selo, texto editorial ou composição assimétrica para que o respiro pareça luxo, não vazio.

## Direção mobile premium

No mobile, a Rebka deve parecer uma experiência de descoberta: hero de campanha, trilhos horizontais com snap para categorias e produtos, cartões com camadas suaves e chamadas de compra fáceis de alcançar. A linguagem é confiante e contemporânea, criada para adolescentes informadas que esperam estética, clareza e autonomia — sem infantilização, excesso de ruído ou promessas irreais.

- Campos, contadores, badges, links e estados demonstrativos devem usar a mesma cápsula rosé e a mesma geometria editorial dos demais componentes.
- Áreas rosé extensas precisam ser ancoradas por fotografia, curva de sérum, wordmark, selo ou sobreposição assimétrica.
- Rosa principal é reservado para ações e sinais de marca; branco e rosa muito claro sustentam o espaço de leitura para um resultado maduro e premium.

## Expansão multipágina

As novas páginas preservam o mesmo cabeçalho, a paleta oficial e o rodapé compartilhado. A experiência permanece estática, mas todas as ações demonstrativas devem responder com feedback claro, sem sugerir que autenticação, pagamentos ou avaliações foram efetivamente persistidos.

| Página | Estrutura principal | Decisão de experiência |
|---|---|---|
| Produto | Galeria, nome, preços, 6x sem juros, descrições, benefícios, relacionados e combo | O combo combina dois produtos reais e calcula 20% de desconto localmente. |
| Conta | Boas-vindas, acesso demonstrativo, pedidos, favoritos e dados pessoais | A interface mostra estados úteis sem alegar autenticação ou histórico real. |
| Empresa | Origem brasileira, missão, visão, valores e compromisso com preço justo | A voz fala com adolescentes de forma confiante, respeitosa e sem infantilização. |

**Avaliações:** comentários, notas e depoimentos não serão fabricados. A página exibirá uma área preparada para avaliações de compradores verificados, com estado inicial transparente e chamada para futura integração de dados reais.
