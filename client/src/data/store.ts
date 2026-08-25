export type Product = {
  id: string;
  name: string;
  subtitle: string;
  size: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: "limpeza" | "seruns" | "hidratacao" | "kits";
  badge?: string;
};

export const assets = {
  logo: "/manus-storage/rebka-logo-oficial_e24d4215.png",
  hero: "/manus-storage/rebka-hero-products_101824a0.png",
  categoryClean: "/manus-storage/rebka-category-limpeza_88dd72d9.png",
  categoryHydration: "/manus-storage/rebka-category-hidratacao_e08a0daf.png",
  categorySerum: "/manus-storage/rebka-category-seruns_5f19b540.png",
  beClean: "/manus-storage/rebka_beclean_catalogo_1400x1400_41a3f048.png",
  beCalm: "/manus-storage/rebka_becalm_catalogo_1400x1400_dda69c85.png",
  beSoft: "/manus-storage/rebka_besoft_catalogo_1400x1400_fa8748e6.png",
  modelClean: "/manus-storage/rebka_beclean_modelo_1400x1400_0a4b31ec.png",
  modelCalm: "/manus-storage/rebka_becalm_modelo_1400x1400_0df1a926.png",
  modelSoft: "/manus-storage/rebka_besoft_modelo_loira_1400x1400_f0ea9238.png",
};

export const products: Product[] = [
  {
    id: "beclean",
    name: "BeClean",
    subtitle: "Gel de Limpeza Facial",
    size: "120 ml",
    price: 89.9,
    image: assets.beClean,
    category: "limpeza",
    badge: "Mais amado",
  },
  {
    id: "becalm",
    name: "BeCalm",
    subtitle: "Sérum Facial Calmante",
    size: "30 ml",
    price: 129.9,
    image: assets.beCalm,
    category: "seruns",
    badge: "Pele sensível",
  },
  {
    id: "besoft",
    name: "BeSoft",
    subtitle: "Creme Hidratante",
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
    size: "2 etapas",
    price: 149.9,
    image: assets.categoryClean,
    category: "kits",
  },
  {
    id: "duo-calm",
    name: "Duo Calm",
    subtitle: "Sérum + hidratação diária",
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
