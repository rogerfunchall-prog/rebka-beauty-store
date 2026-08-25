/* Editorial Rosé Sensorial: narrativa institucional brasileira, confiante e próxima das adolescentes que sabem o que querem. */
import { SiteFooter } from "@/components/SiteFooter";
import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { assets } from "@/data/store";
import { ArrowRight, BadgeCheck, HeartHandshake, MapPin, Sparkles, Target, Telescope } from "lucide-react";
import { Link } from "wouter";
import "../company.css";

const values = [
  { icon: BadgeCheck, title: "Qualidade sem atalhos", text: "Produtos pensados com critério, informação clara e uma experiência à altura do que nossas clientes esperam." },
  { icon: HeartHandshake, title: "Preço conectado ao Brasil", text: "Queremos tornar o cuidado de alta qualidade mais próximo da realidade das famílias brasileiras." },
  { icon: Sparkles, title: "Juventude com voz", text: "Respeitamos adolescentes que pesquisam, escolhem e sabem exatamente o que desejam para a própria rotina." },
  { icon: MapPin, title: "Olhar brasileiro", text: "Clima, diversidade, hábitos e ritmos do Brasil orientam a forma como imaginamos cada cuidado." },
];

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader cartItems={[]} />
      <main>
        <section className="company-hero">
          <div className="container company-hero-grid">
            <div className="company-hero-copy">
              <span className="eyebrow">Uma marca brasileira</span>
              <h1>A gente conhece a pele e o ritmo das mulheres do Brasil.</h1>
              <p>A Rebka Beauty nasceu para unir alta qualidade, escolhas simples e valores mais justos para o nosso país — com uma linguagem próxima de quem já sabe o que quer.</p>
              <Button size="lg" asChild><Link href="/#produtos">Conheça nossos cuidados <ArrowRight size={17} /></Link></Button>
            </div>
            <div className="company-hero-image">
              <img src={assets.modelSoft} alt="Jovem adulta apresentando o hidratante BeSoft" />
              <div className="company-origin-seal"><span>Nascida para</span><strong>o Brasil</strong><small>Skincare que conecta</small></div>
            </div>
          </div>
        </section>

        <section className="company-manifesto">
          <div className="container company-manifesto-grid">
            <div><span className="eyebrow">Nosso ponto de partida</span><h2>Beleza não precisa ser distante para ser excelente.</h2></div>
            <div className="company-manifesto-copy">
              <p>Nossa cliente é curiosa, conectada e exigente. Ela compara, pergunta, experimenta e constrói sua própria opinião. A Rebka existe para conversar com essa geração de forma direta: sem complicar a rotina, sem infantilizar escolhas e sem transformar cuidado em promessa impossível.</p>
              <p>Somos uma marca feita no Brasil e para o Brasil. Isso significa observar diferentes climas, tons de pele, estilos de vida e realidades econômicas ao desenvolver experiências que façam sentido por aqui.</p>
            </div>
          </div>
        </section>

        <section className="container purpose-section">
          <div className="section-heading"><div><span className="eyebrow">Para onde vamos</span><h2>Missão, visão e valores</h2></div></div>
          <div className="purpose-grid">
            <article className="purpose-card mission"><Target size={26} /><span>Missão</span><h3>Facilitar o cuidado com a pele.</h3><p>Oferecer produtos de alta qualidade, fáceis de entender e agradáveis de usar, com preços mais conectados à realidade brasileira.</p></article>
            <article className="purpose-card vision"><Telescope size={26} /><span>Visão</span><h3>Ser a marca escolhida por uma nova geração.</h3><p>Construir uma referência brasileira de skincare jovem, confiável e desejável, reconhecida pela proximidade, pela qualidade e pela transparência.</p></article>
            <article className="purpose-card values" id="valores"><HeartHandshake size={26} /><span>Valores</span><h3>Respeito em cada escolha.</h3><p>Escuta, clareza, responsabilidade, qualidade, acessibilidade e conexão genuína com as diferentes mulheres do nosso país.</p></article>
          </div>
        </section>

        <section className="company-audience-section">
          <div className="container company-audience-grid">
            <div className="company-audience-image"><img src={assets.modelCalm} alt="Jovem adulta usando o sérum BeCalm" /></div>
            <div className="company-audience-copy">
              <span className="eyebrow">Para quem sabe o que quer</span>
              <h2>Adolescentes com informação, personalidade e voz própria.</h2>
              <p>Nosso público não espera que uma marca dite regras. Ele procura informação simples, produtos bem apresentados e liberdade para montar uma rotina que combine com a própria pele e com a própria vida.</p>
              <div className="audience-statements"><span>Sem promessas exageradas</span><span>Sem rotina impossível</span><span>Sem linguagem infantil</span></div>
            </div>
          </div>
        </section>

        <section className="container company-values-section">
          <div className="section-heading"><div><span className="eyebrow">O que sustenta a Rebka</span><h2>Quatro compromissos, uma só marca.</h2></div></div>
          <div className="company-values-grid">
            {values.map(({ icon: Icon, title, text }, index) => <article key={title} style={{ animationDelay: `${index * 45}ms` }}><Icon size={22} /><strong>{title}</strong><p>{text}</p></article>)}
          </div>
        </section>

        <section className="company-final-cta">
          <div className="container company-final-inner"><img src={assets.logo} alt="Rebka — Skin Care That Connects" /><div><span className="eyebrow">Skin care that connects</span><h2>Seu cuidado. Sua escolha. Seu momento.</h2></div><Button asChild><Link href="/#rotina">Encontrar minha rotina <ArrowRight size={16} /></Link></Button></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
