import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, placeBid } from "../api";

function ProductPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // -----------------------------------------------------
  // Load product details
  // -----------------------------------------------------
  useEffect(() => {
    getProductById(id)
      .then((res) => {
        setProduct(res.data.product);
        setBids(res.data.bids || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  // -----------------------------------------------------
  // Submit Bid
  // -----------------------------------------------------
  const handleBid = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!bidAmount || bidAmount <= 0) {
      return setMessage("Invalid bid amount.");
    }

    try {
      await placeBid(id, bidAmount);

      // Reload product & bids
      const res = await getProductById(id);
      setProduct(res.data.product);
      setBids(res.data.bids);

      setMessage("Bid placed successfully!");
      setBidAmount("");
    } catch (err) {
      setMessage(
        err?.response?.data || "Error placing bid"
      );
    }
  };

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;
  if (error) return <h2 style={{ padding: 20, color: "red" }}>{error}</h2>;
  if (!product) return <h2 style={{ padding: 20 }}>Product not found</h2>;

  const auctionEnded =
    product.auction_end &&
    new Date(product.auction_end).getTime() <= Date.now();

  return (
    <div className="container-react">

      <h1>{product.title}</h1>

      <div className="product-detail-react">

        {/* IMAGE */}
        <img
          src={product.image_url || "/img/placeholder.png"}
          alt={product.title}
          className="product-detail-img-react"
        />

        {/* INFO */}
        <div className="product-detail-info-react">
          <p>{product.description}</p>

          <p className="price-react">
            Current Price: <strong>₹{product.current_price}</strong>
          </p>

          {product.auction_end && (
            <p className="small-react-text">
              Auction Ends: {new Date(product.auction_end).toLocaleString()}
            </p>
          )}

          {product.winner_id && (
            <p className="winner-react">Winner Selected — Auction Closed</p>
          )}

          {/* BID FORM */}
          {!product.winner_id && !auctionEnded && (
            <form onSubmit={handleBid} className="bid-form-react">
              <label>Enter Your Bid</label>

              <input
                type="number"
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />

              <button type="submit" className="btn-react-green">
                Place Bid
              </button>
            </form>
          )}

          {auctionEnded && !product.winner_id && (
            <p className="error-react">Auction has ended.</p>
          )}

          {message && <p className="info-react">{message}</p>}
        </div>
      </div>

      <hr />

      {/* BID HISTORY */}
      <h2>Bid History</h2>

      {bids.length === 0 ? (
        <p>No bids yet. Be the first to bid!</p>
      ) : (
        <ul className="bid-list-react">
          {bids.map((b) => (
            <li key={b.id} className="bid-item-react">
              <strong>{b.name}</strong> bid ₹{b.bid_amount}
              <span className="small-react-text">
                {" "}
                ({new Date(b.created_at).toLocaleString()})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductPage;
