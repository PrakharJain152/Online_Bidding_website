const express = require("express");
const path = require("path");

module.exports = function (pool, upload) {
  const router = express.Router();

  // -------------------------------
  // Admin authentication
  // -------------------------------
  function requireAdmin(req, res, next) {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.redirect("/admin-login");
    }
    next();
  }

  // -------------------------------
  // ADMIN DASHBOARD
  // -------------------------------
  router.get("/admin", requireAdmin, async (req, res) => {
    try {
      const [products] = await pool.query(
        "SELECT * FROM products ORDER BY created_at DESC"
      );

      res.render("admin-dashboard", {
        products,
        session: req.session
      });
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
      res.status(500).send("Server error");
    }
  });

  // -------------------------------
  // ADD PRODUCT
  // -------------------------------
  router.post(
    "/admin/add-product",
    requireAdmin,
    upload.single("image"),
    async (req, res) => {
      const { title, description, starting_price, auction_end } = req.body;

      const start = parseFloat(starting_price) || 0;
      const image_url = req.file ? "/uploads/" + req.file.filename : null;

      try {
        await pool.query(
          `INSERT INTO products 
           (title, description, image_url, starting_price, current_price, auction_end)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [title, description, image_url, start, start, auction_end || null]
        );

        res.redirect("/admin");
      } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).send("Error adding product");
      }
    }
  );

  // -------------------------------
  // EDIT PRODUCT FORM
  // -------------------------------
  router.get("/admin/edit/:id", requireAdmin, async (req, res) => {
    const id = req.params.id;

    try {
      const [[product]] = await pool.query(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );

      if (!product) return res.status(404).send("Product not found");

      res.render("edit-product", {
        product,
        session: req.session
      });
    } catch (err) {
      console.error("Error loading edit page:", err);
      res.status(500).send("Server error");
    }
  });

  // -------------------------------
  // SAVE EDITED PRODUCT
  // -------------------------------
  router.post(
    "/admin/edit/:id",
    requireAdmin,
    upload.single("image"),
    async (req, res) => {
      const id = req.params.id;
      const { title, description, starting_price, auction_end } = req.body;

      const start = parseFloat(starting_price) || 0;

      try {
        // Get old product
        const [[old]] = await pool.query(
          "SELECT * FROM products WHERE id = ?",
          [id]
        );

        if (!old) return res.status(404).send("Product not found");

        let image_url = old.image_url;
        if (req.file) image_url = "/uploads/" + req.file.filename;

        await pool.query(
          `UPDATE products
           SET title = ?, description = ?, image_url = ?, 
               starting_price = ?, current_price = ?, auction_end = ?
           WHERE id = ?`,
          [
            title,
            description,
            image_url,
            start,
            old.current_price, // preserve current price
            auction_end || null,
            id
          ]
        );

        res.redirect("/admin");
      } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).send("Error editing product");
      }
    }
  );

  // -------------------------------
  // DELETE PRODUCT
  // -------------------------------
  router.post("/admin/delete/:id", requireAdmin, async (req, res) => {
    const id = req.params.id;

    try {
      await pool.query("DELETE FROM products WHERE id = ?", [id]);
      res.redirect("/admin");
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).send("Error deleting product");
    }
  });

  return router;
};
