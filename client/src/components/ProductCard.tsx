/* Editorial Rosé Sensorial: card de produto com foco em fotografia, informação clara e microinterações discretas. */
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatPrice, type Product } from "@/data/store";
import { Link } from "wouter";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);

  const toggleFavorite = () => {
    setFavorite((current) => !current);
    toast(favorite ? "Removido dos favoritos" : "Salvo nos favoritos", {
      description: product.name,
    });
  };

  return (
    <article className="product-card group">
      <div className="product-media">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          type="button"
          aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
          className="favorite-button"
          onClick={toggleFavorite}
        >
          <Heart className={favorite ? "fill-current" : ""} size={18} />
        </button>
        <Link href={`/produto/${product.id}`} className="product-image-link">
          <img src={product.image} alt={`${product.name} — ${product.subtitle}`} loading="lazy" />
        </Link>
      </div>
      <div className="product-info">
        <p className="product-kicker">{product.size}</p>
        <h3><Link href={`/produto/${product.id}`}>{product.name}</Link></h3>
        <p className="product-subtitle">{product.subtitle}</p>
        <div className="price-row">
          <div>
            {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice)}</span>}
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <Button
            type="button"
            size="icon"
            aria-label={`Adicionar ${product.name} à sacola`}
            className="quick-add"
            onClick={() => onAdd(product)}
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
    </article>
  );
}
