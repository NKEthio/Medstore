import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import mockProducts from "../../sample-products.json";
import { setCachedProducts, clearProductCache } from "../lib/productCache";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setStatus("loading");
    try {
      if (isFallback) {
        setProducts(mockProducts);
        setCachedProducts(mockProducts);
        setStatus("ready");
        return;
      }
      const snap = await getDocs(collection(db, "products"));
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const finalProducts = loaded.length > 0 ? loaded : mockProducts;
      setProducts(finalProducts);
      setCachedProducts(finalProducts);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setProducts(mockProducts);
      setCachedProducts(mockProducts);
      setStatus("ready");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        if (!isFallback) {
          await deleteDoc(doc(db, "products", id));
        }
        setProducts((prev) => prev.filter((p) => p.id !== id));
        clearProductCache();
      } catch (err) {
        console.error(err);
        alert("Failed to delete the product. Check your security rules.");
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      if (!isFallback) {
        await updateDoc(doc(db, "products", id), { status: "active" });
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "active" } : p))
      );
      clearProductCache();
    } catch (err) {
      console.error(err);
      alert("Failed to approve product.");
    }
  };

  const handleApproveAll = async () => {
    if (window.confirm("Approve all pending scraped items?")) {
      try {
        if (!isFallback) {
          const pending = products.filter((p) => p.status === "pending");
          await Promise.all(
            pending.map((p) => updateDoc(doc(db, "products", p.id), { status: "active" }))
          );
        }
        setProducts((prev) =>
          prev.map((p) => (p.status === "pending" ? { ...p, status: "active" } : p))
        );
        clearProductCache();
      } catch (err) {
        console.error(err);
        alert("Failed to approve all products.");
      }
    }
  };

  const activeProducts = products.filter((p) => !p.status || p.status === "active");
  const pendingProducts = products.filter((p) => p.status === "pending");

  return (
    <div className="container admin-dashboard">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>Store Administration</h1>
        </div>
        <div className="admin-actions">
          <Link to="/admin/orders" className="btn secondary">
            Manage Orders
          </Link>
          <Link to="/admin/product/new" className="btn">
            Add New Product
          </Link>
        </div>
      </div>

      {/* Pending Approval Section */}
      {pendingProducts.length > 0 && (
        <div className="pending-section">
          <div className="pending-header">
            <h2>Scraped Products Pending Approval ({pendingProducts.length})</h2>
            <button
              onClick={handleApproveAll}
              className="btn small-btn approve-all-btn"
            >
              Approve All Scraped Items
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand / Provider</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="admin-img-preview" />
                      ) : (
                        <div className="admin-img-fallback" />
                      )}
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <div className="source-query">Query: {p.sourceQuery || 'Scraped Item'}</div>
                    </td>
                    <td>{p.brand || "Provider"}</td>
                    <td>{p.category || "General"}</td>
                    <td>${p.price?.toFixed(2)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="btn small-btn approve-btn"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn small-btn danger-btn"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2>Published Product Catalog ({activeProducts.length})</h2>

      {status === "loading" && <p className="home-state">Loading products…</p>}

      {status === "error" && (
        <p className="home-state error-text">
          Couldn't load products. Please check your credentials or security rules.
        </p>
      )}

      {status === "ready" && activeProducts.length === 0 && (
        <p className="home-state">No published products in catalog yet.</p>
      )}

      {status === "ready" && activeProducts.length > 0 && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="admin-img-preview" />
                    ) : (
                      <div className="admin-img-fallback" />
                    )}
                  </td>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>{p.category || "General"}</td>
                  <td>${p.price?.toFixed(2)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link to={`/admin/product/${p.id}/edit`} className="btn secondary small-btn">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="btn small-btn danger-btn"
                        aria-label={`Delete ${p.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
