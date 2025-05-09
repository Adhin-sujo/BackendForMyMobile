const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// PostgreSQL config using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL
  );
`);

app.post('/save-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    await pool.query('INSERT INTO emails (email) VALUES ($1)', [email]);
    res.json({ message: 'Email saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save email' });
  }
});

app.get('/emails', async (req, res) => {
  try {
    const result = await pool.query('SELECT email FROM emails ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve emails' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
