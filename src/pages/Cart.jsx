import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { items, removeItem, setQty, subtotal } = useCart();

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

  return (
    <div className="container cart">
      <h1>Your cart</h1>

      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-row" key={item.id}>
            <div className="cart-row-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="product-image-fallback" aria-hidden="true" />
              )}
            </div>
            <div className="cart-row-info">
              <p className="cart-row-name">{item.name}</p>
              <p className="cart-row-price">${item.price.toFixed(2)}</p>
            </div>
            <input
              type="number"
              min="1"
              value={item.qty}
              onChange={(e) => setQty(item.id, Number(e.target.value) || 1)}
            />
            <p className="cart-row-total">
              ${(item.price * item.qty).toFixed(2)}
            </p>
            <button
              className="cart-row-remove"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <p>Subtotal</p>
        <p className="cart-subtotal">${subtotal.toFixed(2)}</p>
      </div>

      <Link to="/checkout" className="btn cart-checkout-btn">
        Checkout
      </Link>
    </div>
  );
}
