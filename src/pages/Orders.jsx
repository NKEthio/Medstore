import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import "./Orders.css";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        if (cancelled) return;
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStatus("ready");
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user.uid]);

  if (status === "loading") return <p className="container home-state">Loading your orders…</p>;

  if (status === "error") {
    return (
      <p className="container home-state error-text">
        Couldn't load orders. This query needs a Firestore composite index —
        check the browser console for a link to create it.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container orders-empty-container">
        <div className="orders-empty-content">
          <svg
            className="orders-empty-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          <h2>No orders yet</h2>
          <p>Any orders you place will be beautifully documented here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders">
      <h1>Your orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <p className="order-id">Order #{order.id.slice(0, 8)}</p>
              <span className={`badge-pill ${order.status?.toLowerCase() || "placed"}`}>
                {order.status || "placed"}
              </span>
            </div>
            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.qty} × {item.name}
                </li>
              ))}
            </ul>
            <p className="order-total">${order.subtotal.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
