// server.js
const express = require('express');
const cors = require('cors');
const multer = require('./multer');
const cloudinary = require('cloudinary').v2;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');


// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dlu7bybps',
    api_key: '564313462757448',
    api_secret: 'i0ts9KsFSd1AcgTlrLLO3za8Wbw'
});

const app = express();
app.use(express.json());
app.use(cors());

// Route to add a category
app.post('/categories', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, name });
    });
  });

  app.get('/categories', (req, res) => {
    db.all('SELECT * FROM categories', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  app.get('/products/homepage', (req, res) => {
    db.all("SELECT * FROM products where homepage='true'", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  app.delete('/products/:id', (req, res) => {
    db.run(`DELETE FROM products where id = ${req.params.id}`, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  app.delete('/categories/:id', (req, res) => {
    db.run(`DELETE FROM categories where id = ${req.params.id}`, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

// Route to handle image upload
app.post('/products', multer.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
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
    homepage
  } = req.body;
  
  // Insert data into the products table
  db.run(
    `INSERT INTO products (image, en_name, rs_name, en_desc, rs_desc, price, category_id, homepage) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ress.secure_url, en_name, rs_name, en_desc, rs_desc, price, category_id, homepage],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, image, en_name, rs_name, en_desc, rs_desc, price, category_id, homepage });
    }
  );
});

// Start the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
