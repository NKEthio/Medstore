import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useP2P } from "../context/P2PContext";
import "./SellDevice.css";

const PRESET_IMAGES = [
  { label: "Ultrasound / Imaging", url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop" },
  { label: "Patient Monitor / ICU", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop" },
  { label: "Surgical / OR Suite", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop" },
  { label: "Cardiology / Defibrillator", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop" },
  { label: "Laboratory / Diagnostics", url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop" },
  { label: "Anesthesia / Ventilator", url: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format&fit=crop" },
];

export default function SellDevice() {
  const { createListing } = useP2P();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    brand: "GE Healthcare",
    category: "Diagnostic & Imaging",
    subCategory: "Ultrasound System",
    condition: "Certified Refurbished",
    year: "2022",
    price: "",
    originalPrice: "",
    sellerName: "",
    sellerType: "Hospital Surplus Consortium",
    location: "",
    warranty: "90-Day BioMed Performance Guarantee",
    biomedCalibrated: true,
    fdaCleared: true,
    shipping: "Insured Crated Freight • Liftgate Delivery Available",
    image: PRESET_IMAGES[0].url,
    description: "",
    featuresInput: "Passed complete biomedical electrical safety test\nIncludes standard patient cables and power supply\nOEM diagnostic calibration logs available",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.sellerName) {
      alert("Please fill in the equipment name, price, and your organization name.");
      return;
    }

    const features = formData.featuresInput
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const newListing = createListing({
      ...formData,
      features,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate(`/product/${newListing.id}`);
    }, 1200);
  };

  return (
    <div className="container sell-device-page">
      <div className="sell-header">
        <div className="sell-badge">DEX P2P SELLER HUB</div>
        <h1 className="sell-title">List Medical Equipment on DEX</h1>
        <p className="sell-subtitle">
          Direct peer-to-peer exchange connecting hospitals, surgical centers, and clinics with certified buyers worldwide. No middleman markups.
        </p>

        <div className="sell-trust-pills">
          <div className="trust-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            DEX SafeTrade Escrow Protection
          </div>
          <div className="trust-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Verified BioMed & Clinical Buyers
          </div>
          <div className="trust-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
              <path d="M12 18V6"/>
            </svg>
            Zero Commission for Non-Profit Clinics
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="sell-success-card">
          <div className="success-icon">✓</div>
          <h2>Device Listed Successfully!</h2>
          <p>Your medical device is now live on the DEX Exchange. Redirecting to your listing...</p>
        </div>
      ) : (
        <form className="sell-form" onSubmit={handleSubmit}>
          {/* Section 1: Device Identification */}
          <div className="form-card-section">
            <h2 className="section-title">1. Medical Device Identification</h2>
            <div className="form-grid-2">
              <div className="form-field full-width">
                <label>Device Name & Model *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. GE Healthcare Logiq E9 XDclear Ultrasound"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Manufacturer / Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange}>
                  <option value="GE Healthcare">GE Healthcare</option>
                  <option value="Philips">Philips</option>
                  <option value="Siemens Healthineers">Siemens Healthineers</option>
                  <option value="Stryker">Stryker</option>
                  <option value="Olympus">Olympus</option>
                  <option value="Dräger">Dräger</option>
                  <option value="Medtronic">Medtronic</option>
                  <option value="Mindray">Mindray</option>
                  <option value="ZOLL Medical">ZOLL Medical</option>
                  <option value="Zeiss">Zeiss</option>
                  <option value="Beckman Coulter">Beckman Coulter</option>
                  <option value="Hamilton Medical">Hamilton Medical</option>
                  <option value="Hillrom">Hillrom</option>
                  <option value="Other Medical Brand">Other Manufacturer</option>
                </select>
              </div>

              <div className="form-field">
                <label>Medical Category *</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Diagnostic & Imaging">Diagnostic & Imaging</option>
                  <option value="Patient Monitoring & ICU">Patient Monitoring & ICU</option>
                  <option value="Surgical & OR Equipment">Surgical & OR Equipment</option>
                  <option value="Respiratory & Anesthesia">Respiratory & Anesthesia</option>
                  <option value="Cardiology & Defibrillators">Cardiology & Defibrillators</option>
                  <option value="Laboratory & Pathology">Laboratory & Pathology</option>
                  <option value="Ophthalmic & Dental">Ophthalmic & Dental</option>
                </select>
              </div>

              <div className="form-field">
                <label>Sub-Category / Hardware Type</label>
                <input
                  type="text"
                  name="subCategory"
                  placeholder="e.g. Ultrasound, Mobile C-Arm, Bedside Monitor"
                  value={formData.subCategory}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>Year of Manufacture</label>
                <input
                  type="number"
                  name="year"
                  min="2010"
                  max="2026"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Condition & Compliance */}
          <div className="form-card-section">
            <h2 className="section-title">2. Clinical Condition & BioMed Testing</h2>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Device Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                  <option value="Certified Refurbished">Certified Refurbished (Factory Spec)</option>
                  <option value="Hospital Surplus (Biomed Tested)">Hospital Surplus (Biomed Tested)</option>
                  <option value="Hospital De-Installed (Tested)">Hospital De-Installed (Tested)</option>
                  <option value="Pre-Owned Operational">Pre-Owned Operational</option>
                  <option value="New Surplus (Overstock)">New Surplus (Overstock)</option>
                  <option value="As-Is / For Parts">As-Is / For Parts</option>
                </select>
              </div>

              <div className="form-field">
                <label>Warranty Offered</label>
                <select name="warranty" value={formData.warranty} onChange={handleChange}>
                  <option value="1-Year DEX SafeTrade Warranty">1-Year DEX SafeTrade Warranty</option>
                  <option value="6-Month DEX Certified BioMed Warranty">6-Month DEX Certified BioMed Warranty</option>
                  <option value="90-Day BioMed Performance Guarantee">90-Day BioMed Performance Guarantee</option>
                  <option value="30-Day DEX SafeTrade Inspection Period">30-Day DEX SafeTrade Inspection Period</option>
                  <option value="As-Is Clinical Acceptance Window">As-Is Clinical Acceptance Window (48h)</option>
                </select>
              </div>

              <div className="form-field checkbox-field full-width">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="biomedCalibrated"
                    checked={formData.biomedCalibrated}
                    onChange={handleChange}
                  />
                  <span>Device has completed electrical safety & biomedical calibration verification</span>
                </label>
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="fdaCleared"
                    checked={formData.fdaCleared}
                    onChange={handleChange}
                  />
                  <span>FDA 510(k) Cleared or CE Mark Medical Compliance</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Seller Details */}
          <div className="form-card-section">
            <h2 className="section-title">3. Pricing & Seller Verification</h2>
            <div className="form-grid-2">
              <div className="form-field">
                <label>Asking Price ($ USD) *</label>
                <div className="input-with-prefix">
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    name="price"
                    placeholder="25000"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Original MSRP / New Price ($ USD)</label>
                <div className="input-with-prefix">
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    name="originalPrice"
                    placeholder="75000"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Seller / Facility Name *</label>
                <input
                  type="text"
                  name="sellerName"
                  placeholder="e.g. MetroHealth Surgery Center"
                  value={formData.sellerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label>Seller Facility Type</label>
                <select name="sellerType" value={formData.sellerType} onChange={handleChange}>
                  <option value="Hospital Surplus Consortium">Hospital Surplus Consortium</option>
                  <option value="Certified BioMed Refurbisher">Certified BioMed Refurbisher</option>
                  <option value="Ambulatory Surgical Center">Ambulatory Surgical Center</option>
                  <option value="Private Specialty Clinic">Private Specialty Clinic</option>
                  <option value="Authorized Medical Dealer">Authorized Medical Dealer</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label>Equipment Location (City, State / Country) *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Boston, MA, USA or Frankfurt, Germany"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Specifications & Image */}
          <div className="form-card-section">
            <h2 className="section-title">4. Technical Specifications & Image</h2>
            <div className="form-field">
              <label>Clinical Description & Condition Notes</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe current functionality, software versions, maintenance history, probe condition, and clinical usage..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Key Specifications & Included Accessories (One per line)</label>
              <textarea
                name="featuresInput"
                rows="4"
                placeholder="e.g. Includes 3 probes (cardiac, convex, linear)&#10;Software v3.2 DICOM enabled&#10;Recent battery replacement"
                value={formData.featuresInput}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Device Image</label>
              <div className="image-presets-selector">
                <span className="preset-label">Choose a clinical preset image or paste custom URL:</span>
                <div className="preset-buttons">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`preset-btn ${formData.image === preset.url ? "active" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, image: preset.url }))}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  name="image"
                  placeholder="Or enter image URL (https://...)"
                  value={formData.image}
                  onChange={handleChange}
                  style={{ marginTop: 10 }}
                />
              </div>

              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Device Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Publish Listing to DEX Marketplace
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
