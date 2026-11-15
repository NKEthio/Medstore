import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useP2P } from "../context/P2PContext";
import "./Orders.css";

export default function Orders() {
  const { user } = useAuth();
  const { offers, userListings, deleteListing } = useP2P();

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'offers' | 'listings'
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isFallback || !user?.uid) {
          // Provide sample medical device escrow orders in fallback mode
          setOrders([
            {
              id: "po-dex-8841",
              createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
              status: "Escrow Funded (In Transit)",
              subtotal: 28500,
              facilityName: "Boston Surgical Specialists",
              freightType: "White Glove Crated Delivery",
              escrowStatus: "Funds Held in DEX SafeTrade Escrow",
              items: [
                {
                  id: "dex-img-01",
                  name: "GE Healthcare Logiq E9 XDclear Ultrasound System",
                  price: 28500,
                  qty: 1,
                  warranty: "6-Month DEX Certified BioMed Warranty",
                },
              ],
            },
          ]);
          return;
        }

        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (loaded.length === 0) {
          setOrders([
            {
              id: "po-dex-8841",
              createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
              status: "Escrow Funded (In Transit)",
              subtotal: 28500,
              facilityName: "Boston Surgical Specialists",
              freightType: "White Glove Crated Delivery",
              escrowStatus: "Funds Held in DEX SafeTrade Escrow",
              items: [
                {
                  id: "dex-img-01",
                  name: "GE Healthcare Logiq E9 XDclear Ultrasound System",
                  price: 28500,
                  qty: 1,
                  warranty: "6-Month DEX Certified BioMed Warranty",
                },
              ],
            },
          ]);
        } else {
          setOrders(loaded);
        }
      } catch (err) {
        console.warn("Orders fetch fallback:", err);
        if (!cancelled) {
          setOrders([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="container orders-page">
      <div className="orders-header">
        <div>
          <span className="orders-eyebrow">DEX FACILITY HUB</span>
          <h1 className="orders-title">Activity, Orders & P2P Offers</h1>
        </div>
        <Link to="/sell" className="btn-primary">
          + List Medical Device
        </Link>
      </div>

      {/* Tabs navigation */}
      <div className="orders-tab-bar">
        <button
          type="button"
          className={`orders-tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Escrow Orders ({orders.length})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === "offers" ? "active" : ""}`}
          onClick={() => setActiveTab("offers")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
            <path d="M12 18V6"/>
          </svg>
          P2P Offers ({offers.length})
        </button>

        <button
          type="button"
          className={`orders-tab-btn ${activeTab === "listings" ? "active" : ""}`}
          onClick={() => setActiveTab("listings")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          My Listed Equipment ({userListings.length})
        </button>
      </div>

      {/* Tab 1: Escrow Orders */}
      {activeTab === "orders" && (
        <div className="orders-content">
          {orders.length === 0 ? (
            <div className="empty-tab-state">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <h3>No Equipment Orders Yet</h3>
              <p>When you purchase medical hardware through DEX, transactions and Escrow milestones are tracked here.</p>
              <Link to="/" className="btn-primary">Browse Marketplace</Link>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">PO #{order.id.slice(0, 10).toUpperCase()}</span>
                      <span className="order-date"> • Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="badge-escrow-status">
                      🛡️ {order.status || "Escrow Funded"}
                    </span>
                  </div>

                  <div className="escrow-order-alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>
                      <strong>SafeTrade Escrow Protection:</strong> Payment held securely. 48-hour clinical acceptance inspection window starts upon delivery.
                    </span>
                  </div>

                  <ul className="order-items">
                    {order.items?.map((item) => (
                      <li key={item.id} className="order-item-row">
                        <div className="item-details">
                          <span className="item-title">{item.name}</span>
                          <span className="item-sub">Qty: {item.qty} • {item.warranty || "BioMed Warranty"}</span>
                        </div>
                        <span className="item-price">
                          ${(item.price * item.qty).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="order-footer">
                    <div className="order-freight-info">
                      <span>Freight: {order.freightType || "Crated Pallet Freight"}</span>
                    </div>
                    <div className="order-total-block">
                      <span className="total-label">Total Escrow Amount:</span>
                      <span className="order-total">
                        ${order.subtotal?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: P2P Offers */}
      {activeTab === "offers" && (
        <div className="orders-content">
          {offers.length === 0 ? (
            <div className="empty-tab-state">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 18V6"/>
              </svg>
              <h3>No Active P2P Offers</h3>
              <p>You can negotiate pricing or inspection terms directly with equipment sellers by clicking "Make an Offer" on any device page.</p>
              <Link to="/" className="btn-primary">Explore Devices to Make an Offer</Link>
            </div>
          ) : (
            <div className="offers-grid">
              {offers.map((offer) => (
                <div className="offer-card" key={offer.id}>
                  <div className="offer-card-top">
                    <span className="offer-badge-status">{offer.status}</span>
                    <span className="offer-date">{new Date(offer.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="offer-device-title">{offer.deviceName}</h3>
                  <p className="offer-seller-text">Seller: <strong>{offer.sellerName}</strong></p>

                  <div className="offer-price-row">
                    <div>
                      <span className="offer-label">Your Offer:</span>
                      <span className="offer-val">${parseFloat(offer.offerAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {offer.originalPrice && (
                      <div className="asking-side">
                        <span className="offer-label">Asking:</span>
                        <span className="asking-val">${parseFloat(offer.originalPrice).toLocaleString("en-US")}</span>
                      </div>
                    )}
                  </div>

                  <div className="offer-meta-box">
                    <div className="meta-line">
                      <strong>Inspection Period:</strong> {offer.inspectionPeriod}
                    </div>
                    {offer.buyerFacility && (
                      <div className="meta-line">
                        <strong>Facility:</strong> {offer.buyerFacility}
                      </div>
                    )}
                    {offer.notes && (
                      <div className="meta-line">
                        <strong>Notes:</strong> {offer.notes}
                      </div>
                    )}
                  </div>

                  <div className="offer-actions">
                    <Link to={`/product/${offer.deviceId}`} className="btn-secondary view-device-btn">
                      View Device Specs
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Listed Equipment */}
      {activeTab === "listings" && (
        <div className="orders-content">
          {userListings.length === 0 ? (
            <div className="empty-tab-state">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <h3>You Have Not Listed Any Medical Devices</h3>
              <p>Turn your surplus hospital equipment, refurbished devices, or clinic overstock into capital on DEX.</p>
              <Link to="/sell" className="btn-primary">+ List Medical Equipment</Link>
            </div>
          ) : (
            <div className="listings-manage-grid">
              {userListings.map((item) => (
                <div className="listing-manage-card" key={item.id}>
                  <div className="listing-img-box">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="listing-manage-info">
                    <div className="listing-top-tags">
                      <span className="badge-condition-pill">{item.condition}</span>
                      <span className="badge-live">● Live on DEX</span>
                    </div>
                    <h3 className="listing-title">{item.name}</h3>
                    <p className="listing-price">${item.price?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    <p className="listing-loc">Location: {item.location}</p>

                    <div className="listing-card-actions">
                      <Link to={`/product/${item.id}`} className="btn-secondary">
                        View Public Page
                      </Link>
                      <button
                        type="button"
                        className="btn-danger-del"
                        onClick={() => {
                          if (window.confirm("Remove this medical device listing from DEX?")) {
                            deleteListing(item.id);
                          }
                        }}
                      >
                        Remove Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
