import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { clearProductCache } from "../lib/productCache";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    category: "",
    condition: "Certified Refurbished",
    warranty: "90-Day BioMed Warranty",
    location: "USA",
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
              brand: data.brand || "",
              price: data.price ? String(data.price) : "",
              category: data.category || "",
              condition: data.condition || "Certified Refurbished",
              warranty: data.warranty || "90-Day BioMed Warranty",
              location: data.location || "USA",
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
      brand: form.brand.trim() || "Medical Specialist",
      price: priceNum,
      category: form.category.trim() || "Diagnostic & Imaging",
      condition: form.condition.trim(),
      warranty: form.warranty.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      image: form.image.trim() || "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",
      fdaCleared: true,
      biomedCalibrated: true,
      status: "active",
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "products", id), payload);
      } else {
        await addDoc(collection(db, "products"), payload);
      }
      clearProductCache();
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
            <label htmlFor="brand">Manufacturer / Brand</label>
            <input
              id="brand"
              name="brand"
              required
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. GE Healthcare, Philips, Stryker"
            />
          </div>

          <div className="field">
            <label htmlFor="category">Medical Category</label>
            <input
              id="category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Diagnostic & Imaging"
            />
          </div>
        </div>

        <div className="checkout-row">
          <div className="field">
            <label htmlFor="price">Price ($ USD)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 24500.00"
            />
          </div>

          <div className="field">
            <label htmlFor="condition">Device Condition</label>
            <input
              id="condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              placeholder="e.g. Certified Refurbished"
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
