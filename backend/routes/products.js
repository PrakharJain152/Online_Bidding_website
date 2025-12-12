const express = require("express");
const path = require("path");

module.exports = function (pool, upload) {
  const router = express.Router();

  // -------------------------------
  // Middleware to check login
  // -------------------------------
  function requireLogin(req, res, next) {
    if (!req.session.userId) return res.redirect("/login");
    next();
  }

  // -------------------------------
  // PRODUCT LIST PAGE
  // -------------------------------
  router.get("/products", async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM products ORDER BY created_at DESC"
      );

      res.render("products", {
        products: rows,
        session: req.session
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).send("Server error");
    }
  });

  // -------------------------------
  // PRODUCT DETAIL PAGE
  // -------------------------------
  router.get("/product/:id", async (req, res) => {
    const id = req.params.id;

    try {
      const [[product]] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

      if (!product) return res.status(404).send("Product not found");

      const [bids] = await pool.query(
        `SELECT b.*, u.name 
         FROM bids b 
         JOIN users u ON u.id = b.user_id 
         WHERE b.product_id = ?
         ORDER BY b.bid_amount DESC, b.created_at DESC`,
        [id]
      );

      res.render("product", {
        product,
        bids,
        session: req.session
      });
    } catch (err) {
      console.error("Error loading product:", err);
      res.status(500).send("Server error");
    }
  });

  return router;
};
