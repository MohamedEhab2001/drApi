// server.js
const express = require("express");
const cors = require("cors");
const multer = require("./multer");
const cloudinary = require("cloudinary").v2;
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dlu7bybps",
  api_key: "564313462757448",
  api_secret: "i0ts9KsFSd1AcgTlrLLO3za8Wbw",
});

const app = express();
app.use(express.json());
app.use(cors());

function bytesToGB(bytes) {
  return (bytes / 1073741824).toFixed(2); // Dividing by 1,073,741,824 and keeping 2 decimal places
}
app.get("/usage", async (req, res) => {
  try {
    const r = await cloudinary.api.usage();
    const storageUsageGB = bytesToGB(r.storage.usage);
    const bandwidthUsageGB = bytesToGB(r.bandwidth.usage);
    res.status(200).json({ storageUsageGB, bandwidthUsageGB });
  } catch (error) {
    res
      .status(200)
      .json({ storageUsageGB: "error", bandwidthUsageGB: "error" });
  }
});

// Route to add a category
app.post("/categories", (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO categories (name) VALUES (?)", [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name });
  });
});

app.get("/categories", (req, res) => {
  db.all("SELECT * FROM categories", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get("/products/homepage", (req, res) => {
  db.all("SELECT * FROM products where homepage='true'", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.delete("/products/:id", (req, res) => {
  db.run(`DELETE FROM products where id = ${req.params.id}`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.delete("/categories/:id", (req, res) => {
  db.run(`DELETE FROM categories where id = ${req.params.id}`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route to handle image upload
app.post("/products", multer.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = req.file.path;
  const ress = await cloudinary.uploader.upload(filePath, {
    public_id: req.file.originalname,
  });

  const {
    image,
    en_name,
    rs_name,
    en_desc,
    rs_desc,
    price,
    category_id,
    homepage,
  } = req.body;

  // Insert data into the products table
  db.run(
    `INSERT INTO products (image, en_name, rs_name, en_desc, rs_desc, price, category_id, homepage) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ress.secure_url,
      en_name,
      rs_name,
      en_desc,
      rs_desc,
      price,
      category_id,
      homepage,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        image,
        en_name,
        rs_name,
        en_desc,
        rs_desc,
        price,
        category_id,
        homepage,
      });
    }
  );
});

// Route to get all days
app.get("/days", (req, res) => {
  db.all("SELECT * FROM days", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Route to insert a new day
app.post("/days", (req, res) => {
  const { day, hours } = req.body;
  db.run(
    "INSERT INTO days (day, hours) VALUES (?, ?)",
    [day, hours],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, day, hours });
    }
  );
});

// Route to update a specific day
app.put("/days/:id", (req, res) => {
  const { id } = req.params;
  const { day, hours } = req.body;
  db.run(
    "UPDATE days SET day = ?, hours = ? WHERE id = ?",
    [day, hours, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Day not found" });
      }
      res.json({ id, day, hours });
    }
  );
});

// Route to delete a specific day
app.delete("/days/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM days WHERE id = ?", id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Day not found" });
    }
    res.json({ message: "Day deleted successfully" });
  });
});

// Start the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
