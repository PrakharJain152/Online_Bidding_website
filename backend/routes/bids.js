const express = require("express");

module.exports = function (pool) {
  const router = express.Router();

  // -------------------------------
  // USER MUST BE LOGGED IN
  // -------------------------------
  function requireLogin(req, res, next) {
    if (!req.session.userId) return res.redirect("/login");
    next();
  }

  // -------------------------------
  // PLACE A BID
  // -------------------------------
  router.post("/bid", requireLogin, async (req, res) => {
    const { product_id, bid_amount } = req.body;
    const amount = parseFloat(bid_amount);
    const uid = req.session.userId;

    if (!amount || amount <= 0)
      return res.status(400).send("Invalid bid amount");

    try {
      // Fetch product info
      const [[product]] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [product_id]
      );

      if (!product) return res.status(404).send("Product not found");

      // --------- Prevent bidding if auction ended ---------
      if (product.auction_end) {
        const endTime = new Date(product.auction_end);
        if (endTime.getTime() <= Date.now()) {
          return res.status(400).send("Auction has ended");
        }
      }

      // --------- Prevent bidding if winner already selected ---------
      if (product.winner_id) {
        return res.status(400).send("Auction already closed");
      }

      // --------- Bid must be higher than current ---------
      if (amount <= parseFloat(product.current_price)) {
        return res.status(400).send("Bid must be higher than current price");
      }

      // --------- Safe SQL transaction ---------
      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        // Insert bid
        await conn.query(
          "INSERT INTO bids (user_id, product_id, bid_amount) VALUES (?, ?, ?)",
          [uid, product_id, amount]
        );

        // Update product price
        await conn.query(
          "UPDATE products SET current_price = ? WHERE id = ?",
          [amount, product_id]
        );

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        console.error("Bid failed:", err);
        return res.status(500).send("Error placing bid");
      } finally {
        conn.release();
      }

      res.redirect("/product/" + product_id);
    } catch (err) {
      console.error("Bid route error:", err);
      res.status(500).send("Server error");
    }
  });

  return router;
};
