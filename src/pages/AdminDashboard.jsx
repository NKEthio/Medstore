import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
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
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete the product. Check your security rules.");
      }
    }
  };

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

      <h2>Product Catalog ({products.length})</h2>

      {status === "loading" && <p className="home-state">Loading products…</p>}

      {status === "error" && (
        <p className="home-state error-text">
          Couldn't load products. Please check your credentials or security rules.
        </p>
      )}

      {status === "ready" && products.length === 0 && (
        <p className="home-state">No products in catalog yet.</p>
      )}

      {status === "ready" && products.length > 0 && (
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
              {products.map((p) => (
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
