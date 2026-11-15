import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import mockProducts from "../../sample-products.json";
import ProductCard from "../components/ProductCard";
import { getCachedProducts, setCachedProducts } from "../lib/productCache";
import { useP2P } from "../context/P2PContext";
import "./Home.css";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userListings } = useP2P();

  const [products, setProducts] = useState(() => {
    const cached = getCachedProducts();
    if (cached && cached.length > 0) return cached;
    return mockProducts;
  });
  const [status, setStatus] = useState("ready");

  // Active filter states from URL search params
  const selectedCategory = searchParams.get("category") || "All Medical Specialties";
  const selectedCondition = searchParams.get("condition") || "";

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [sortOption, setSortOption] = useState("Top rated");
  const [searchQuery, setSearchQuery] = useState("");
  const [fdaOnly, setFdaOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100000);

  const [priceSectionOpen, setPriceSectionOpen] = useState(true);
  const [brandSectionOpen, setBrandSectionOpen] = useState(true);
  const [conditionSectionOpen, setConditionSectionOpen] = useState(true);

  // Fetch Firestore products or fallback
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isFallback) {
          const combined = [...userListings, ...mockProducts];
          setProducts(combined);
          setCachedProducts(combined);
          setStatus("ready");
          return;
        }
        const snap = await getDocs(collection(db, "products"));
        if (cancelled) return;
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const base = loaded.length > 0 ? loaded : mockProducts;
        const combined = [...userListings, ...base];
        setProducts(combined);
        setCachedProducts(combined);
        setStatus("ready");
      } catch (err) {
        console.error("Firestore fetch error, utilizing sample products:", err);
        if (!cancelled) {
          const combined = [...userListings, ...mockProducts];
          setProducts(combined);
          setCachedProducts(combined);
          setStatus("ready");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userListings]);

  // Compute unique medical categories
  const availableCategories = useMemo(() => {
    const catsSet = new Set(["All Medical Specialties"]);
    products.forEach((p) => {
      if ((!p.status || p.status === "active") && p.category) {
        catsSet.add(p.category);
      }
    });
    return Array.from(catsSet);
  }, [products]);

  // Compute unique medical brands/manufacturers
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(
      products
        .filter((p) => !p.status || p.status === "active")
        .map((p) => p.brand)
        .filter(Boolean)
    );
    return Array.from(brandsSet);
  }, [products]);

  // Filtered brands list
  const filteredBrandsList = useMemo(() => {
    if (!brandSearch) return availableBrands;
    return availableBrands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [availableBrands, brandSearch]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setBrandSearch("");
    setSearchQuery("");
    setFdaOnly(false);
    setMaxPrice(100000);
    setSearchParams({});
  };

  const removeBrandFilter = (brand) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== brand));
  };

  const handleCategoryChange = (cat) => {
    if (cat === "All Medical Specialties" || cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const handleConditionChange = (cond) => {
    if (!cond || cond === selectedCondition) {
      searchParams.delete("condition");
    } else {
      searchParams.set("condition", cond);
    }
    setSearchParams(searchParams);
  };

  // Main product filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status && product.status !== "active") {
        return false;
      }

      // Category filter
      if (
        selectedCategory !== "All Medical Specialties" &&
        selectedCategory !== "All" &&
        product.category !== selectedCategory
      ) {
        return false;
      }

      // Condition filter
      if (selectedCondition) {
        if (!product.condition?.toLowerCase().includes(selectedCondition.toLowerCase())) {
          return false;
        }
      }

      // FDA 510(k) filter
      if (fdaOnly && !product.fdaCleared) {
        return false;
      }

      // Max price filter
      if (product.price && product.price > maxPrice) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query);
        const catMatch = product.category?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const sellerMatch = product.seller?.name?.toLowerCase().includes(query);
        if (!nameMatch && !brandMatch && !catMatch && !descMatch && !sellerMatch) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedCondition, fdaOnly, maxPrice, selectedBrands, searchQuery]);

  // Sorting logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === "Top rated") {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortOption === "Price: Low to High") {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortOption === "Price: High to Low") {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sortOption === "Biggest Savings") {
      return list.sort((a, b) => {
        const savingA = (a.originalPrice || a.price) - a.price;
        const savingB = (b.originalPrice || b.price) - b.price;
        return savingB - savingA;
      });
    }
    if (sortOption === "Year: Newest") {
      return list.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    return list;
  }, [filteredProducts, sortOption]);

  return (
    <div className="home-page">
      {/* DEX Platform Hero Banner */}
      <section className="dex-hero-section">
        <div className="container dex-hero-inner">
          <div className="dex-hero-badge">
            <span className="live-dot" />
            GLOBAL P2P MEDICAL DEVICE EXCHANGE
          </div>
          <h1 className="dex-hero-title">
            Where Sellers Get Buyers & Buyers Get The Best Medical Devices
          </h1>
          <p className="dex-hero-subtitle">
            The trusted peer-to-peer marketplace for hospital surplus, certified refurbished systems, and clinical equipment. Complete with BioMed calibration verification and DEX SafeTrade Escrow protection.
          </p>

          {/* Quick Search Bar */}
          <div className="dex-hero-search-wrapper">
            <div className="dex-hero-search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search ultrasound, patient monitors, laparoscopy towers, CT scanners, brands (GE, Philips, Stryker)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="dex-hero-actions">
              <Link to="/sell" className="btn-primary hero-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Sell / List Equipment
              </Link>
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="dex-trust-strip">
            <div className="trust-item">
              <span className="trust-val">$48M+</span>
              <span className="trust-label">Equipment Exchanged</span>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <span className="trust-val">4,500+</span>
              <span className="trust-label">Clinics & Hospitals</span>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <span className="trust-val">100%</span>
              <span className="trust-label">SafeTrade Escrow Protected</span>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <span className="trust-val">48-Hour</span>
              <span className="trust-label">BioMed Inspection Window</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Marketplace Area */}
      <div className="container marketplace-container">
        {/* Top Control Bar: Category Tabs & Sort */}
        <div className="catalog-header-bar">
          <div className="catalog-title-wrapper">
            <h2 className="main-catalog-title">Clinical Equipment Catalog</h2>
            <div className="breadcrumb-nav">
              <span>DEX Exchange</span>
              <span className="dot">•</span>
              <span className="active">{selectedCategory}</span>
              <span className="dot">•</span>
              <span>{sortedProducts.length} devices available</span>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="sort-dropdown-container">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select-pill"
              aria-label="Sort medical devices"
            >
              <option value="Top rated">≡ Top Rated & Verified</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Biggest Savings">Biggest Savings vs MSRP</option>
              <option value="Year: Newest">Year: Newest Manufacture</option>
            </select>
          </div>
        </div>

        {/* Horizontal Category Specialty Pills */}
        <div className="category-pill-tabs" role="tablist" aria-label="Medical Specialties">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Condition Quick Filter Chips */}
        <div className="condition-chips-row">
          <span className="chips-label">Quick Filter:</span>
          <button
            type="button"
            className={`condition-chip ${!selectedCondition ? "active" : ""}`}
            onClick={() => handleConditionChange("")}
          >
            All Conditions
          </button>
          <button
            type="button"
            className={`condition-chip ${selectedCondition === "Certified Refurbished" ? "active" : ""}`}
            onClick={() => handleConditionChange("Certified Refurbished")}
          >
            ✓ Certified Refurbished
          </button>
          <button
            type="button"
            className={`condition-chip ${selectedCondition === "Hospital Surplus" ? "active" : ""}`}
            onClick={() => handleConditionChange("Hospital Surplus")}
          >
            🏥 Hospital Surplus
          </button>
          <button
            type="button"
            className={`condition-chip ${fdaOnly ? "active" : ""}`}
            onClick={() => setFdaOnly(!fdaOnly)}
          >
            🛡️ FDA 510(k) Cleared Only
          </button>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="catalog-layout">
          {/* Left Sidebar Filter Panel */}
          <aside className="sidebar-filters">
            <div className="sidebar-top">
              <span className="sidebar-heading">Filter Equipment</span>
              <button type="button" className="reset-filters-btn" onClick={resetFilters}>
                <span className="close-icon">✕</span> Reset all
              </button>
            </div>

            {/* Active Filter Chips */}
            {(selectedBrands.length > 0 || selectedCondition || fdaOnly || searchQuery) && (
              <div className="active-filter-chips">
                {selectedCondition && (
                  <span className="filter-chip">
                    {selectedCondition}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => handleConditionChange("")}
                      aria-label="Remove condition filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {fdaOnly && (
                  <span className="filter-chip">
                    FDA Cleared
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => setFdaOnly(false)}
                      aria-label="Remove FDA filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedBrands.map((brand) => (
                  <span key={brand} className="filter-chip">
                    {brand}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => removeBrandFilter(brand)}
                      aria-label={`Remove filter ${brand}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Price Filter Accordion */}
            <div className="filter-accordion-item">
              <button
                type="button"
                className="accordion-header"
                onClick={() => setPriceSectionOpen(!priceSectionOpen)}
              >
                <span>Price Cap: Up to ${maxPrice.toLocaleString()}</span>
                <span className="accordion-chevron">{priceSectionOpen ? "∧" : "∨"}</span>
              </button>
              {priceSectionOpen && (
                <div className="accordion-body">
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="2500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="price-slider"
                  />
                  <div className="price-slider-labels">
                    <span>$1k</span>
                    <span>$50k</span>
                    <span>$100k+</span>
                  </div>
                </div>
              )}
            </div>

            {/* Condition Accordion */}
            <div className="filter-accordion-item">
              <button
                type="button"
                className="accordion-header"
                onClick={() => setConditionSectionOpen(!conditionSectionOpen)}
              >
                <span>Device Condition</span>
                <span className="accordion-chevron">{conditionSectionOpen ? "∧" : "∨"}</span>
              </button>
              {conditionSectionOpen && (
                <div className="accordion-body condition-radio-list">
                  {[
                    { label: "All Conditions", value: "" },
                    { label: "Certified Refurbished", value: "Certified Refurbished" },
                    { label: "Hospital Surplus (Tested)", value: "Hospital Surplus" },
                    { label: "Hospital De-Installed", value: "Hospital De-Installed" },
                    { label: "BioMed Tested", value: "BioMed Tested" },
                  ].map((cond) => (
                    <label key={cond.value} className="condition-radio-label">
                      <input
                        type="radio"
                        name="condition-filter"
                        checked={selectedCondition === cond.value}
                        onChange={() => handleConditionChange(cond.value)}
                      />
                      <span>{cond.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brand / Manufacturer Accordion */}
            {availableBrands.length > 0 && (
              <div className="filter-accordion-item">
                <button
                  type="button"
                  className="accordion-header"
                  onClick={() => setBrandSectionOpen(!brandSectionOpen)}
                >
                  <span>OEM Manufacturer</span>
                  <span className="accordion-chevron">{brandSectionOpen ? "∧" : "∨"}</span>
                </button>
                {brandSectionOpen && (
                  <div className="accordion-body">
                    <div className="brand-search-box">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search manufacturers..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="brand-search-input"
                      />
                    </div>

                    <div className="brand-checkbox-list">
                      {filteredBrandsList.map((brand) => {
                        const checked = selectedBrands.includes(brand);
                        return (
                          <label key={brand} className="brand-checkbox-label">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleBrand(brand)}
                              className="custom-checkbox"
                            />
                            <span className="checkbox-custom-box">
                              {checked && <span className="checkmark">✓</span>}
                            </span>
                            <span className="brand-name">{brand}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* P2P Seller Callout */}
            <div className="sidebar-p2p-callout">
              <h4>Selling Surplus Equipment?</h4>
              <p>Connect directly with over 4,500 clinical buyers on DEX. No broker fees.</p>
              <Link to="/sell" className="btn-outline-accent">
                List Your Device
              </Link>
            </div>
          </aside>

          {/* Main Product Grid */}
          <main className="catalog-main-content">
            {status === "loading" && (
              <div className="products-grid skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card-container">
                    <div className="skeleton-box image-box" />
                    <div className="skeleton-box title-box" />
                    <div className="skeleton-box price-box" />
                  </div>
                ))}
              </div>
            )}

            {status === "ready" && sortedProducts.length === 0 && (
              <div className="empty-catalog-state">
                <div className="empty-icon">🏥</div>
                <h3 className="empty-title">No Medical Devices Found</h3>
                <p className="empty-desc">
                  No equipment matched your active filters. Try broadening your manufacturer selection or clearing search keywords.
                </p>
                <button type="button" className="btn-primary" onClick={resetFilters}>
                  Clear All Filters
                </button>
              </div>
            )}

            {status === "ready" && sortedProducts.length > 0 && (
              <div className="products-grid">
                {sortedProducts.map((product, index) => (
                  <ProductCard key={product.id || index} product={product} priority={index < 4} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
