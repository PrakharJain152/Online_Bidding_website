require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const path = require("path");
const multer = require("multer");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3000;

/* -----------------------------------------
   DATABASE CONNECTION POOL
----------------------------------------- */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bidding_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* -----------------------------------------
   MULTER IMAGE UPLOAD CONFIG
----------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* -----------------------------------------
   MIDDLEWARE
----------------------------------------- */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* -----------------------------------------
   ROUTES (Modular)
----------------------------------------- */
const authRoutes = require("./routes/auth")(pool);
const productRoutes = require("./routes/products")(pool, upload);
const adminRoutes = require("./routes/admin")(pool, upload);
const bidRoutes = require("./routes/bids")(pool);

app.use("/", authRoutes);
app.use("/", productRoutes);
app.use("/", adminRoutes);
app.use("/", bidRoutes);

/* -----------------------------------------
   CRON JOB — AUTO CLOSE AUCTIONS
----------------------------------------- */
cron.schedule("* * * * *", async () => {
  try {
    const [expired] = await pool.query(
      "SELECT * FROM products WHERE auction_end <= NOW() AND winner_id IS NULL"
    );

    for (const p of expired) {
      const [topBid] = await pool.query(
        "SELECT * FROM bids WHERE product_id = ? ORDER BY bid_amount DESC, created_at DESC LIMIT 1",
        [p.id]
      );

      if (topBid.length === 0) {
        await pool.query(
          "UPDATE products SET winner_id = NULL WHERE id = ?",
          [p.id]
        );
      } else {
        await pool.query(
          "UPDATE products SET winner_id = ? WHERE id = ?",
          [topBid[0].user_id, p.id]
        );
      }
    }
  } catch (err) {
    console.error("Error closing auctions:", err);
  }
});

/* -----------------------------------------
   START SERVER
----------------------------------------- */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
