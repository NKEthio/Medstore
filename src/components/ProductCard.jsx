import { Link } from "react-router-dom";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-image-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="product-meta">
        <p className="product-name">{product.name}</p>
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
