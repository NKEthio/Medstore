import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import mockProducts from "../../sample-products.json";
import ProductCard from "../components/ProductCard";
import { getCachedProducts, setCachedProducts } from "../lib/productCache";
import "./Home.css";

export default function Home() {
  // Optimization: Initialize state from the cache if available.
  // This enables instant rendering on subsequent visits/back-navigation.
  const [products, setProducts] = useState(() => getCachedProducts() || []);
  const [status, setStatus] = useState(() => getCachedProducts() ? "ready" : "loading"); // loading | ready | error
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isFallback) {
          const loaded = mockProducts.map((p, index) => ({ id: `mock-id-${index}`, ...p }));
          setProducts(loaded);
          setCachedProducts(loaded);
          setStatus("ready");
          return;
        }
        const snap = await getDocs(collection(db, "products"));
        if (cancelled) return;
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(loaded);
        setCachedProducts(loaded);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        // Only show error page if we don't have cached products to fall back on
        if (!cancelled && !getCachedProducts()) {
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Optimization: Wrap category computation in useMemo so that we only map and create
  // the Set when the list of products actually changes, rather than on every render.
  const categories = useMemo(() => {
    return ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  // Optimization: Wrap filtered products computation in useMemo so we only re-filter
  // when products or the selected category changes.
  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

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

      <h2 className="catalog-title">Explore Catalog</h2>

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
          {filteredProducts.map((p, index) => (
            <ProductCard key={p.id} product={p} priority={index < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
