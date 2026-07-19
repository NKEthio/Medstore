import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <p className="container home-state">Loading Admin Auth…</p>;
  }

  // Redirect to home if they are not signed in or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
