import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, isFallback } from "../lib/firebase";
import mockProducts from "../../sample-products.json";
import ProductCard from "../components/ProductCard";
import { getCachedProducts, setCachedProducts } from "../lib/productCache";
import "./Home.css";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(() => getCachedProducts() || []);
  const [status, setStatus] = useState(() => (getCachedProducts() ? "ready" : "loading"));

  // Active filter states
  const selectedCategory = searchParams.get("category") || "All items";
  const filterType = searchParams.get("filter") || ""; // 'sale' | 'new'

  const [selectedBrands, setSelectedBrands] = useState(["Apple", "SMEG", "Remez"]);
  const [brandSearch, setBrandSearch] = useState("");
  const [sortOption, setSortOption] = useState("Top rated");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSectionOpen, setPriceSectionOpen] = useState(true);
  const [brandSectionOpen, setBrandSectionOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isFallback) {
          const loaded = mockProducts.map((p) => ({ ...p }));
          setProducts(loaded);
          setCachedProducts(loaded);
          setStatus("ready");
          return;
        }
        const snap = await getDocs(collection(db, "products"));
        if (cancelled) return;
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const finalProducts = loaded.length > 0 ? loaded : mockProducts;
        setProducts(finalProducts);
        setCachedProducts(finalProducts);
        setStatus("ready");
      } catch (err) {
        console.error("Firestore fetch error, utilizing fallback sample products:", err);
        if (!cancelled) {
          setProducts(mockProducts);
          setCachedProducts(mockProducts);
          setStatus("ready");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute unique brands from products
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(products.map((p) => p.brand).filter(Boolean));
    // Ensure default popular brands are present
    ["Apple", "LG", "KitchenAid", "SMEG", "Samsung", "Sony", "Remez", "Bose"].forEach((b) =>
      brandsSet.add(b)
    );
    return Array.from(brandsSet);
  }, [products]);

  // Filter brands based on search input
  const filteredBrandsList = useMemo(() => {
    if (!brandSearch) return availableBrands;
    return availableBrands.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [availableBrands, brandSearch]);

  // Toggle brand selection
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedBrands([]);
    setSearchParams({});
    setBrandSearch("");
    setSearchQuery("");
  };

  // Remove a specific active filter tag
  const removeBrandFilter = (brand) => {
    setSelectedBrands((prev) => prev.filter((b) => b !== brand));
  };

  // Category change handler
  const handleCategoryChange = (cat) => {
    if (cat === "All items" || cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  // Main product filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (
        selectedCategory !== "All items" &&
        selectedCategory !== "All" &&
        product.category !== selectedCategory
      ) {
        return false;
      }

      // Special Filter Type (Sale / New)
      if (filterType === "sale" && !product.discount) return false;
      if (filterType === "new" && !product.isBestseller) return false;

      // Brand filter (if brands are selected)
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query);
        const catMatch = product.category?.toLowerCase().includes(query);
        if (!nameMatch && !brandMatch && !catMatch) return false;
      }

      return true;
    });
  }, [products, selectedCategory, filterType, selectedBrands, searchQuery]);

  // Sorted products
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
    return list;
  }, [filteredProducts, sortOption]);

  return (
    <div className="container home-page">
      {/* Top Breadcrumb & Header */}
      <div className="catalog-header-bar">
        <div className="catalog-title-wrapper">
          <h1 className="main-catalog-title">Bestsellers</h1>
          <div className="breadcrumb-nav">
            <span>Home</span>
            <span className="dot">•</span>
            <span className="active">Bestsellers</span>
          </div>
        </div>

        {/* Horizontal Category Tabs */}
        <div className="category-pill-tabs" role="tablist" aria-label="Catalog Categories">
          {["All items", "Smartphones", "Kitchen", "Game Console", "Audio"].map((cat) => (
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

        {/* Sort Dropdown */}
        <div className="sort-dropdown-container">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select-pill"
            aria-label="Sort products"
          >
            <option value="Top rated">≡ Top rated</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="catalog-layout">
        {/* Left Sidebar Filter Panel */}
        <aside className="sidebar-filters">
          {/* Reset Filters Button */}
          <div className="sidebar-top">
            <button type="button" className="reset-filters-btn" onClick={resetFilters}>
              <span className="close-icon">✕</span> Reset filters
            </button>
          </div>

          {/* Active Filter Chips */}
          <div className="active-filter-chips">
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

          {/* Search bar inside sidebar */}
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          {/* Accordion: Price Section */}
          <div className="filter-accordion-item">
            <button
              type="button"
              className="accordion-header"
              onClick={() => setPriceSectionOpen(!priceSectionOpen)}
            >
              <span>Price</span>
              <span className="accordion-chevron">{priceSectionOpen ? "∧" : "∨"}</span>
            </button>
            {priceSectionOpen && (
              <div className="accordion-body">
                <div className="price-range-inputs">
                  <span className="price-range-label">$0 — $2,000+</span>
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Brand Section */}
          <div className="filter-accordion-item">
            <button
              type="button"
              className="accordion-header"
              onClick={() => setBrandSectionOpen(!brandSectionOpen)}
            >
              <span>Brand</span>
              <span className="accordion-chevron">{brandSectionOpen ? "∧" : "∨"}</span>
            </button>
            {brandSectionOpen && (
              <div className="accordion-body">
                <div className="brand-search-box">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="search-icon"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search brands"
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
        </aside>

        {/* Main Product Grid */}
        <main className="catalog-main-content">
          {status === "loading" && (
            <div className="products-grid skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card-container">
                  <div className="skeleton-box image-box"></div>
                  <div className="skeleton-box title-box"></div>
                  <div className="skeleton-box price-box"></div>
                </div>
              ))}
            </div>
          )}

          {status === "ready" && sortedProducts.length === 0 && (
            <div className="empty-catalog-state">
              <p className="empty-title">No products found</p>
              <p className="empty-desc">
                Try clearing your active brand or category filters to view more items.
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
  );
}
