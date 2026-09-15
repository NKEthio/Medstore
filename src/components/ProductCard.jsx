import { memo, useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product, priority = false }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <div className="product-card-wrapper">
      <Link to={`/product/${product.id}`} className="product-card">
        <div className="product-card-header">
          {product.discount ? (
            <span className="badge-sale">{product.discount}</span>
          ) : product.isBestseller ? (
            <span className="badge-bestseller">Bestseller</span>
          ) : (
            <div />
          )}

          <button
            type="button"
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        <div className="product-image-container">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-card-image"
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
            />
          ) : (
            <div className="product-image-fallback" aria-hidden="true" />
          )}
        </div>

        <div className="product-card-info">
          <div className="product-brand-row">
            <span className="product-brand-tag">{product.brand || "Protech"}</span>
            {product.rating && (
              <div className="product-rating">
                <span className="star-icon">★</span>
                <span className="rating-value">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="product-title-row">
            <p className="product-title">{product.name}</p>
          </div>

          <div className="product-price-container">
            <span className="product-current-price">
              ${product.price ? product.price.toFixed(2) : "0.00"}
            </span>
            {product.originalPrice && (
              <span className="product-original-price">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);
