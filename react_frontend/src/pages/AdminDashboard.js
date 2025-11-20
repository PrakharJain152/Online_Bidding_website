import React, { useEffect, useState } from "react";
import {
  adminAddProduct,
  adminDeleteProduct,
  getProducts,
} from "../api";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard({ user }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState(null);

  // Add product form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");
  const [image, setImage] = useState(null);

  // Redirect non-admin users
  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.is_admin !== 1) navigate("/");
  }, [user, navigate]);

  // Load all products
  useEffect(() => {
    if (!user) return;
    getProducts()
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch(() => setMsg("Failed to load products"));
  }, [user]);

  // -----------------------------------------------------
  // Add Product Handler
  // -----------------------------------------------------
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setMsg(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("starting_price", startingPrice);
    formData.append("auction_end", auctionEnd);
    if (image) formData.append("image", image);

    try {
      await adminAddProduct(formData);
      setMsg("Product added successfully!");

      // Reload products
      const res = await getProducts();
      setProducts(res.data.products);

      // Reset form
      setTitle("");
      setDescription("");
      setStartingPrice("");
      setAuctionEnd("");
      setImage(null);
    } catch (err) {
      setMsg(err?.response?.data || "Error adding product");
    }
  };

  // -----------------------------------------------------
  // Delete Product
  // -----------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;

    try {
      await adminDeleteProduct(id);

      // Remove from UI
      setProducts(products.filter((p) => p.id !== id));
      setMsg("Product deleted.");
    } catch (err) {
      setMsg("Failed to delete product.");
    }
  };

  if (!user) return null;
  if (user.is_admin !== 1) return null;

  return (
    <div className="container-react">
      <h1>Admin Dashboard</h1>

      {msg && <p className="info-react">{msg}</p>}

      {/* -------------------------------------------------
           ADD PRODUCT FORM
      ------------------------------------------------- */}
      <div className="react-admin-form-wrapper">
        <h2>Add New Product</h2>

        <form onSubmit={handleAddProduct} className="react-admin-form">

          <label>Product Title</label>
          <input
            type="text"
            value={title}
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Description</label>
          <textarea
            value={description}
            placeholder="Product description..."
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Starting Price (₹)</label>
          <input
            type="number"
            step="0.01"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            required
          />

          <label>Auction End Time</label>
          <input
            type="datetime-local"
            value={auctionEnd}
            onChange={(e) => setAuctionEnd(e.target.value)}
          />

          <label>Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button className="btn-react-blue">Add Product</button>
        </form>
      </div>

      <hr />

      {/* -------------------------------------------------
           PRODUCT LIST
      ------------------------------------------------- */}
      <h2>Existing Products</h2>

      <div className="grid-react">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="card-react">

              <img
                src={p.image_url || "/img/placeholder.png"}
                alt={p.title}
                className="card-react-image"
              />

              <h3>{p.title}</h3>
              <p>₹{p.current_price}</p>

              {p.auction_end && (
                <p className="small-react-text">
                  Ends: {new Date(p.auction_end).toLocaleString()}
                </p>
              )}

              {p.winner_id && (
                <p className="winner-react">Winner Selected</p>
              )}

              <div className="admin-actions-react">
                <Link
                  to={`/admin/edit/${p.id}`}
                  className="btn-react-yellow"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="btn-react-red"
                >
                  Delete
                </button>

                <Link
                  to={`/product/${p.id}`}
                  className="btn-react-blue"
                >
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
