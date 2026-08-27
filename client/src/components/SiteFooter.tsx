/* Editorial Rosé Sensorial: rodapé compartilhado com navegação clara, confiança institucional e crédito do estúdio. */
import { Button } from "@/components/ui/button";
import { assets } from "@/data/store";
import { type FormEvent } from "react";
import { toast } from "sonner";
import { RebkaAssistant } from "@/components/RebkaAssistant";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";

const socialNetworks = [
  { label: "Instagram", icon: FaInstagram },
  { label: "Facebook", icon: FaFacebookF },
  { label: "TikTok", icon: FaTiktok },
];

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
            <div className="footer-socials" aria-label="Canais sociais da Rebka">
              {socialNetworks.map(({ label, icon: Icon }) => (
                <button key={label} type="button" aria-label={`Abrir ${label} da Rebka`} onClick={() => toast(label, { description: "O perfil oficial será conectado assim que o canal for definido." })}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
          <div><strong>Ajuda</strong><a href="/#produtos">Dúvidas frequentes</a><a href="/conta">Rastreamento</a><a href="/conta">Trocas e devoluções</a></div>
          <div><strong>Informações</strong><a href="/empresa">Sobre a Rebka</a><a href="/#rotina">Ingredientes</a><a href="/empresa#valores">Nossos valores</a></div>
          <div><strong>Contato</strong><a href="mailto:oi@rebka.com.br">oi@rebka.com.br</a><span>Seg–Sex, 9h às 18h</span></div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Rebka Beauty. Todos os direitos reservados.</span>
          <span className="developer-credit">Loja Inteligente Desenvolvida por <a href="https://www.happapps.com.br" target="_blank" rel="noreferrer">Happ Apps</a></span>
        </div>
      </footer>
      <RebkaAssistant />
    </>
  );
}
