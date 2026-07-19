import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { items, removeItem, setQty, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container cart-empty-container">
        <div className="cart-empty-content">
          <svg
            className="cart-empty-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <h2>Your cart is empty</h2>
          <p>Explore our considered goods to find everyday essentials.</p>
          <Link to="/" className="btn" style={{ marginTop: 24 }}>
            Continue shopping
          </Link>
        </div>
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
              aria-label={`Quantity for ${item.name}`}
              value={item.qty}
              onChange={(e) => setQty(item.id, Number(e.target.value) || 1)}
            />
            <p className="cart-row-total">
              ${(item.price * item.qty).toFixed(2)}
            </p>
            <button
              className="cart-row-remove"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name} from cart`}
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
