import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useCart } from "../context/CartContext";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setAdded(false);

    (async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (cancelled) return;
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
          setStatus("ready");
        } else {
          setStatus("missing");
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="container product-detail skeleton-detail">
        <div className="product-detail-image skeleton-image pulse" aria-hidden="true"></div>
        <div className="product-detail-info">
          <div className="skeleton-eyebrow pulse"></div>
          <div className="skeleton-h1 pulse"></div>
          <div className="skeleton-price pulse"></div>
          <div className="skeleton-desc pulse"></div>
          <div className="skeleton-qty pulse"></div>
          <div className="skeleton-btn pulse"></div>
        </div>
      </div>
    );
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="container home-state" style={{ padding: "100px 24px" }}>
        <h2>This product couldn't be found.</h2>
        <p style={{ marginTop: 8, color: "var(--muted)" }}>It might have been removed or the link is incorrect.</p>
        <Link to="/" className="btn secondary" style={{ marginTop: 24 }}>
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container product-detail">
      <div className="product-detail-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-image-fallback" aria-hidden="true" />
        )}
      </div>

      <div className="product-detail-info">
        <span className="eyebrow">{product.category || "Shop"}</span>
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>
        <p className="product-detail-desc">{product.description}</p>

        <div className="qty-row">
          <label htmlFor="qty">Quantity</label>
          <div className="qty-controls">
            <button
              type="button"
              className="qty-btn"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              id="qty"
              type="number"
              min="1"
              aria-label="Quantity to add to cart"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            />
            <button
              type="button"
              className="qty-btn"
              onClick={() => setQty((prev) => prev + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="product-detail-actions">
          <button
            className="btn"
            style={{ width: "100%", padding: "14px 28px" }}
            onClick={() => {
              addItem(product, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 3000);
            }}
          >
            Add to cart
          </button>

          {added && (
            <p className="added-note" role="status" aria-live="polite">
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 18, height: 18 }}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Added to cart successfully.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
