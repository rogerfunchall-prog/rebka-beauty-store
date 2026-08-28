/* Editorial Rosé Sensorial: página de produto informativa, comercial e transparente para uma compra sem fricção. */
import { ProductCard } from "@/components/ProductCard";
import { SiteFooter } from "@/components/SiteFooter";
import { StoreHeader } from "@/components/StoreHeader";
import { Button } from "@/components/ui/button";
import { assets, formatPrice, products, type Product } from "@/data/store";
import { mapOlistProductToStoreProduct } from "@/data/olistCatalog";
import { trpc } from "@/lib/trpc";
import { Check, ChevronRight, CreditCard, Heart, Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";

export default function ProductPage() {
  const [, params] = useRoute<{ id: string }>("/produto/:id");
  const olistCatalog = trpc.olist.storefrontProducts.useQuery();
  const catalogProducts = useMemo(() => {
    const remoteProducts = olistCatalog.data?.map(mapOlistProductToStoreProduct) ?? [];
    return remoteProducts.length > 0 ? remoteProducts : products;
  }, [olistCatalog.data]);
  const product = catalogProducts.find((item) => item.id === params?.id) ?? catalogProducts[0];
  const related = catalogProducts.filter((item) => item.id !== product.id).slice(0, 3);
  const comboOptions = catalogProducts.filter((item) => item.id !== product.id && item.category !== "kits").slice(0, 3);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [comboId, setComboId] = useState(comboOptions[0]?.id ?? "");

  const comboProduct = catalogProducts.find((item) => item.id === comboId) ?? comboOptions[0];
  const comboOriginal = product.price + (comboProduct?.price ?? 0);
  const comboPrice = comboOriginal * 0.8;
  const installment = product.price / 6;

  const gallery = useMemo(() => {
    const modelAsset = product.id === "beclean" ? "/manus-storage/rebka_beclean_modelo_1400x1400_0a4b31ec.png" : product.id === "beglow" ? assets.modelGlow : product.id === "besoft" ? "/manus-storage/rebka_besoft_modelo_loira_1400x1400_f0ea9238.png" : "/manus-storage/rebka_becalm_modelo_1400x1400_0df1a926.png";
    return product.images && product.images.length > 1 ? product.images.slice(0, 2) : [product.image, modelAsset];
  }, [product]);

  const addProduct = (item: Product, amount = 1) => {
    setCartItems((items) => [...items, ...Array.from({ length: amount }, () => item)]);
    toast.success(`${item.name} entrou na sua sacola`);
  };

  const addCombo = () => {
    if (!comboProduct) return;
    setCartItems((items) => [...items, product, comboProduct]);
    toast.success("Combo adicionado com 20% OFF", { description: `${product.name} + ${comboProduct.name}` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader cartItems={cartItems} />
      <main>
        <div className="container page-breadcrumb">
          <Link href="/">Início</Link><ChevronRight size={13} /><Link href="/#produtos">Produtos</Link><ChevronRight size={13} /><span>{product.name}</span>
        </div>

        <section className="container product-detail-layout">
          <div className="product-gallery">
            <div className="product-gallery-main"><img src={gallery[0]} alt={`${product.name} — ${product.subtitle}`} /></div>
            <div className="product-gallery-secondary"><img src={gallery[1]} alt={`${product.name} em uma rotina de skincare`} /></div>
          </div>

          <div className="product-purchase-panel">
            <span className="product-detail-kicker">{product.subtitle} · {product.size}</span>
            <h1>{product.name}</h1>
            <p className="product-short-description">{product.shortDescription}</p>
            <div className="product-detail-price">
              {product.oldPrice && <span>De {formatPrice(product.oldPrice)}</span>}
              <strong>{formatPrice(product.price)}</strong>
              {product.oldPrice && <b>Economize {formatPrice(product.oldPrice - product.price)}</b>}
            </div>
            <div className="installment-line"><CreditCard size={19} /><span>Em até <strong>6x de {formatPrice(installment)} sem juros</strong></span></div>
            <div className="purchase-actions">
              <div className="quantity-control" aria-label="Quantidade">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Diminuir quantidade"><Minus size={16} /></button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Aumentar quantidade"><Plus size={16} /></button>
              </div>
              <Button size="lg" onClick={() => addProduct(product, quantity)}><ShoppingBag size={18} /> Adicionar à sacola</Button>
              <button type="button" className="product-favorite" onClick={() => toast.success("Produto salvo nos favoritos")} aria-label="Favoritar produto"><Heart size={19} /></button>
            </div>
            <div className="purchase-assurances">
              <div><PackageCheck size={20} /><span><strong>Envio cuidadoso</strong><small>Embalagem preparada com atenção</small></span></div>
              <div><ShieldCheck size={20} /><span><strong>Compra tranquila</strong><small>Fluxo seguro quando o checkout for conectado</small></span></div>
            </div>
          </div>
        </section>

        <section className="product-story-section">
          <div className="container product-story-grid">
            <div>
              <span className="eyebrow">Cuidado pensado no Brasil</span>
              <h2>Simples de usar. Fácil de querer por perto.</h2>
              <p>{product.longDescription}</p>
              <h3>Como usar</h3>
              <p>{product.usage}</p>
            </div>
            <div className="benefits-panel">
              <span className="eyebrow">Por que ele combina com a rotina</span>
              {product.benefits.map((benefit) => <div key={benefit}><Check size={17} /><span>{benefit}</span></div>)}
            </div>
          </div>
        </section>

        {comboProduct && (
          <section className="container combo-section">
            <div className="section-heading">
              <div><span className="eyebrow">Monte seu combo</span><h2>Dois cuidados, 20% de desconto.</h2></div>
              <span className="combo-discount-badge">20% OFF</span>
            </div>
            <div className="combo-builder">
              <div className="combo-products">
                <div className="combo-product-card"><img src={product.image} alt="" /><strong>{product.name}</strong><span>{formatPrice(product.price)}</span></div>
                <Plus size={25} />
                <div className="combo-product-card"><img src={comboProduct.image} alt="" /><strong>{comboProduct.name}</strong><span>{formatPrice(comboProduct.price)}</span></div>
              </div>
              <div className="combo-options">
                <span>Combine com:</span>
                {comboOptions.map((item) => (
                  <button key={item.id} type="button" className={comboId === item.id ? "active" : ""} onClick={() => setComboId(item.id)}>
                    <img src={item.image} alt="" /><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><b>{formatPrice(item.price)}</b>
                  </button>
                ))}
              </div>
              <div className="combo-summary">
                <Sparkles size={24} />
                <span>Valor individual <s>{formatPrice(comboOriginal)}</s></span>
                <strong>{formatPrice(comboPrice)}</strong>
                <small>Economia de {formatPrice(comboOriginal - comboPrice)}</small>
                <Button onClick={addCombo}>Adicionar combo</Button>
              </div>
            </div>
          </section>
        )}

        <section className="reviews-section">
          <div className="container reviews-empty-state">
            <div><span className="eyebrow">Experiências reais</span><h2>Avaliações de quem comprou.</h2></div>
            <div className="verified-review-empty">
              <ShieldCheck size={32} />
              <h3>Ainda não há avaliações verificadas.</h3>
              <p>Quando o sistema de compras estiver conectado, somente comentários de clientes identificados como compradores serão publicados aqui.</p>
              <Button variant="outline" onClick={() => toast("Avaliações verificadas", { description: "O formulário será liberado para compradores após a integração da conta." })}>Como funcionará</Button>
            </div>
          </div>
        </section>

        <section className="container related-section">
          <div className="section-heading"><div><span className="eyebrow">Continue seu ritual</span><h2>Produtos relacionados</h2></div></div>
          <div className="related-grid">{related.map((item) => <ProductCard key={item.id} product={item} onAdd={addProduct} />)}</div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
