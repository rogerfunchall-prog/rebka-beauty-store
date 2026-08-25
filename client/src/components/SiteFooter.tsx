/* Editorial Rosé Sensorial: rodapé compartilhado com navegação clara, confiança institucional e crédito do estúdio. */
import { Button } from "@/components/ui/button";
import { assets } from "@/data/store";
import { MessageCircle } from "lucide-react";
import { type FormEvent } from "react";
import { toast } from "sonner";

export function SiteFooter() {
  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "");
    if (!email.includes("@")) {
      toast.error("Digite um e-mail válido.");
      return;
    }
    toast.success("Seu e-mail foi cadastrado!", { description: "A integração de envio será conectada futuramente." });
    event.currentTarget.reset();
  };

  return (
    <>
      <footer className="site-footer">
        <div className="container newsletter-row">
          <div>
            <span className="eyebrow">Entre para o círculo Rebka</span>
            <h2>Novidades, cuidados e ofertas especiais.</h2>
          </div>
          <form onSubmit={subscribe} className="newsletter-form">
            <input name="email" type="email" placeholder="Seu melhor e-mail" aria-label="Seu melhor e-mail" />
            <Button type="submit">Quero receber</Button>
          </form>
        </div>
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="brand-lockup"><img src={assets.logo} alt="Rebka — Skin Care That Connects" className="brand-logo-official footer-logo" /></div>
            <p>Skincare brasileiro que conecta com você.<br />Qualidade alta, rotina possível e preço justo.</p>
          </div>
          <div><strong>Ajuda</strong><a href="/#produtos">Dúvidas frequentes</a><a href="/conta">Rastreamento</a><a href="/conta">Trocas e devoluções</a></div>
          <div><strong>Informações</strong><a href="/empresa">Sobre a Rebka</a><a href="/#rotina">Ingredientes</a><a href="/empresa#valores">Nossos valores</a></div>
          <div><strong>Contato</strong><a href="mailto:oi@rebka.com.br">oi@rebka.com.br</a><span>Seg–Sex, 9h às 18h</span></div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Rebka Beauty. Projeto demonstrativo front-end.</span>
          <span className="developer-credit">Loja Inteligente Desenvolvida por <a href="https://www.happapps.com.br" target="_blank" rel="noreferrer">Happ Apps</a></span>
        </div>
      </footer>
      <button
        type="button"
        className="support-button"
        aria-label="Falar com a Rebka"
        onClick={() => toast("Atendimento Rebka", { description: "O chat será conectado quando o canal de atendimento estiver definido." })}
      >
        <MessageCircle size={22} />
      </button>
    </>
  );
}
