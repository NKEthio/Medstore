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
          <h2>Your Escrow Cart is Empty</h2>
          <p>Explore certified medical devices, hospital surplus, and pre-owned clinical systems on DEX.</p>
          <Link to="/" className="btn-primary" style={{ marginTop: 24 }}>
            Explore Medical Devices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart">
      <div className="cart-header-title-row">
        <h1>DEX Escrow Cart</h1>
        <span className="cart-badge-escrow">
          🛡️ Protected by DEX SafeTrade Escrow
        </span>
      </div>

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
                  <span className="cart-row-category">{item.brand || "Medical Hardware"}</span>
                  <p className="cart-row-name">{item.name}</p>
                  <span className="cart-row-warranty">🛡️ BioMed Inspection Guaranteed</span>
                  <p className="cart-row-price">
                    ${item.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })} each
                  </p>
                </div>

                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                    aria-label="Decrease quantity"
                    disabled={item.qty <= 1}
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
                  ${(item.price * item.qty).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                    width="18"
                    height="18"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* DEX Escrow Callout in Cart */}
          <div className="cart-escrow-notice">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <div>
              <strong>DEX SafeTrade Escrow Included:</strong> Your clinical payment will not be released to the seller until your facility accepts delivery and completes the 48-hour calibration inspection.
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="cart-summary-section">
          <div className="cart-summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Medical Equipment Subtotal</span>
              <span>${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span>Pallet Freight & Insurance</span>
              <span className="free-freight">Calculated at Checkout</span>
            </div>
            <div className="summary-row">
              <span>DEX Escrow Fee</span>
              <span className="free-freight">Covered by DEX</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <span className="summary-total-price">
                ${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
              </span>
            </div>

            <Link to="/checkout" className="btn-primary checkout-btn">
              Proceed to Clinical Escrow Checkout
            </Link>

            <Link to="/" className="btn-secondary continue-shopping-btn">
              Continue Browsing Devices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
