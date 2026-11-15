import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar({ onSearchClick }) {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setCatalogOpen(false);
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="nav-left">
          <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
            <div className="nav-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20"/>
                <circle cx="12" cy="12" r="9" strokeOpacity="0.4"/>
              </svg>
            </div>
            <div className="nav-brand-text">
              <span className="brand-title">DEX</span>
              <span className="brand-badge-p2p">Device Exchange</span>
            </div>
          </Link>

          {/* Desktop Medical Categories Dropdown */}
          <div className="catalog-dropdown-wrapper desktop-only">
            <button
              type="button"
              className={`catalog-btn ${catalogOpen ? "active" : ""}`}
              onClick={() => setCatalogOpen(!catalogOpen)}
              aria-label="Medical Specialties & Categories"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              Specialties
            </button>
            {catalogOpen && (
              <div className="catalog-dropdown-menu" onClick={() => setCatalogOpen(false)}>
                <Link to="/" className="dropdown-item">All Medical Devices</Link>
                <Link to="/?category=Diagnostic & Imaging" className="dropdown-item">Diagnostic & Imaging (Ultrasound / CT)</Link>
                <Link to="/?category=Patient Monitoring & ICU" className="dropdown-item">Patient Monitoring & ICU</Link>
                <Link to="/?category=Surgical & OR Equipment" className="dropdown-item">Surgical & OR Equipment</Link>
                <Link to="/?category=Respiratory & Anesthesia" className="dropdown-item">Respiratory & Anesthesia</Link>
                <Link to="/?category=Cardiology & Defibrillators" className="dropdown-item">Cardiology & Defibrillators</Link>
                <Link to="/?category=Laboratory & Pathology" className="dropdown-item">Laboratory & Pathology</Link>
                <Link to="/?category=Ophthalmic & Dental" className="dropdown-item">Ophthalmic & Dental</Link>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-main-links desktop-only">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Marketplace
            </NavLink>
            <NavLink to="/?condition=Certified Refurbished" className="nav-item">
              BioMed Certified
            </NavLink>
            <NavLink to="/?condition=Hospital Surplus" className="nav-item">
              Hospital Surplus
            </NavLink>
            <NavLink to="/orders" className="nav-item">
              P2P Offers & Activity
            </NavLink>
          </nav>
        </div>

        <div className="nav-right">
          {/* Prominent Sell / List Medical Device Button */}
          <Link to="/sell" className="nav-sell-btn desktop-only">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            List a Device
          </Link>

          {onSearchClick && (
            <button
              type="button"
              className="nav-icon-btn"
              onClick={onSearchClick}
              title="Search medical devices"
              aria-label="Search medical devices"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          )}

          <button
            type="button"
            className="nav-icon-btn theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle dark/light theme"
          >
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          <Link to="/cart" className="nav-cart-btn" title="Purchase Order Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="desktop-only">Escrow Cart</span>
            {count > 0 && <span className="cart-badge-count">{count}</span>}
          </Link>

          {isAdmin && (
            <Link to="/admin" className="admin-badge-btn desktop-only">
              Compliance Admin
            </Link>
          )}

          {user ? (
            <div className="user-menu-wrapper desktop-only">
              <Link to="/orders" className="nav-user-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Facility Hub</span>
              </Link>
              <button
                type="button"
                className="nav-logout-btn"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                title="Log out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-user-btn desktop-only">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Sign in</span>
            </Link>
          )}

          {/* Hamburger Menu Toggle Button for Mobile */}
          <button
            type="button"
            className="hamburger-toggle-btn mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobileMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">DEX Exchange</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={closeMobileMenu}
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            <div className="mobile-drawer-section">
              <Link to="/sell" className="mobile-sell-btn" onClick={closeMobileMenu}>
                + List Medical Equipment
              </Link>
            </div>

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">Browse</span>
              <NavLink to="/" end className="mobile-nav-link" onClick={closeMobileMenu}>
                All Medical Devices
              </NavLink>
              <NavLink to="/?condition=Certified Refurbished" className="mobile-nav-link" onClick={closeMobileMenu}>
                BioMed Certified
              </NavLink>
              <NavLink to="/?condition=Hospital Surplus" className="mobile-nav-link" onClick={closeMobileMenu}>
                Hospital Surplus
              </NavLink>
              <NavLink to="/orders" className="mobile-nav-link" onClick={closeMobileMenu}>
                My P2P Offers & Orders
              </NavLink>
            </div>

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">Medical Specialties</span>
              <Link to="/?category=Diagnostic & Imaging" className="mobile-nav-link" onClick={closeMobileMenu}>
                Diagnostic & Imaging
              </Link>
              <Link to="/?category=Patient Monitoring & ICU" className="mobile-nav-link" onClick={closeMobileMenu}>
                Patient Monitoring & ICU
              </Link>
              <Link to="/?category=Surgical & OR Equipment" className="mobile-nav-link" onClick={closeMobileMenu}>
                Surgical & OR Equipment
              </Link>
              <Link to="/?category=Respiratory & Anesthesia" className="mobile-nav-link" onClick={closeMobileMenu}>
                Respiratory & Anesthesia
              </Link>
              <Link to="/?category=Cardiology & Defibrillators" className="mobile-nav-link" onClick={closeMobileMenu}>
                Cardiology & Defibrillators
              </Link>
              <Link to="/?category=Laboratory & Pathology" className="mobile-nav-link" onClick={closeMobileMenu}>
                Laboratory & Pathology
              </Link>
              <Link to="/?category=Ophthalmic & Dental" className="mobile-nav-link" onClick={closeMobileMenu}>
                Ophthalmic & Dental
              </Link>
            </div>

            <div className="mobile-drawer-section mobile-account-section">
              <span className="mobile-section-label">Facility Account</span>
              {isAdmin && (
                <Link to="/admin" className="mobile-nav-link admin-highlight" onClick={closeMobileMenu}>
                  Compliance Admin Console
                </Link>
              )}
              {user ? (
                <>
                  <Link to="/orders" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Facility Orders & Offers
                  </Link>
                  <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={async () => {
                      await logout();
                      closeMobileMenu();
                      navigate("/");
                    }}
                  >
                    Sign Out ({user.email})
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-login-btn" onClick={closeMobileMenu}>
                  Sign In / Register Clinic
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
