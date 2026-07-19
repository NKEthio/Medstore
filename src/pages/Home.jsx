import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
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

  return (
    <div className="container home">
      <div className="home-header">
        <p className="eyebrow">New arrivals</p>
        <h1>Considered goods for everyday use.</h1>
      </div>

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

      {status === "ready" && products.length > 0 && (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
