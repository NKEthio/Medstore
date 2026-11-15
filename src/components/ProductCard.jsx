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

  const sellerName = product.seller?.name || "Verified Clinical Seller";
  const condition = product.condition || "Hospital Surplus (Tested)";
  const location = product.location || "USA";
  const warranty = product.warranty || "DEX SafeTrade 48h Inspection";

  return (
    <div className="product-card-wrapper">
      <Link to={`/product/${product.id}`} className="product-card">
        <div className="product-card-header">
          <div className="card-badge-group">
            <span className="badge-condition">
              {condition}
            </span>
            {product.fdaCleared && (
              <span className="badge-fda" title="FDA 510(k) Cleared Medical Device">
                FDA 510(k)
              </span>
            )}
          </div>

          <button
            type="button"
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from watchlist" : "Add to watchlist"}
            title="Add to Facility Watchlist"
          >
            <svg
              width="17"
              height="17"
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
            <div className="product-image-fallback" aria-hidden="true">
              <span>Medical Device</span>
            </div>
          )}
          <span className="image-category-pill">{product.category}</span>
        </div>

        <div className="product-card-info">
          {/* Seller & Location Bar */}
          <div className="seller-row">
            <span className="seller-pill" title={`Listed by ${sellerName}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {sellerName}
            </span>
            <span className="device-loc">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {location}
            </span>
          </div>

          {/* Device Title & Brand */}
          <div className="product-title-row">
            <span className="product-brand-tag">{product.brand}</span>
            <h3 className="product-title">{product.name}</h3>
          </div>

          {/* BioMed Spec Tag */}
          <div className="product-spec-row">
            <span className="spec-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {warranty}
            </span>
          </div>

          {/* Pricing & Offer Row */}
          <div className="product-price-container">
            <div>
              <div className="price-main-line">
                <span className="product-current-price">
                  ${product.price ? product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="product-original-price">
                    ${product.originalPrice.toLocaleString("en-US", { minimumFractionDigits: 0 })} MSRP
                  </span>
                )}
              </div>
              {product.discount && (
                <span className="product-discount-label">{product.discount}</span>
              )}
            </div>

            <div className="dex-escrow-stamp" title="Protected by DEX SafeTrade Escrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Escrow</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);
