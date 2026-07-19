import { Link, useNavigate } from "react-router-dom";
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
        {/*<Link to="/">Shop</Link>*/}
          {isAdmin && (
            <Link to="/admin" className="nav-admin-link">
              Admin
            </Link>
          )}
          {user ? (
            <>
              <Link to="/orders">Orders</Link>
              <button
                className="nav-link-btn"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
          <Link to="/cart" className="nav-cart">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
