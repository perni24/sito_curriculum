// Genera l'immagine di anteprima del link (img/anteprima.png, 1200x630) a partire da data.json.
// È l'immagine che LinkedIn, WhatsApp, Telegram ecc. mostrano quando si condivide il sito (meta og:image).
// Uso: node generate-preview.js
// Richiede Google Chrome o Microsoft Edge; per un percorso diverso: CHROME_PATH="..." node generate-preview.js

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

const SITE_LABEL = "perni24.github.io/sito_curriculum";

const BROWSER_PATHS = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
].filter(Boolean);

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Tag presi solo da "tag_anteprima": se manca o è vuoto, l'immagine non ha tag
function collectTags(data) {
    if (!Array.isArray(data.tag_anteprima)) return [];
    return data.tag_anteprima.map(t => String(t).trim()).filter(Boolean);
}

function generateHtml(data) {
    const tags = collectTags(data).map(t => `<span>${escapeHtml(t)}</span>`).join("");

    return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<style>
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 1200px; height: 630px; overflow: hidden; }
    body {
        font-family: "Segoe UI", Arial, sans-serif;
        background: radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.16), transparent 520px), #f5f7fb;
        color: #0f172a;
        padding: 56px;
    }
    .card {
        position: relative;
        height: 100%;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 28px;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        padding: 64px 72px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .card::after {
        content: "";
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 12px;
        background: #2563eb;
    }
    /* Senza tag il testo va centrato in verticale, altrimenti resta vuota la metà bassa */
    .card.no-tags { justify-content: center; }
    .card.no-tags .url { top: auto; bottom: 64px; }
    .eyebrow { color: #2563eb; font-size: 22px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
    h1 { margin-top: 18px; font-size: 104px; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
    .role { margin-top: 20px; color: #64748b; font-size: 40px; font-weight: 600; }
    .stack { margin-top: auto; display: flex; flex-wrap: wrap; gap: 12px; }
    .stack span {
        padding: 10px 20px;
        border: 1px solid #dbe3ee;
        border-radius: 999px;
        background: #f8fafc;
        font-size: 24px;
        font-weight: 600;
    }
    .url { position: absolute; right: 72px; top: 64px; color: #64748b; font-size: 22px; font-weight: 600; }
</style>
</head>
<body>
    <div class="card${tags ? "" : " no-tags"}">
        <span class="url">${escapeHtml(SITE_LABEL)}</span>
        <p class="eyebrow">Curriculum Vitae</p>
        <h1>${escapeHtml(data.nome)}</h1>
        <p class="role">${escapeHtml(data.titolo)}</p>
        ${tags ? `<div class="stack">${tags}</div>` : ""}
    </div>
</body>
</html>
`;
}

const browser = BROWSER_PATHS.find(p => fs.existsSync(p));
if (!browser) {
    console.error("Chrome o Edge non trovato. Indica il percorso con CHROME_PATH.");
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data.json"), "utf8"));
const outputPath = path.join(__dirname, "img", "anteprima.png");
const tempHtml = path.join(os.tmpdir(), `anteprima-${process.pid}.html`);

fs.writeFileSync(tempHtml, generateHtml(data), "utf8");
try {
    execFileSync(browser, [
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1200,630",
        `--screenshot=${outputPath}`,
        pathToFileURL(tempHtml).href
    ], { stdio: "ignore" });
} finally {
    fs.unlinkSync(tempHtml);
}

console.log(`Anteprima generata: ${outputPath}`);
