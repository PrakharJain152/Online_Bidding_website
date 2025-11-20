import React, { useEffect, useState } from "react";
import { getUserDashboard } from "../api";
import { Link, useNavigate } from "react-router-dom";

function UserDashboard({ user }) {
  const navigate = useNavigate();

  const [total, setTotal] = useState(0);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    getUserDashboard()
      .then((res) => {
        setTotal(res.data.total || 0);
        setBids(res.data.bids || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) return <h2 style={{ padding: 20 }}>Loading dashboard...</h2>;
  if (!user) return null;

  return (
    <div className="container-react">
      <h1>Your Dashboard</h1>

      {/* TOTAL BIDS */}
      <div className="stats-react">
        <h2>Total Bids Placed</h2>
        <p className="stats-number-react">{total}</p>
      </div>

      <hr />

      {/* BID HISTORY */}
      <h2>Your Bid History</h2>

      {bids.length === 0 ? (
        <p>You haven't placed any bids yet.</p>
      ) : (
        <ul className="bid-list-react">
          {bids.map((b) => (
            <li key={b.id} className="bid-item-react">
              <Link to={`/product/${b.product_id}`} className="product-link-react">
                <strong>{b.title}</strong>
              </Link>
              — ₹{b.bid_amount}
              <span className="small-react-text">
                {" "}
                on {new Date(b.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserDashboard;
