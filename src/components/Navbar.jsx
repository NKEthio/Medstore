import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-mark">
          MedStore
        </Link>

        <nav className="nav-links">
        {/*<NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Shop</NavLink>*/}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active nav-admin-link" : "nav-link nav-admin-link"}>
              Admin
            </NavLink>
          )}
          {user ? (
            <>
              <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Orders</NavLink>
              <button
                className="nav-link nav-link-btn"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Sign in</NavLink>
          )}
          <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-link active nav-cart" : "nav-link nav-cart"}>
            Cart
            <span key={count} className={count > 0 ? "cart-badge animated" : "cart-badge"}>
              {count > 0 ? ` (${count})` : ""}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
