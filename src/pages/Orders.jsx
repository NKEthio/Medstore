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

  if (status === "loading") return <p className="container home-state">Loading…</p>;

  if (status === "error") {
    return (
      <p className="container home-state error-text">
        Couldn't load orders. This query needs a Firestore composite index —
        check the browser console for a link to create it.
      </p>
    );
  }

  if (orders.length === 0) {
    return <p className="container home-state">You haven't placed any orders yet.</p>;
  }

  return (
    <div className="container orders">
      <h1>Your orders</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-card-header">
              <p className="order-id">Order #{order.id.slice(0, 8)}</p>
              <p className="order-status">{order.status}</p>
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
