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
    return <p className="container home-state">Loading…</p>;
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="container home-state">
        <p>This product couldn't be found.</p>
        <Link to="/" className="btn secondary" style={{ marginTop: 16 }}>
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
        <p className="eyebrow">{product.category || "Shop"}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>
        <p className="product-detail-desc">{product.description}</p>

        <div className="qty-row">
          <label htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>

        <button
          className="btn"
          onClick={() => {
            addItem(product, qty);
            setAdded(true);
          }}
        >
          Add to cart
        </button>

        {added && <p className="added-note">Added to cart.</p>}
      </div>
    </div>
  );
}
