import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        if (cancelled) return;
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStatus("ready");
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamically compute unique categories from fetched products
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter products based on selected tab
  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="container home">
      {/* Premium Hero Section */}
      <div className="home-hero">
        <span className="home-hero-badge">
          ✨ Curated Essentials
        </span>
        <h1>Considered goods for modern living.</h1>
        <p>
          A selection of mindfully designed everyday essentials. Craftsmanship, sustainability, and aesthetic integrity in every piece.
        </p>
      </div>

      <h2 id="catalog-title" className="catalog-title">Explore Catalog</h2>

      {/* Category Filter Tabs */}
      {status === "ready" && products.length > 0 && (
        <div className="home-filters" role="tablist" aria-label="Product categories">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`filter-tab ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div id="product-grid" role="region" aria-live="polite" aria-labelledby="catalog-title">
        {status === "loading" && (
          <div className="product-grid skeleton-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image pulse"></div>
                <div className="skeleton-meta">
                  <div className="skeleton-category pulse"></div>
                  <div className="skeleton-title pulse"></div>
                  <div className="skeleton-price pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <p className="home-state error-text">
            Couldn't load products. Check your Firebase config in
            src/lib/firebase.js and your Firestore security rules.
          </p>
        )}

        {status === "ready" && products.length === 0 && (
          <p className="home-state">
            No products yet. Add documents to the "products" collection in
            Firestore to see them here.
          </p>
        )}

        {status === "ready" && products.length > 0 && filteredProducts.length === 0 && (
          <p className="home-state">No products found in this category.</p>
        )}

        {status === "ready" && filteredProducts.length > 0 && (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
