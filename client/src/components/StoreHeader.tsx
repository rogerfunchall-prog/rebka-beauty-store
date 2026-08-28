/* Editorial Rosé Sensorial: navegação leve, funcional e sempre legível para uma experiência de compra acolhedora. */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { toast } from "sonner";
import { assets, formatPrice, type Product } from "@/data/store";

type StoreHeaderProps = {
  cartItems: Product[];
};

const navItems = [
  ["Produtos", "/#produtos"],
  ["Categorias", "/#categorias"],
  ["Sua rotina", "/#rotina"],
  ["Sobre", "/empresa"],
  ["Minha conta", "/conta"],
];

export function StoreHeader({ cartItems }: StoreHeaderProps) {
  const cartTotal = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <>
      <div className="promo-bar">
        <span>Frete grátis acima de R$ 299</span>
        <span className="promo-dot" aria-hidden="true" />
        <span>10% OFF na primeira compra: <strong>REBKA10</strong></span>
      </div>
      <header className="store-header">
        <div className="container header-inner">
          <a href="/" className="brand-lockup" aria-label="Rebka Beauty — início">
            <img src={assets.logo} alt="Rebka — Skin Care That Connects" className="brand-logo-official" />
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            {navItems.map(([label, href]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="icon-button" aria-label="Buscar produtos">
                  <Search size={19} />
                </button>
              </DialogTrigger>
              <DialogContent className="search-dialog">
                <DialogHeader>
                  <DialogTitle>O que sua pele procura?</DialogTitle>
                  <DialogDescription>Busque por produto, etapa ou objetivo.</DialogDescription>
                </DialogHeader>
                <div className="search-field-wrap">
                  <Search size={18} />
                  <input autoFocus placeholder="Ex.: hidratação, limpeza..." aria-label="Termo de busca" />
                </div>
                <div className="search-suggestions">
                  <span>Mais buscados</span>
                  <a href="/produto/beclean">BeClean</a>
                  <a href="/produto/becalm">BeCalm</a>
                  <a href="/produto/besoft">BeSoft</a>
                </div>
              </DialogContent>
            </Dialog>

            <a href="/conta" className="icon-button desktop-only" aria-label="Minha conta">
              <UserRound size={19} />
            </a>
            <button
              type="button"
              className="icon-button desktop-only"
              aria-label="Meus favoritos"
              onClick={() => toast("Seus favoritos ficam salvos neste dispositivo.")}
            >
              <Heart size={19} />
            </button>

            <Sheet>
              <SheetTrigger asChild>
                <button type="button" className="icon-button cart-button" aria-label={`Sacola com ${cartItems.length} itens`}>
                  <ShoppingBag size={19} />
                  {cartItems.length > 0 && <span>{cartItems.length}</span>}
                </button>
              </SheetTrigger>
              <SheetContent className="cart-sheet">
                <SheetHeader>
                  <SheetTitle>Sua sacola</SheetTitle>
                  <SheetDescription>Revise os cuidados escolhidos para sua rotina.</SheetDescription>
                </SheetHeader>
                <div className="cart-list">
                  {cartItems.length === 0 ? (
                    <div className="empty-cart">
                      <ShoppingBag size={32} />
                      <p>Sua sacola ainda está leve.</p>
                      <span>Escolha um cuidado para começar.</span>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div className="cart-item" key={`${item.id}-${index}`}>
                        <img src={item.image} alt="" />
                        <div>
                          <strong>{item.name}</strong>
                          <span>{item.size}</span>
                        </div>
                        <b>{formatPrice(item.price)}</b>
                      </div>
                    ))
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="cart-summary">
                    <div><span>Total</span><strong>{formatPrice(cartTotal)}</strong></div>
                    <Button
                      className="w-full"
                      onClick={() => toast("Checkout em preparação", { description: "O pedido será integrado à operação Olist após a configuração do pagamento seguro." })}
                    >
                      Continuar compra
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <button type="button" className="icon-button mobile-menu-button" aria-label="Abrir menu">
                  <Menu size={21} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="mobile-menu-sheet">
                <SheetHeader>
                  <SheetTitle>
                    <img src={assets.logo} alt="Rebka — Skin Care That Connects" className="brand-logo-mobile" />
                  </SheetTitle>
                  <SheetDescription>Skincare que conecta com você.</SheetDescription>
                </SheetHeader>
                <nav className="mobile-nav" aria-label="Navegação móvel">
                  {navItems.map(([label, href]) => (
                    <a key={href} href={href}>{label}</a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
