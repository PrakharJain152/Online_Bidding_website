const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");

module.exports = function (pool) {
  const router = express.Router();

  // -------------------------------
  // Middleware to redirect logged users
  // -------------------------------
  function redirectIfLogged(req, res, next) {
    if (req.session.userId) return res.redirect("/products");
    next();
  }

  // --------------------------------------
  // USER SIGNUP — GET
  // --------------------------------------
  router.get("/signup", redirectIfLogged, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
  });

  // --------------------------------------
  // USER SIGNUP — POST
  // --------------------------------------
  router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).send("Missing fields");

    try {
      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashed]
      );

      res.redirect("/login");
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).send("Email might already be registered");
    }
  });

  // --------------------------------------
  // USER LOGIN — GET
  // --------------------------------------
  router.get("/login", redirectIfLogged, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "login.html"));
  });

  // --------------------------------------
  // USER LOGIN — POST
  // --------------------------------------
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = rows[0];
    if (!user) return res.status(400).send("Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).send("Invalid credentials");

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.isAdmin = user.is_admin === 1;

    res.redirect("/products");
  });

  // --------------------------------------
  // ADMIN LOGIN — GET
  // --------------------------------------
  router.get("/admin-login", redirectIfLogged, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "admin-login.html"));
  });

  // --------------------------------------
  // ADMIN LOGIN — POST
  // --------------------------------------
  router.post("/admin-login", async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const admin = rows[0];
    if (!admin) return res.status(400).send("Invalid admin credentials");

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok || admin.is_admin !== 1)
      return res.status(400).send("Invalid admin credentials");

    req.session.userId = admin.id;
    req.session.userName = admin.name;
    req.session.isAdmin = true;

    res.redirect("/admin");
  });

  // --------------------------------------
  // LOGOUT
  // --------------------------------------
  router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
  });

  return router;
};
