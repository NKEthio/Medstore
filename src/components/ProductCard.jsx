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
        <div className="product-card-overlay">
          <span className="product-card-cta">View Product</span>
        </div>
      </div>
      <div className="product-meta">
        <span className="product-card-category">{product.category || "General"}</span>
        <p className="product-name">{product.name}</p>
        <div className="product-price-row">
          <p className="product-price">${product.price.toFixed(2)}</p>
          <span className="product-card-view-btn">
            Details
            <svg
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
