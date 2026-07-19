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
      <div className="container home-state">
        <p>Your cart is empty.</p>
        <Link to="/" className="btn secondary" style={{ marginTop: 16 }}>
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

      <form className="checkout-form" onSubmit={placeOrder}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" required autoComplete="name" value={form.name} onChange={update("name")} />
        </div>
        <div className="field">
          <label htmlFor="address">Address</label>
          <input id="address" required autoComplete="address-line1" value={form.address} onChange={update("address")} />
        </div>
        <div className="checkout-row">
          <div className="field">
            <label htmlFor="city">City</label>
            <input id="city" required autoComplete="address-level2" value={form.city} onChange={update("city")} />
          </div>
          <div className="field">
            <label htmlFor="postcode">Postcode</label>
            <input id="postcode" required autoComplete="postal-code" value={form.postcode} onChange={update("postcode")} />
          </div>
        </div>

        <div className="checkout-summary">
          <p>Total</p>
          <p className="cart-subtotal">${subtotal.toFixed(2)}</p>
        </div>

        {error && <p className="error-text">{error}</p>}
        {!user && (
          <p className="checkout-note">
            You'll be asked to sign in before the order is placed.
          </p>
        )}

        <button className="btn" type="submit" disabled={placing}>
          {placing ? "Placing order…" : "Place order"}
        </button>
        <p className="checkout-note" style={{ marginTop: 12 }}>
          This is a demo checkout — no real payment is processed. Wire in
          Stripe, PayPal, or your provider of choice here.
        </p>
      </form>
    </div>
  );
}
