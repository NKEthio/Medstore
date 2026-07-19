import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Lazy-load page components for route-based code-splitting
const Home = lazy(() => import("./pages/Home"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Orders = lazy(() => import("./pages/Orders"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProductForm = lazy(() => import("./pages/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<div className="container home-state">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/new"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/:id/edit"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
