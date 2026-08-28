export type Product = {
  id: string;
  name: string;
  subtitle: string;
  shortDescription: string;
  longDescription: string;
  benefits: string[];
  usage: string;
  size: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: "limpeza" | "tonicos" | "seruns" | "hidratacao" | "kits";
  badge?: string;
};

export const assets = {
  logo: "/manus-storage/rebka-logo-oficial_e24d4215.png",
  hero: "/manus-storage/rebka-hero-ritual-quatro-produtos_45350067.png",
  heroBesoft: "/manus-storage/rebka-hero-besoft-ritual_8ed361ef.png",
  categoryClean: "/manus-storage/rebka-category-limpeza_88dd72d9.png",
  categoryHydration: "/manus-storage/rebka-category-hidratacao_e08a0daf.png",
  categorySerum: "/manus-storage/rebka-category-seruns_5f19b540.png",
  beClean: "/manus-storage/rebka_beclean_catalogo_1400x1400_41a3f048.png",
  beCalm: "/manus-storage/rebka_becalm_catalogo_1400x1400_dda69c85.png",
  beSoft: "/manus-storage/rebka_besoft_catalogo_1400x1400_fa8748e6.png",
  beGlow: "/manus-storage/rebka_beglow_catalogo_1400x1400_8b2f24b7.png",
  modelClean: "/manus-storage/rebka_beclean_modelo_1400x1400_0a4b31ec.png",
  modelCalm: "/manus-storage/rebka_becalm_modelo_1400x1400_0df1a926.png",
  modelSoft: "/manus-storage/rebka_besoft_modelo_loira_1400x1400_f0ea9238.png",
  modelGlow: "/manus-storage/rebka_beglow_modelo_1400x1400_cd6f9f64.png",
};

export const products: Product[] = [
  {
    id: "beclean",
    name: "BeClean",
    subtitle: "Gel de Limpeza Facial",
    shortDescription: "Limpeza gentil para começar e terminar o dia com a pele confortável.",
    longDescription: "BeClean foi pensado para a rotina real das brasileiras: dias quentes, vida corrida e a vontade de cuidar da pele sem complicação. Sua textura em gel ajuda a remover impurezas e resíduos do cotidiano com um gesto simples, deixando uma sensação fresca e agradável para as próximas etapas do cuidado.",
    benefits: ["Textura leve em gel", "Uso diário e simples", "Sensação de frescor", "Prepara a pele para a rotina"],
    usage: "Aplique uma pequena quantidade sobre a pele úmida, massageie com movimentos suaves e enxágue completamente.",
    size: "120 ml",
    price: 89.9,
    oldPrice: 99.9,
    image: assets.beClean,
    category: "limpeza",
    badge: "Mais amado",
  },
  {
    id: "becalm",
    name: "BeCalm",
    subtitle: "Sérum Facial Calmante",
    shortDescription: "Um sérum leve para trazer conforto e cuidado ao ritmo da sua pele.",
    longDescription: "BeCalm entra na rotina como uma pausa gentil. A textura sérum espalha com facilidade e foi criada para acompanhar adolescentes e jovens que procuram um cuidado descomplicado, agradável e compatível com a vida brasileira.",
    benefits: ["Textura sérum leve", "Absorção confortável", "Rotina prática", "Combina com a hidratação"],
    usage: "Com a pele limpa, aplique poucas gotas no rosto e espalhe suavemente até a absorção.",
    size: "30 ml",
    price: 129.9,
    oldPrice: 149.9,
    image: assets.beCalm,
    category: "seruns",
    badge: "Pele sensível",
  },
  {
    id: "beglow",
    name: "BeGlow",
    subtitle: "Tônico Facial",
    shortDescription: "Um gesto leve de tônico facial para complementar a sua rotina depois da limpeza.",
    longDescription: "BeGlow é o tônico facial da Rebka, criado para entrar na rotina de quem gosta de um cuidado simples e bem pensado. A embalagem com válvula spray torna o momento de aplicação mais prático e transforma a etapa entre limpeza e hidratação em um pequeno ritual de autocuidado.",
    benefits: ["Tônico facial em spray", "Etapa prática após a limpeza", "Frasco de 120 ml", "Rotina leve e descomplicada"],
    usage: "Com a pele limpa, aplique em borrifadas leves, evitando o contato com os olhos. Siga sempre as orientações completas do rótulo.",
    size: "120 ml",
    price: 49.9,
    image: assets.beGlow,
    category: "tonicos",
    badge: "Novo",
  },
  {
    id: "besoft",
    name: "BeSoft",
    subtitle: "Creme Hidratante",
    shortDescription: "Hidratação confortável, leve e fácil de incluir todos os dias.",
    longDescription: "BeSoft é o hidratante essencial da rotina Rebka. Sua proposta é oferecer conforto sem pesar, em uma bisnaga prática que acompanha a vida fora de casa. Um cuidado feito para quem sabe o que quer: pele bem cuidada, qualidade e um preço conectado à realidade do Brasil.",
    benefits: ["Hidratação cotidiana", "Textura confortável", "Bisnaga prática", "Finalização suave"],
    usage: "Aplique uma pequena quantidade sobre o rosto limpo e espalhe até a absorção. Use pela manhã e à noite.",
    size: "30 ml",
    price: 79.9,
    oldPrice: 89.9,
    image: assets.beSoft,
    category: "hidratacao",
    badge: "Essencial",
  },
  {
    id: "ritual-clean",
    name: "Ritual Clean",
    subtitle: "Limpeza que respeita a pele",
    shortDescription: "Uma dupla prática para transformar a limpeza em ritual.",
    longDescription: "O Ritual Clean reúne cuidados complementares para uma limpeza simples, delicada e consistente.",
    benefits: ["Duas etapas", "Rotina coordenada", "Compra prática", "Cuidado diário"],
    usage: "Siga a ordem indicada nas embalagens e adapte a frequência ao conforto da sua pele.",
    size: "2 etapas",
    price: 149.9,
    image: assets.categoryClean,
    category: "kits",
  },
  {
    id: "duo-calm",
    name: "Duo Calm",
    subtitle: "Sérum + hidratação diária",
    shortDescription: "Duas texturas leves para acalmar e hidratar a rotina.",
    longDescription: "O Duo Calm combina BeCalm e BeSoft para criar uma sequência de cuidado curta, confortável e fácil de manter.",
    benefits: ["Dois produtos", "Rotina simples", "Texturas leves", "Cuidado complementar"],
    usage: "Aplique primeiro o sérum e finalize com o hidratante.",
    size: "2 produtos",
    price: 189.9,
    image: assets.categorySerum,
    category: "kits",
    badge: "Economize 10%",
  },
  {
    id: "trio-essencial",
    name: "Trio Essencial",
    subtitle: "Rotina completa Rebka",
    shortDescription: "Limpar, acalmar e hidratar em três gestos essenciais.",
    longDescription: "O Trio Essencial reúne BeClean, BeCalm e BeSoft em uma rotina completa e objetiva para o dia a dia.",
    benefits: ["Três produtos", "Rotina completa", "Etapas coordenadas", "Compra simplificada"],
    usage: "Use BeClean, depois BeCalm e finalize com BeSoft.",
    size: "3 produtos",
    price: 269.9,
    image: assets.hero,
    category: "kits",
    badge: "Rotina completa",
  },
];

export const categories = [
  {
    id: "limpeza",
    title: "Limpeza",
    description: "Comece leve",
    image: assets.categoryClean,
  },
  {
    id: "seruns",
    title: "Séruns",
    description: "Cuidado concentrado",
    image: assets.categorySerum,
  },
  {
    id: "tonicos",
    title: "Tônicos",
    description: "Um gesto de frescor",
    image: assets.beGlow,
  },
  {
    id: "hidratacao",
    title: "Hidratação",
    description: "Conforto que permanece",
    image: assets.categoryHydration,
  },
  {
    id: "kits",
    title: "Kits",
    description: "Rituais completos",
    image: assets.hero,
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
