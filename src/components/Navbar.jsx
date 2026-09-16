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
            Protech
          </Link>

          {/* Desktop Catalog Button */}
          <div className="catalog-dropdown-wrapper desktop-only">
            <button
              type="button"
              className={`catalog-btn ${catalogOpen ? "active" : ""}`}
              onClick={() => setCatalogOpen(!catalogOpen)}
              aria-label="Toggle Catalog Categories"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              Catalog
            </button>
            {catalogOpen && (
              <div className="catalog-dropdown-menu" onClick={() => setCatalogOpen(false)}>
                <Link to="/" className="dropdown-item">All Items</Link>
                <Link to="/?category=Smartphones" className="dropdown-item">Smartphones</Link>
                <Link to="/?category=Kitchen" className="dropdown-item">Kitchen Appliances</Link>
                <Link to="/?category=Audio" className="dropdown-item">Audio & Headphones</Link>
                <Link to="/?category=Game Console" className="dropdown-item">Game Consoles</Link>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-main-links desktop-only">
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Bestsellers
            </NavLink>
            <NavLink to="/?filter=sale" className="nav-item">
              Sale
            </NavLink>
            <NavLink to="/?filter=new" className="nav-item">
              New Arrivals
            </NavLink>
          </nav>
        </div>

        <div className="nav-right">
          {onSearchClick && (
            <button
              type="button"
              className="nav-icon-btn"
              onClick={onSearchClick}
              title="Search products"
              aria-label="Search products"
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

          <Link to="/cart" className="nav-cart-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="desktop-only">Cart</span>
            {count > 0 && <span className="cart-badge-count">{count}</span>}
          </Link>

          {isAdmin && (
            <Link to="/admin" className="admin-badge-btn desktop-only">
              Admin
            </Link>
          )}

          {user ? (
            <div className="user-menu-wrapper desktop-only">
              <Link to="/orders" className="nav-user-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Account</span>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Log in</span>
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
              <span className="mobile-drawer-title">Navigation</span>
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
              <span className="mobile-section-label">Browse</span>
              <NavLink to="/" end className="mobile-nav-link" onClick={closeMobileMenu}>
                Bestsellers
              </NavLink>
              <NavLink to="/?filter=sale" className="mobile-nav-link" onClick={closeMobileMenu}>
                Sale Items
              </NavLink>
              <NavLink to="/?filter=new" className="mobile-nav-link" onClick={closeMobileMenu}>
                New Arrivals
              </NavLink>
            </div>

            <div className="mobile-drawer-section">
              <span className="mobile-section-label">Categories</span>
              <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                All Categories
              </Link>
              <Link to="/?category=Smartphones" className="mobile-nav-link" onClick={closeMobileMenu}>
                Smartphones
              </Link>
              <Link to="/?category=Kitchen" className="mobile-nav-link" onClick={closeMobileMenu}>
                Kitchen Appliances
              </Link>
              <Link to="/?category=Audio" className="mobile-nav-link" onClick={closeMobileMenu}>
                Audio & Headphones
              </Link>
              <Link to="/?category=Game Console" className="mobile-nav-link" onClick={closeMobileMenu}>
                Game Consoles
              </Link>
            </div>

            <div className="mobile-drawer-section mobile-account-section">
              <span className="mobile-section-label">Account</span>
              {isAdmin && (
                <Link to="/admin" className="mobile-nav-link admin-highlight" onClick={closeMobileMenu}>
                  Admin Dashboard
                </Link>
              )}
              {user ? (
                <>
                  <Link to="/orders" className="mobile-nav-link" onClick={closeMobileMenu}>
                    My Orders & Profile
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
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
