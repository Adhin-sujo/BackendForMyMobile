// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const csvFile = path.join(__dirname, 'emails.csv');

// Create file with headers if not exists
if (!fs.existsSync(csvFile)) {
  fs.writeFileSync(csvFile, 'email\n', 'utf8');
}

app.get('/emails', (req, res) => {
  fs.readFile(csvFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Failed to read emails' });

    const emails = data
      .trim()
      .split('\n')
      .slice(1) // Skip header row
      .filter((line) => line) // Ignore empty lines
      .map((email) => ({ email }));

    res.json(emails);
  });
});

app.post('/save-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  fs.appendFile(csvFile, `${email}\n`, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to save email' });
    res.json({ message: 'Email saved successfully' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
