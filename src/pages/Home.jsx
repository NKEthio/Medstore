import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [status, setStatus] = useState("loading"); // loading | ready | error

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

  const categories = useMemo(() => {
    const values = new Set(
      products
        .map((product) => product.category)
        .filter((value) => typeof value === "string" && value.trim())
        .map((value) => value.trim())
    );
    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    let next = products.filter((product) => {
      const inCategory =
        category === "all" ||
        (product.category || "").toLowerCase() === category.toLowerCase();
      const name = (product.name || "").toLowerCase();
      const description = (product.description || "").toLowerCase();
      const inSearch = !term || name.includes(term) || description.includes(term);
      return inCategory && inSearch;
    });

    if (sortBy === "price-asc") {
      next = [...next].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "price-desc") {
      next = [...next].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortBy === "name") {
      next = [...next].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    return next;
  }, [products, query, category, sortBy]);

  return (
    <div className="container home">
      <div className="home-header">
        <p className="eyebrow">New arrivals</p>
        <h1>Considered goods for everyday use.</h1>
      </div>

      {status === "ready" && products.length > 0 && (
        <div className="home-controls">
          <input
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All categories" : item}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
          >
            <option value="featured">Featured</option>
            <option value="name">Name</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      )}

      {status === "loading" && <p className="home-state">Loading products…</p>}

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

      {status === "ready" && products.length > 0 && visibleProducts.length === 0 && (
        <p className="home-state">No products match the current filters.</p>
      )}

      {status === "ready" && visibleProducts.length > 0 && (
        <div className="product-grid">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
