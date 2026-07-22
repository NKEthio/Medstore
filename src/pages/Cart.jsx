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
          <p>Explore our curation of considered goods to find everyday essentials.</p>
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

      <div className="cart-layout">
        {/* Left: Items list */}
        <div className="cart-items-section">
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
                  <span className="cart-row-category">{item.category || "Shop"}</span>
                  <p className="cart-row-name">{item.name}</p>
                  <p className="cart-row-price">${item.price.toFixed(2)} each</p>
                </div>

                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    aria-label={`Quantity for ${item.name}`}
                    value={item.qty}
                    onChange={(e) => setQty(item.id, Math.max(1, Number(e.target.value) || 1))}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <p className="cart-row-total">
                  ${(item.price * item.qty).toFixed(2)}
                </p>

                <button
                  className="cart-row-remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: 18, height: 18 }}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary Card */}
        <div className="cart-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="summary-row total">
            <span>Estimated Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn cart-checkout-btn">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
