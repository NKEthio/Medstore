import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import mockProducts from "../../sample-products.json";
import { useCart } from "../context/CartContext";
import { useP2P } from "../context/P2PContext";
import { getCachedProducts } from "../lib/productCache";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { userListings, makeOffer, sendInquiry } = useP2P();

  const [product, setProduct] = useState(() => {
    // Check user listings first
    const fromUser = userListings.find((p) => p.id === id);
    if (fromUser) return fromUser;
    const cached = getCachedProducts();
    if (cached) {
      return cached.find((p) => p.id === id || `mock-id-${p.id}` === id) || null;
    }
    return mockProducts.find((p) => p.id === id) || null;
  });

  const [status, setStatus] = useState(() => (product ? "ready" : "loading"));
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  // P2P Modals
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [inspectionPeriod, setInspectionPeriod] = useState("48-Hour Acceptance Window");
  const [buyerFacility, setBuyerFacility] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [offerNotes, setOfferNotes] = useState("");
  const [offerSuccess, setOfferSuccess] = useState(false);

  // Inquiry Modal
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState("BioMed Calibration Report");
  const [inquirySender, setInquirySender] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Check user listings first
    const fromUser = userListings.find((p) => p.id === id);
    if (fromUser) {
      setProduct(fromUser);
      setStatus("ready");
      return;
    }

    (async () => {
      try {
        if (isFallback) {
          const matched =
            mockProducts.find((p) => p.id === id) ||
            mockProducts.find((_, index) => `mock-id-${index}` === id) ||
            mockProducts[0];
          setProduct({ id, ...matched });
          setStatus("ready");
          return;
        }

        const snap = await getDoc(doc(db, "products", id));
        if (cancelled) return;

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
          setStatus("ready");
        } else {
          const matchedFallback =
            mockProducts.find((p) => p.id === id) || mockProducts[0];
          setProduct({ id: id || "dex-img-01", ...matchedFallback });
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error fetching medical device detail:", err);
        if (!cancelled && !product) {
          setProduct({ id: id || "dex-img-01", ...mockProducts[0] });
          setStatus("ready");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, userListings, product]);

  if (status === "loading" && !product) {
    return (
      <div className="container product-detail-page skeleton-page">
        <div className="skeleton-image-box pulse"></div>
        <div className="skeleton-info-box pulse"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container empty-detail-state">
        <h2>Medical Device Not Found</h2>
        <p>The equipment listing you requested may have been de-listed or sold.</p>
        <Link to="/" className="btn-primary">
          Back to DEX Marketplace
        </Link>
      </div>
    );
  }

  const galleryImages = [
    product.image,
    "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop"
  ].filter(Boolean);

  const handleBuyNow = () => {
    addItem(product, 1);
    navigate("/cart");
  };

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 3500);
  };

  const handleOpenOfferModal = () => {
    setOfferAmount(product.price ? String(Math.round(product.price * 0.9)) : "");
    setOfferSuccess(false);
    setOfferModalOpen(true);
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!offerAmount || !buyerContact) {
      alert("Please enter your offer amount and contact email.");
      return;
    }

    makeOffer({
      deviceId: product.id,
      deviceName: product.name,
      originalPrice: product.price,
      offerAmount,
      inspectionPeriod,
      sellerName: product.seller?.name || "Verified Seller",
      buyerFacility,
      buyerContact,
      notes: offerNotes,
    });

    setOfferSuccess(true);
    setTimeout(() => {
      setOfferModalOpen(false);
      setOfferSuccess(false);
    }, 2000);
  };

  const handleOpenInquiryModal = (type = "BioMed Calibration Report") => {
    setInquiryType(type);
    setInquirySuccess(false);
    setInquiryModalOpen(true);
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    if (!inquirySender || !inquiryEmail) {
      alert("Please provide your name and clinic email.");
      return;
    }

    sendInquiry({
      deviceId: product.id,
      deviceName: product.name,
      sellerName: product.seller?.name || "Verified Seller",
      senderName: inquirySender,
      senderEmail: inquiryEmail,
      message: inquiryMsg,
      type: inquiryType,
    });

    setInquirySuccess(true);
    setTimeout(() => {
      setInquiryModalOpen(false);
      setInquirySuccess(false);
    }, 2000);
  };

  const seller = product.seller || {
    name: "New England BioMed Systems",
    type: "Certified BioMed Refurbisher",
    verified: true,
    rating: 4.98,
    dealsCompleted: 184,
  };

  return (
    <div className="container product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb">
        <Link to="/">DEX Exchange</Link>
        <span className="sep">•</span>
        <Link to={`/?category=${encodeURIComponent(product.category || "")}`}>{product.category || "Medical Devices"}</Link>
        <span className="sep">•</span>
        <span>{product.brand}</span>
        <span className="sep">•</span>
        <span className="active">{product.name}</span>
      </nav>

      {/* Main Detail Content */}
      <div className="detail-main-grid">
        {/* Left Column: Image Showcase, Badges & Gallery */}
        <div className="detail-left-col">
          <div className="detail-image-card">
            <div className="image-card-top">
              <div className="detail-badges-list">
                <span className="badge-condition-pill">{product.condition || "Certified Refurbished"}</span>
                {product.fdaCleared && (
                  <span className="badge-verified-pill">FDA 510(k) Cleared</span>
                )}
                {product.biomedCalibrated && (
                  <span className="badge-verified-pill">BioMed Calibrated 2024</span>
                )}
              </div>

              <button
                type="button"
                className={`detail-fav-btn ${isFavorite ? "active" : ""}`}
                onClick={() => setIsFavorite(!isFavorite)}
                aria-label="Wishlist toggle"
                title="Add to Facility Watchlist"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>

            {/* Large Product Image */}
            <div className="main-image-wrapper">
              <img
                src={galleryImages[selectedImage] || product.image}
                alt={product.name}
                className="main-detail-img"
              />
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="thumbnail-gallery">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-box ${selectedImage === idx ? "active" : ""}`}
                onClick={() => setSelectedImage(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>

          {/* DEX SafeTrade Escrow Protection Banner */}
          <div className="detail-escrow-card">
            <div className="escrow-header">
              <div className="escrow-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <h4 className="escrow-title">DEX SafeTrade Escrow Guarantee</h4>
                <p className="escrow-desc">
                  Buyer funds are secured in escrow until device delivery and successful 48-hour clinical calibration acceptance testing.
                </p>
              </div>
            </div>
            <div className="escrow-steps">
              <div className="escrow-step">
                <span className="step-num">1</span>
                <span>Funds Secured in Escrow</span>
              </div>
              <div className="escrow-step">
                <span className="step-num">2</span>
                <span>Insured Freight Shipped</span>
              </div>
              <div className="escrow-step">
                <span className="step-num">3</span>
                <span>48h Clinic Inspection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specs, Seller & Actions */}
        <div className="detail-right-col">
          <div className="detail-header-top">
            <span className="brand-eyebrow">{product.brand} • {product.year ? `Model Year ${product.year}` : "Clinical Grade"}</span>
            <span className="location-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {product.location || "USA"}
            </span>
          </div>

          <h1 className="product-title-heading">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="rating-review-row">
            <div className="rating-pill">
              <span className="star-icon">★</span>
              <span>{product.rating ? product.rating.toFixed(1) : "4.9"}</span>
            </div>
            <span className="review-count-link">
              {(product.reviewCount || 34)} verified clinical reviews
            </span>
            <span className="badge-warranty-tag">
              🛡️ {product.warranty || "90-Day BioMed Warranty"}
            </span>
          </div>

          {/* Pricing Box */}
          <div className="price-box-wrapper">
            <div className="price-tag-display">
              ${product.price ? product.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              <span className="currency-tag">USD</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="msrp-savings-line">
                <span className="original-msrp">
                  ${product.originalPrice.toLocaleString("en-US")} New MSRP
                </span>
                <span className="savings-badge">
                  Save ${(product.originalPrice - product.price).toLocaleString("en-US")} vs New
                </span>
              </div>
            )}
          </div>

          {/* Verified Seller Profile Card */}
          <div className="seller-profile-card">
            <div className="seller-profile-left">
              <div className="seller-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="seller-details">
                <div className="seller-name-row">
                  <span className="seller-name">{seller.name}</span>
                  {seller.verified && (
                    <span className="badge-verified-seller" title="Verified Hospital or BioMed Vendor">
                      ✓ Verified Seller
                    </span>
                  )}
                </div>
                <span className="seller-type">{seller.type} • {seller.dealsCompleted || 120}+ Transactions</span>
              </div>
            </div>

            <div className="seller-actions-btns">
              <button
                type="button"
                className="btn-msg-seller"
                onClick={() => handleOpenInquiryModal("General Inquiry")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Message Seller
              </button>
            </div>
          </div>

          <p className="product-description-text">
            {product.description}
          </p>

          {/* Key Clinical Features */}
          <div className="key-features-section">
            <h3 className="features-title">Technical Specifications & Inclusions</h3>
            <ul className="features-list">
              {product.features && product.features.length > 0 ? (
                product.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="bullet">✓</span>
                    <span>{feature}</span>
                  </li>
                ))
              ) : (
                <li className="feature-item">
                  <span className="bullet">✓</span>
                  <span>Full biomedical inspection and electrical safety certification pass report</span>
                </li>
              )}
            </ul>
          </div>

          {/* Shipping & Freight Details */}
          <div className="shipping-info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <div className="shipping-text">
              <strong>Medical Freight & Delivery:</strong> {product.shipping || "Insured Crated Pallet Freight • Liftgate Delivery Available"}
            </div>
          </div>

          {/* Action Buttons: Direct Purchase + P2P Offer */}
          <div className="detail-cta-actions">
            <button
              type="button"
              className="btn-primary buy-now-btn"
              onClick={handleBuyNow}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Buy with DEX Escrow
            </button>

            <button
              type="button"
              className="btn-p2p-offer"
              onClick={handleOpenOfferModal}
              title="Negotiate directly with seller"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 18V6"/>
              </svg>
              Make an Offer
            </button>

            <button
              type="button"
              className="btn-secondary add-cart-btn"
              onClick={handleAddToCart}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Add to PO Cart
            </button>
          </div>

          {/* Request BioMed Report Button */}
          <div className="biomed-report-link-wrapper">
            <button
              type="button"
              className="biomed-report-btn"
              onClick={() => handleOpenInquiryModal("BioMed Calibration Report")}
            >
              📄 Request BioMed Calibration Certificate & Maintenance Logs
            </button>
          </div>

          {added && (
            <div className="toast-added-notification" role="status" aria-live="polite">
              <span>✓ Device added to your DEX Escrow Cart!</span>
              <Link to="/cart" className="view-cart-link">
                Proceed to Checkout ➔
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* P2P Make An Offer Modal */}
      {offerModalOpen && (
        <div className="modal-backdrop" onClick={() => setOfferModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Make a P2P Offer</h3>
              <button type="button" className="modal-close-btn" onClick={() => setOfferModalOpen(false)}>✕</button>
            </div>

            {offerSuccess ? (
              <div className="modal-success-state">
                <div className="success-icon">✓</div>
                <h4>Offer Submitted to Seller!</h4>
                <p>The seller has been notified. You can track this offer in your Facility Activity & Orders hub.</p>
              </div>
            ) : (
              <form onSubmit={handleSendOffer} className="modal-form">
                <p className="modal-intro">
                  Propose your price and terms directly to <strong>{seller.name}</strong> for the <strong>{product.name}</strong>.
                </p>

                <div className="form-field">
                  <label>Your Counter-Offer ($ USD) *</label>
                  <div className="input-with-prefix">
                    <span className="prefix">$</span>
                    <input
                      type="number"
                      placeholder="e.g. 26000"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      required
                    />
                  </div>
                  <span className="field-hint">Asking price: ${product.price?.toLocaleString()}</span>
                </div>

                <div className="form-field">
                  <label>Contingency & Inspection Period</label>
                  <select
                    value={inspectionPeriod}
                    onChange={(e) => setInspectionPeriod(e.target.value)}
                  >
                    <option value="48-Hour Acceptance Window">48-Hour BioMed Acceptance Window</option>
                    <option value="7-Day Clinic Inspection Window">7-Day Clinic Inspection Window</option>
                    <option value="14-Day Acceptance Testing Window">14-Day Acceptance Testing Window</option>
                    <option value="Immediate Acceptance (As-Is)">Immediate Acceptance (As-Is)</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Your Healthcare Facility / Practice Name</label>
                  <input
                    type="text"
                    placeholder="e.g. St. Jude Surgical Specialty Clinic"
                    value={buyerFacility}
                    onChange={(e) => setBuyerFacility(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Your Clinical Email / Contact *</label>
                  <input
                    type="email"
                    placeholder="e.g. procurement@stjude.org"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Custom Terms / Accessories Requested</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Please include 2-year calibration certification and extra cardiac probe."
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setOfferModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit Formal P2P Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Inquiry / BioMed Report Modal */}
      {inquiryModalOpen && (
        <div className="modal-backdrop" onClick={() => setInquiryModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{inquiryType}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setInquiryModalOpen(false)}>✕</button>
            </div>

            {inquirySuccess ? (
              <div className="modal-success-state">
                <div className="success-icon">✓</div>
                <h4>Request Sent Successfully!</h4>
                <p>The seller and BioMed technical team will respond to your email within 2 to 4 business hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="modal-form">
                <p className="modal-intro">
                  Direct inquiry to <strong>{seller.name}</strong> regarding <strong>{product.name}</strong>.
                </p>

                <div className="form-field">
                  <label>Your Full Name & Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Jenkins, Lead BioMed"
                    value={inquirySender}
                    onChange={(e) => setInquirySender(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Clinical Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. s.jenkins@metrohealth.org"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Message / Specific Questions</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Please send the latest electrical safety test report and software release notes."
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setInquiryModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Send Inquiry to Seller
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
