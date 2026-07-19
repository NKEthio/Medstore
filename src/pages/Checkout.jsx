import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Checkout.css";

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", address: "", city: "", postcode: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="container home-state" style={{ padding: "100px 24px" }}>
        <h2>Your cart is empty.</h2>
        <p style={{ marginTop: 8, color: "var(--muted)" }}>Add some items to your cart before proceeding to checkout.</p>
        <Link to="/" className="btn secondary" style={{ marginTop: 24 }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      navigate("/login", { state: { redirectTo: "/checkout" } });
      return;
    }

    setPlacing(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        subtotal,
        shipping: form,
        status: "placed",
        createdAt: serverTimestamp(),
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      console.error(err);
      setError("Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container checkout">
      <h1>Checkout</h1>

      <div className="checkout-container">
        <form className="checkout-form" onSubmit={placeOrder}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required autoComplete="name" value={form.name} onChange={update("name")} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <input id="address" required autoComplete="address-line1" value={form.address} onChange={update("address")} placeholder="123 Main St, Apt 4B" />
          </div>
          <div className="checkout-row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" required autoComplete="address-level2" value={form.city} onChange={update("city")} placeholder="New York" />
            </div>
            <div className="field">
              <label htmlFor="postcode">Postcode</label>
              <input id="postcode" required autoComplete="postal-code" value={form.postcode} onChange={update("postcode")} placeholder="10001" />
            </div>
          </div>

          <div className="checkout-summary">
            <span>Total Amount</span>
            <span className="checkout-total">${subtotal.toFixed(2)}</span>
          </div>

          {error && <p className="error-text" style={{ marginBottom: 16 }}>{error}</p>}
          {!user && (
            <p className="checkout-note">
              🔐 Secure Check: You will be prompted to sign in or create an account before your order is finalized.
            </p>
          )}

          <button className="btn" type="submit" disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </button>
          <p className="checkout-note" style={{ marginTop: 20, borderLeftColor: "var(--muted)" }}>
            ℹ️ Demo Mode: No actual payments or card details are processed. In a production build, integrate your choice of modern payment gateways.
          </p>
        </form>
      </div>
    </div>
  );
}
