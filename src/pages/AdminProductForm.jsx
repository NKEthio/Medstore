import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(isEdit ? "loading" : "ready");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const snap = await getDoc(doc(db, "products", id));
          if (snap.exists()) {
            const data = snap.data();
            setForm({
              name: data.name || "",
              price: data.price ? String(data.price) : "",
              category: data.category || "",
              description: data.description || "",
              image: data.image || "",
            });
            setStatus("ready");
          } else {
            setStatus("missing");
          }
        } catch (err) {
          console.error(err);
          setStatus("error");
        }
      })();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: priceNum,
      category: form.category.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "products", id), payload);
      } else {
        await addDoc(collection(db, "products"), payload);
      }
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Failed to save product. Please check your admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <p className="container home-state">Loading product details…</p>;
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="container home-state">
        <p>This product details could not be loaded.</p>
        <Link to="/admin" className="btn secondary" style={{ marginTop: 16 }}>
          Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container checkout">
      <p className="eyebrow">Admin Panel</p>
      <h1>{isEdit ? "Edit Product" : "Add New Product"}</h1>

      <form onSubmit={handleSubmit} className="checkout-form" style={{ marginTop: 24 }}>
        <div className="field">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Modernist Chair"
          />
        </div>

        <div className="checkout-row">
          <div className="field">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 250.00"
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Seating"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="image">Image URL</label>
          <input
            id="image"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Write product specifications and story here..."
            style={{
              padding: "11px 12px",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              background: "var(--surface)",
              fontSize: "15px",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              resize: "vertical"
            }}
          />
        </div>

        {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
          <Link to="/admin" className="btn secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
