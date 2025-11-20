import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // -----------------------------------------------------
  // Load all products
  // -----------------------------------------------------
  useEffect(() => {
    getProducts()
      .then((res) => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  if (loading) return <h2 style={{ padding: 20 }}>Loading products...</h2>;
  if (error) return <h2 style={{ padding: 20, color: "red" }}>{error}</h2>;

  return (
    <div className="container-react">
      <h1>Available Products</h1>

      <div className="grid-react">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="card-react">
              <img
                src={p.image_url || "/img/placeholder.png"}
                alt={p.title}
                className="card-react-image"
              />

              <h3>{p.title}</h3>
              <p>Current Price: <strong>₹{p.current_price}</strong></p>

              {p.auction_end && (
                <p className="small-react-text">
                  Ends: {new Date(p.auction_end).toLocaleString()}
                </p>
              )}

              <Link to={`/product/${p.id}`} className="btn-react">
                View Details
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
