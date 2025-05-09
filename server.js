const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Initialize SQLite DB
const dbPath = path.join(__dirname, 'emails.db');
const db = new sqlite3.Database(dbPath);

// Create table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL
    )
  `);
});

// Save email (POST)
app.post('/save-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const stmt = db.prepare('INSERT INTO emails (email) VALUES (?)');
  stmt.run(email, function (err) {
    if (err) return res.status(500).json({ message: 'Failed to save email' });
    res.json({ message: 'Email saved successfully', id: this.lastID });
  });
  stmt.finalize();
});

// Get all emails (GET)
app.get('/emails', (req, res) => {
  db.all('SELECT email FROM emails ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Failed to retrieve emails' });
    res.json(rows);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
