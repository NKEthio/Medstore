import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import mockProducts from "../../sample-products.json";
import { useCart } from "../context/CartContext";
import { getCachedProducts } from "../lib/productCache";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(() => {
    const cached = getCachedProducts();
    if (cached) {
      return cached.find((p) => p.id === id || `mock-id-${p.id}` === id) || null;
    }
    return mockProducts.find((p) => p.id === id) || null;
  });

  const [status, setStatus] = useState(() => (product ? "ready" : "loading"));
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isFallback) {
          const matched =
            mockProducts.find((p) => p.id === id) ||
            mockProducts.find((_, index) => `mock-id-${index}` === id) ||
            mockProducts[0];
          setProduct({ id, ...matched });
          setStatus("ready");
          return;
        }

        const snap = await getDoc(doc(db, "products", id));
        if (cancelled) return;

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
          setStatus("ready");
        } else {
          const matchedFallback =
            mockProducts.find((p) => p.id === id) || mockProducts[0];
          setProduct({ id: id || "prod-7", ...matchedFallback });
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
        if (!cancelled && !product) {
          setProduct({ id: id || "prod-7", ...mockProducts[0] });
          setStatus("ready");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, product]);

  if (status === "loading" && !product) {
    return (
      <div className="container product-detail-page skeleton-page">
        <div className="skeleton-image-box pulse"></div>
        <div className="skeleton-info-box pulse"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container empty-detail-state">
        <h2>Product not found</h2>
        <p>The product you are looking for is unavailable.</p>
        <Link to="/" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Generate thumbnail gallery variants
  const galleryImages = [
    product.image,
    product.image,
    product.image,
    product.image,
  ].filter(Boolean);

  const colorsList = product.colors || ["#1B2A4A", "#FFFFFF", "#8B9467", "#1C1C1E", "#E2DCD2"];
  const colorNames = ["BLUE", "WHITE", "OLIVE", "DARK GRAY", "CREAM"];

  const handleBuyNow = () => {
    addItem(product, 1);
    navigate("/cart");
  };

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 3500);
  };

  return (
    <div className="container product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">•</span>
        <Link to="/">Catalog</Link>
        <span className="sep">•</span>
        <span>{product.brand || "Protech"}</span>
        <span className="sep">•</span>
        <span className="active">{product.name}</span>
      </nav>

      {/* Main Detail Content */}
      <div className="detail-main-grid">
        {/* Left Column: Image Showcase, Color Swatches, Thumbnails */}
        <div className="detail-left-col">
          <div className="detail-image-card">
            <div className="image-card-top">
              {product.isBestseller && (
                <span className="badge-sale">Bestseller</span>
              )}

              <button
                type="button"
                className={`detail-fav-btn ${isFavorite ? "active" : ""}`}
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Wishlist toggle"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Vertical Color Swatches Overlay */}
            <div className="color-swatches-column">
              {colorsList.map((colorHex, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`color-swatch-circle ${selectedColor === idx ? "active" : ""}`}
                  style={{ backgroundColor: colorHex }}
                  onClick={() => setSelectedColor(idx)}
                  aria-label={`Select color ${colorNames[idx] || idx}`}
                />
              ))}
              <span className="selected-color-name">
                {colorNames[selectedColor] || "DEFAULT"}
              </span>
            </div>

            {/* Large Product Image */}
            <div className="main-image-wrapper">
              <img
                src={galleryImages[selectedImage] || product.image}
                alt={product.name}
                className="main-detail-img"
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="thumbnail-gallery">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-box ${selectedImage === idx ? "active" : ""}`}
                onClick={() => setSelectedImage(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Specs & Actions */}
        <div className="detail-right-col">
          <span className="brand-eyebrow">{product.brand || "Protech"}</span>
          <h1 className="product-title-heading">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="rating-review-row">
            <div className="rating-pill">
              <span className="star-icon">★</span>
              <span>{product.rating ? product.rating.toFixed(1) : "4.8"}</span>
            </div>
            <span className="review-count-link">
              {(product.reviewCount || 12384).toLocaleString()} reviews ›
            </span>
          </div>

          <p className="product-description-text">
            {product.description ||
              "With immersive high-fidelity spatialised audio, world-class active noise cancellation, and customizable sound profiles."}
          </p>

          {/* Price */}
          <div className="price-tag-display">
            ${product.price ? product.price.toFixed(2) : "0.00"}
          </div>

          {/* Key Features Bullet Points */}
          <div className="key-features-section">
            <h3 className="features-title">Key features</h3>
            <ul className="features-list">
              {product.features && product.features.length > 0 ? (
                product.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="bullet">•</span>
                    <span>{feature}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="feature-item">
                    <span className="bullet">•</span>
                    <span>
                      <strong>Sound quality:</strong> World-class noise cancelling and breakthrough spatialised audio
                    </span>
                  </li>
                  <li className="feature-item">
                    <span className="bullet">•</span>
                    <span>
                      <strong>Battery:</strong> Up to 6-hours or 24 hours total with case
                    </span>
                  </li>
                  <li className="feature-item">
                    <span className="bullet">•</span>
                    <span>
                      <strong>Enhanced feature:</strong> CustomTune technology for personalised sound
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* CTAs */}
          <div className="detail-cta-actions">
            <button
              type="button"
              className="btn-primary buy-now-btn"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>

            <button
              type="button"
              className="btn-secondary add-cart-btn"
              onClick={handleAddToCart}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Add to Cart
            </button>
          </div>

          {added && (
            <div className="toast-added-notification" role="status" aria-live="polite">
              <span>✓ Added to cart successfully!</span>
              <Link to="/cart" className="view-cart-link">
                View Cart ➔
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
