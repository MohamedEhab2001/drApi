const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Create categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  // Create products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image TEXT NOT NULL,
    en_name TEXT NOT NULL,
    rs_name TEXT NOT NULL,
    en_desc TEXT NOT NULL,
    rs_desc TEXT NOT NULL,
    price REAL NOT NULL,
    category_id INTEGER,
    homepage boolean default false,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`);
});

db.close();
