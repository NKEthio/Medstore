import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import "./AdminProducts.css";

const emptyForm = {
  name: "",
  price: "",
  category: "",
  image: "",
  description: "",
};

function normalizeProduct(form) {
  return {
    name: form.name.trim(),
    price: Number(form.price),
    category: form.category.trim(),
    image: form.image.trim(),
    description: form.description.trim(),
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const formTitle = editingId ? "Edit product" : "Add product";

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );

  const loadProducts = async () => {
    setStatus("loading");
    setError("");
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError("Couldn't load products. Confirm admin permissions.");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const onEdit = (product) => {
    setForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      image: product.image || "",
      description: product.description || "",
    });
    setEditingId(product.id);
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = normalizeProduct(form);
    if (!payload.name || !Number.isFinite(payload.price) || payload.price < 0) {
      setError("Provide a product name and a valid non-negative price.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
      } else {
        await addDoc(collection(db, "products"), payload);
      }
      await loadProducts();
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Couldn't save product. Confirm admin permissions.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    setError("");
    try {
      await deleteDoc(doc(db, "products", id));
      await loadProducts();
      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      setError("Couldn't delete product. Confirm admin permissions.");
    }
  };

  return (
    <div className="container admin-page">
      <div className="admin-heading">
        <p className="eyebrow">Admin</p>
        <h1>Products</h1>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="admin-layout">
        <section className="admin-card">
          <h2>{formTitle}</h2>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="field">
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              />
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
              />
            </div>

            <div className="field">
              <label htmlFor="image">Image URL</label>
              <input
                id="image"
                type="url"
                value={form.image}
                onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="4"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div className="admin-form-actions">
              <button className="btn" type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Update product" : "Add product"}
              </button>
              {editingId && (
                <button
                  className="btn secondary"
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-card">
          <h2>Catalog ({products.length})</h2>

          {status === "loading" ? (
            <p className="home-state">Loading products…</p>
          ) : (
            <ul className="admin-product-list">
              {sortedProducts.map((product) => (
                <li key={product.id}>
                  <div>
                    <p className="admin-product-name">{product.name}</p>
                    <p className="admin-product-meta">
                      ${Number(product.price || 0).toFixed(2)}
                      {product.category ? ` · ${product.category}` : ""}
                    </p>
                  </div>
                  <div className="admin-product-actions">
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => onEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => onDelete(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
              {sortedProducts.length === 0 && (
                <li className="home-state">No products yet.</li>
              )}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
