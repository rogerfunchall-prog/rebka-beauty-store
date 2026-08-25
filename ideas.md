# Direção visual — Rebka Beauty

## Referência como especificação principal

O layout fornecido pela usuária é a referência central do projeto. A estrutura deve preservar: barra promocional superior, cabeçalho claro com navegação compacta, hero rosé assimétrico, faixa de benefícios, categorias em cartões horizontais, vitrine de produtos, seção de diagnóstico de pele e rodapé editorial. A composição será recriada como uma experiência responsiva e contemporânea, sem copiar ativos de terceiros nem adicionar back-end.

## Abordagem escolhida: Editorial Rosé Sensorial

**Design Movement:** minimalismo editorial de beleza contemporânea, inspirado em campanhas de skincare premium e catálogos cosméticos brasileiros.

**Core Principles:** hierarquia editorial clara; delicadeza sem aparência infantil; fotografia realista do produto; equilíbrio entre áreas claras, blocos rosé e detalhes vinho; interface orientada à compra com baixa fricção.

**Color Philosophy:** o rosé funciona como cor emocional de cuidado e proximidade, enquanto o vinho profundo dá autoridade e contraste. Marfim e branco quente ampliam a sensação de pele limpa e fórmula suave. A cor principal exclusiva da marca será **Rosa Rebka #C65270**.

**Layout Paradigm:** navegação horizontal leve, hero assimétrico dividido entre copy e fotografia, faixas editoriais sobrepostas, carrosséis horizontais no mobile e grades arejadas no desktop. O conteúdo alterna superfícies brancas e névoa rosé para criar ritmo.

**Signature Elements:** cápsulas rosé finas; linhas curvas que lembram o movimento de um sérum; molduras verticais com recortes suaves para fotos de produto; pequenos selos circulares com ícones lineares.

**Interaction Philosophy:** microinterações discretas e rápidas. Produtos elevam poucos pixels no hover, botões comprimem ao clique, gavetas aparecem com transição curta e mensagens de confirmação substituem fluxos de back-end.

**Animation:** entradas com opacidade e deslocamento vertical curto; cascata de 45 ms nos cartões; duração entre 160 e 260 ms; somente transform e opacity; respeito a `prefers-reduced-motion`.

**Typography System:** `Cormorant Garamond` para títulos e destaques editoriais; `Manrope` para navegação, textos, preços e controles. Títulos em peso 500, corpo entre 400 e 600, letras maiúsculas apenas em microcopy e etiquetas.

**Brand Essence:** skincare essencial para pessoas que buscam uma rotina bonita, simples e consciente. Personalidade: **acolhedora, inteligente, delicada**.

**Brand Voice:** manchetes curtas, sensoriais e claras; CTAs diretos e gentis; microcopy que orienta sem prometer resultados médicos. Exemplos: “Sua pele, no ritmo certo.” e “Encontre o cuidado que combina com você.”

**Wordmark & Logo:** símbolo gráfico formado por duas pétalas espelhadas que também sugerem um “R” abstrato, combinado a um wordmark fino e customizado. O símbolo deve funcionar isoladamente no favicon e em selos.

**Signature Brand Color:** Rosa Rebka `#C65270`.

## Aplicação por arquivo

Todo arquivo de página, componente ou CSS deverá trazer no topo um comentário curto reforçando sua função dentro da linguagem Editorial Rosé Sensorial.

## Style Decisions

- O símbolo de pétala/R deve reaparecer como selo editorial em títulos, cartões de rotina, manifesto e rodapé.
- As áreas de catálogo devem quebrar o ritmo de prateleira convencional com cards destacados, composições horizontais e notas de ritual.
- A linguagem de motivos próprios é “curvas de sérum + selos de pétala + cápsulas rosé finas”; arredondamentos genéricos devem ser evitados quando não reforçam um desses elementos.
