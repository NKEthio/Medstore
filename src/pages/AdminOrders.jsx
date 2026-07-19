import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setStatus("loading");
    try {
      const snap = await getDocs(collection(db, "orders"));
      // Sort orders descending by createdAt manually to avoid immediate indexing errors
      const loadedOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      loadedOrders.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setOrders(loadedOrders);
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Check your admin privileges.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } catch (err) {
        console.error(err);
        alert("Failed to delete order. Check your admin privileges.");
      }
    }
  };

  if (status === "loading") return <p className="container home-state">Loading all orders…</p>;

  if (status === "error") {
    return (
      <p className="container home-state error-text">
        Couldn't load orders. Please check your admin permissions or Firestore security rules.
      </p>
    );
  }

  return (
    <div className="container admin-orders">
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>Manage Orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="home-state">No orders have been placed yet.</p>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <div className="admin-order-card" key={order.id}>
              <div className="admin-order-card-header">
                <div>
                  <p className="admin-order-id">Order #{order.id}</p>
                  <p className="admin-order-date">
                    {order.createdAt
                      ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                      : "Pending Timestamp"}
                  </p>
                </div>
                <div className="admin-order-actions">
                  <select
                    className="admin-status-select"
                    value={order.status || "placed"}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="placed">Placed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="btn small-btn danger-btn"
                    style={{ padding: "6px 12px", fontSize: "12px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="admin-order-body">
                <div className="admin-order-section">
                  <h3>Customer Details</h3>
                  <p><strong>Name:</strong> {order.shipping?.name || "N/A"}</p>
                  <p><strong>User ID:</strong> {order.userId || "N/A"}</p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {order.shipping
                      ? `${order.shipping.address || ""}, ${order.shipping.city || ""}, ${
                          order.shipping.postcode || ""
                        }`
                      : "N/A"}
                  </p>
                </div>

                <div className="admin-order-section">
                  <h3>Ordered Items</h3>
                  <ul className="admin-order-items-list">
                    {order.items?.map((item) => (
                      <li key={item.id}>
                        {item.qty} × {item.name} (${item.price?.toFixed(2)} each)
                      </li>
                    ))}
                  </ul>
                  <p className="admin-order-total">
                    <strong>Total Amount:</strong> ${order.subtotal?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
