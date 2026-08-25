/* Editorial Rosé Sensorial: home comercial assimétrica, arejada e guiada por fotografia realista de skincare. */
import { ProductCard } from "@/components/ProductCard";
import { StoreHeader } from "@/components/StoreHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { assets, categories, products, type Product } from "@/data/store";
import {
  ArrowRight,
  Check,
  CreditCard,
  FlaskConical,
  Leaf,
  PackageCheck,
  Recycle,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const benefits = [
  { icon: Truck, title: "Frete grátis", text: "Acima de R$ 299" },
  { icon: CreditCard, title: "Até 10x sem juros", text: "Compra tranquila" },
  { icon: Recycle, title: "Embalagens conscientes", text: "Menos impacto" },
  { icon: ShieldCheck, title: "Cuidado responsável", text: "Rotina segura" },
];

const routineOptions = [
  {
    id: "equilibrio",
    label: "Equilíbrio diário",
    description: "Quero uma rotina simples e constante.",
    products: ["BeClean", "BeSoft"],
  },
  {
    id: "sensibilidade",
    label: "Conforto e calma",
    description: "Minha pele pede delicadeza.",
    products: ["BeClean", "BeCalm"],
  },
  {
    id: "hidratacao",
    label: "Hidratação intensa",
    description: "Busco maciez e viço.",
    products: ["BeCalm", "BeSoft"],
  },
];

export default function Home() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [routine, setRoutine] = useState(routineOptions[0]);

  const visibleProducts = useMemo(
    () => activeCategory === "todos" ? products : products.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  const addToCart = (product: Product) => {
    setCartItems((items) => [...items, product]);
    toast.success(`${product.name} entrou na sua sacola`, {
      description: "Você pode revisar os itens no topo da página.",
    });
  };

  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    document.querySelector("#produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader cartItems={cartItems} />

      <main>
        <section id="inicio" className="hero-section" aria-labelledby="hero-title">
          <img src={assets.hero} alt="Linha de skincare Rebka em composição rosé" className="hero-image" />
          <div className="container hero-content">
            <div className="hero-copy reveal">
              <span className="eyebrow">Cuidado que entende sua pele</span>
              <h1 id="hero-title">Skincare que conecta com você.</h1>
              <p>Fórmulas essenciais para uma rotina simples, confortável e cheia de intenção.</p>
              <div className="hero-actions">
                <Button size="lg" asChild>
                  <a href="#produtos">Conheça os produtos <ArrowRight size={17} /></a>
                </Button>
                <a className="text-link" href="#rotina">Descobrir minha rotina</a>
              </div>
            </div>
          </div>
        </section>

        <div className="benefit-wrap container" aria-label="Benefícios da loja">
          <div className="benefit-strip">
            {benefits.map(({ icon: Icon, title, text }) => (
              <div className="benefit-item" key={title}>
                <Icon size={21} />
                <div><strong>{title}</strong><span>{text}</span></div>
              </div>
            ))}
          </div>
        </div>

        <section id="categorias" className="section-block container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Encontre seu cuidado</span>
              <h2>Escolha por categoria</h2>
            </div>
            <a href="#produtos" className="text-link">Ver todos <ArrowRight size={15} /></a>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                className="category-card reveal"
                style={{ animationDelay: `${index * 45}ms` }}
                onClick={() => chooseCategory(category.id)}
              >
                <div className="category-image">
                  <img src={category.image} alt="" loading="lazy" />
                </div>
                <div>
                  <strong>{category.title}</strong>
                  <span>{category.description}</span>
                </div>
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
        </section>

        <section id="produtos" className="products-section">
          <div className="container">
            <div className="section-heading products-heading">
              <div>
                <span className="eyebrow">Favoritos da rotina</span>
                <h2>Cuidados essenciais</h2>
              </div>
              <div className="filter-tabs" aria-label="Filtrar produtos">
                {["todos", "limpeza", "seruns", "hidratacao", "kits"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={activeCategory === filter ? "active" : ""}
                    onClick={() => setActiveCategory(filter)}
                  >
                    {filter === "todos" ? "Todos" : filter}
                  </button>
                ))}
              </div>
            </div>
            <div className="catalog-ritual-note">
              <img src={assets.logo} alt="" />
              <span><strong>Ritual Rebka</strong> Três gestos essenciais: limpar, acalmar e hidratar.</span>
              <span className="serum-line" aria-hidden="true" />
            </div>
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          </div>
        </section>

        <section id="rotina" className="routine-section container">
          <div className="routine-copy">
            <span className="eyebrow">Sua pele, no ritmo certo</span>
            <h2>Monte uma rotina que combina com você.</h2>
            <p>Escolha sua prioridade e veja uma sugestão simples de cuidado para começar.</p>
            <div className="routine-options">
              {routineOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={routine.id === option.id ? "routine-option active" : "routine-option"}
                  onClick={() => setRoutine(option)}
                >
                  <span className="routine-check"><Check size={15} /></span>
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                </button>
              ))}
            </div>
          </div>
          <div className="routine-result">
            <img src={assets.modelCalm} alt="Modelo adulta aplicando o sérum BeCalm" loading="lazy" />
            <div className="routine-card">
              <span>Sua sugestão</span>
              <h3>{routine.label}</h3>
              <ul>
                {routine.products.map((name, index) => (
                  <li key={name}><b>{index + 1}</b><span>{name}</span></li>
                ))}
              </ul>
              <Button onClick={() => toast("Rotina selecionada", { description: routine.products.join(" + ") })}>
                Escolher esta rotina
              </Button>
            </div>
          </div>
        </section>

        <section className="editorial-section" aria-labelledby="ritual-title">
          <div className="container">
            <div className="editorial-intro">
              <span className="eyebrow">Pequenos rituais, todos os dias</span>
              <h2 id="ritual-title">Texturas leves. Gestos simples. Pele bem cuidada.</h2>
            </div>
            <div className="editorial-grid">
              <figure className="editorial-card tall">
                <img src={assets.modelSoft} alt="Modelo adulta aplicando o hidratante BeSoft" loading="lazy" />
                <figcaption><span>Hidratar</span><strong>Conforto que se sente.</strong></figcaption>
              </figure>
              <figure className="editorial-card">
                <img src={assets.modelClean} alt="Modelo adulta usando o gel de limpeza BeClean" loading="lazy" />
                <figcaption><span>Limpar</span><strong>Leveza desde o primeiro passo.</strong></figcaption>
              </figure>
              <figure className="editorial-card">
                <img src={assets.modelCalm} alt="Modelo adulta usando o sérum BeCalm" loading="lazy" />
                <figcaption><span>Acalmar</span><strong>Um momento só seu.</strong></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="sobre" className="manifesto-section container">
          <div className="manifesto-mark"><img src={assets.logo} alt="" /></div>
          <div className="manifesto-copy">
            <span className="eyebrow">A Rebka</span>
            <h2>Beleza conectada ao que realmente importa.</h2>
            <p>Acreditamos em rotinas possíveis, escolhas conscientes e produtos que ocupam o tempo certo — nem mais, nem menos.</p>
          </div>
          <div className="manifesto-values">
            <div><FlaskConical size={21} /><span><strong>Fórmulas inteligentes</strong><small>Ativos escolhidos com propósito</small></span></div>
            <div><Leaf size={21} /><span><strong>Ciência + natureza</strong><small>Equilíbrio em cada detalhe</small></span></div>
            <div><PackageCheck size={21} /><span><strong>Design consciente</strong><small>Embalagens pensadas melhor</small></span></div>
            <div><Sparkles size={21} /><span><strong>Rotina essencial</strong><small>Cuidado sem complicação</small></span></div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
