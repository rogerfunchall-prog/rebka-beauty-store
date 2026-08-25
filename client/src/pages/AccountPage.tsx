/* Editorial Rosé Sensorial: área de conta acolhedora, segura e transparente, sem simular dados pessoais persistidos. */
import { SiteFooter } from "@/components/SiteFooter";
import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import "../account.css";

const accountFeatures = [
  { icon: PackageCheck, title: "Meus pedidos", text: "Acompanhe compras e entregas quando a loja estiver conectada." },
  { icon: Heart, title: "Meus favoritos", text: "Guarde os cuidados que combinam com a sua rotina." },
  { icon: MapPin, title: "Meus endereços", text: "Deixe a próxima compra mais rápida e organizada." },
  { icon: UserRound, title: "Meus dados", text: "Mantenha suas preferências e informações em um só lugar." },
];

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "create">("login");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(mode === "login" ? "Acesso demonstrativo recebido" : "Cadastro demonstrativo recebido", {
      description: "A autenticação real será ativada quando o back-end da loja for conectado.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader cartItems={[]} />
      <main>
        <section className="account-hero">
          <div className="container account-hero-grid">
            <div className="account-intro">
              <span className="eyebrow">Seu espaço Rebka</span>
              <h1>Uma conta que acompanha a sua rotina.</h1>
              <p>Entre para organizar pedidos, guardar favoritos e deixar seus próximos cuidados mais simples.</p>
              <div className="account-trust-line"><ShieldCheck size={20} /><span>Seus dados só serão armazenados quando a autenticação segura estiver conectada.</span></div>
            </div>

            <div className="account-access-card">
              <div className="account-mode-tabs" role="tablist" aria-label="Acesso à conta">
                <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Entrar</button>
                <button type="button" className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}>Criar conta</button>
              </div>
              <div className="account-card-heading">
                <span className="account-icon"><UserRound size={21} /></span>
                <div><h2>{mode === "login" ? "Que bom ter você de volta." : "Seu cuidado começa por aqui."}</h2><p>{mode === "login" ? "Acesse sua área pessoal." : "Crie uma conta para uma experiência mais prática."}</p></div>
              </div>
              <form className="account-form" onSubmit={submit}>
                {mode === "create" && <label>Como podemos chamar você?<input name="name" type="text" placeholder="Seu primeiro nome" required /></label>}
                <label>E-mail<input name="email" type="email" placeholder="voce@email.com" required /></label>
                <label>Senha<input name="password" type="password" placeholder="Mínimo de 8 caracteres" minLength={8} required /></label>
                {mode === "create" && (
                  <label className="consent-line"><input type="checkbox" required /><span>Li e concordo com os termos e a política de privacidade.</span></label>
                )}
                <Button type="submit" size="lg">{mode === "login" ? "Entrar na minha conta" : "Criar minha conta"}<ArrowRight size={17} /></Button>
              </form>
              {mode === "login" && <button type="button" className="forgot-link" onClick={() => toast("Recuperação de senha", { description: "O envio do link será ativado com a autenticação." })}>Esqueci minha senha</button>}
              <div className="account-security"><LockKeyhole size={15} /><span>Área demonstrativa: nenhum dado é enviado ou armazenado.</span></div>
            </div>
          </div>
        </section>

        <section className="container account-features-section">
          <div className="section-heading">
            <div><span className="eyebrow">Tudo no seu ritmo</span><h2>Quando você entrar, sua área terá:</h2></div>
          </div>
          <div className="account-feature-grid">
            {accountFeatures.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="account-feature-card" style={{ animationDelay: `${index * 45}ms` }}>
                <Icon size={23} /><strong>{title}</strong><p>{text}</p><span>Disponível com a integração <ArrowRight size={14} /></span>
              </article>
            ))}
          </div>
        </section>

        <section className="account-care-section">
          <div className="container account-care-inner">
            <Sparkles size={26} />
            <div><span className="eyebrow">Feita para você</span><h2>Favoritos, histórico e uma rotina cada vez mais sua.</h2></div>
            <p>A conta Rebka será o ponto de encontro entre suas escolhas e uma experiência de compra simples, responsável e conectada.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
