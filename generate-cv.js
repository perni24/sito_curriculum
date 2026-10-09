// Genera un curriculum HTML pronto per la stampa in PDF, ottimizzato per gli ATS, a partire da data.json.
// Uso: node generate-cv.js [output.html]

const fs = require("fs");
const path = require("path");

const SITE_URL = "https://perni24.github.io/sito_curriculum/";
const QR_IMAGE = "img/qrcode_curriculum.png";

const CATEGORY_LABELS = {
    linguaggi: "Linguaggi",
    database: "Database",
    framework_e_tecnologie: "Framework e tecnologie",
    strumenti_e_devops: "Strumenti e DevOps",
    iot_e_automazione: "IoT e automazione",
    ai_e_llm: "AI e LLM"
};

const STYLE = `
    :root {
        --accent: #2563eb;
        --text: #1f2937;
        --heading: #0f172a;
        --muted: #64748b;
        --border: #dbe3ee;
    }

    @page {
        size: A4;
        margin: 12mm 15mm;
    }

    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        background: #eef2f7;
        color: var(--text);
        /* Solo font di sistema: i web font (es. Inter da Google Fonts) in alcuni browser
           finiscono nel PDF senza mappatura del testo e diventano illeggibili per gli ATS */
        font-family: "Segoe UI", Arial, Helvetica, sans-serif;
        font-size: 10pt;
        line-height: 1.45;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .sheet {
        width: 210mm;
        min-height: 297mm;
        margin: 24px auto;
        padding: 14mm 15mm;
        background: #fff;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--accent);
    }

    h1 {
        margin: 0;
        color: var(--heading);
        font-size: 24pt;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.01em;
    }

    .role {
        margin: 4px 0 10px;
        color: var(--accent);
        font-size: 12pt;
        font-weight: 600;
    }

    .contacts {
        margin: 0;
        color: var(--muted);
        font-size: 9pt;
    }

    .contacts span {
        white-space: nowrap;
    }

    .contacts span + span::before {
        content: "|";
        margin: 0 7px;
        color: var(--border);
    }

    .qr {
        flex-shrink: 0;
        text-align: center;
        color: var(--muted);
        font-size: 7pt;
    }

    .qr img {
        display: block;
        width: 22mm;
        height: 22mm;
        margin-bottom: 2px;
    }

    section {
        margin-top: 12px;
    }

    h2 {
        margin: 0 0 8px;
        padding-bottom: 3px;
        border-bottom: 1px solid var(--border);
        color: var(--accent);
        font-size: 10pt;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    .entry {
        break-inside: avoid;
    }

    .entry + .entry {
        margin-top: 9px;
    }

    .entry-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
    }

    h3 {
        margin: 0;
        color: var(--heading);
        font-size: 10.5pt;
        font-weight: 700;
    }

    .date {
        flex-shrink: 0;
        color: var(--muted);
        font-size: 9pt;
        font-weight: 600;
    }

    .org {
        margin: 1px 0 0;
        color: var(--muted);
        font-weight: 600;
    }

    p {
        margin: 0;
    }

    ul {
        margin: 4px 0 0;
        padding-left: 16px;
    }

    li + li {
        margin-top: 2px;
    }

    .skills {
        list-style: none;
        padding: 0;
    }

    .skills li + li {
        margin-top: 3px;
    }

    .skills strong {
        color: var(--heading);
    }

    .level {
        color: var(--muted);
    }

    .languages span + span::before {
        content: "|";
        margin: 0 8px;
        color: var(--border);
    }

    .consent {
        margin-top: 12px;
        color: var(--muted);
        font-size: 7.5pt;
    }

    @media print {
        body {
            background: none;
        }

        .sheet {
            width: auto;
            min-height: 0;
            margin: 0;
            padding: 0;
            box-shadow: none;
        }
    }

    @media screen and (max-width: 820px) {
        .sheet {
            width: auto;
            min-height: 0;
            margin: 0;
            padding: 20px 16px;
        }

        header,
        .entry-head {
            flex-direction: column;
            gap: 4px;
        }
    }
`;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatCategoryName(category) {
    if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
    const label = category.replace(/_/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function stripProtocol(url) {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function link(url, text = stripProtocol(url)) {
    return `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;
}

// "01/04/2024 – Oggi" -> "04/2024 – Oggi": formato date uniforme (MM/AAAA)
function formatPeriod(period) {
    return String(period).replace(/\b\d{1,2}\/(\d{1,2}\/\d{4})\b/g, "$1");
}

function toList(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function bulletList(items) {
    const list = toList(items);
    if (!list.length) return "";
    return `<ul>${list.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function section(title, body) {
    return `<section><h2>${title}</h2>${body}</section>`;
}

function entry(title, date, org, body = "") {
    return `
        <div class="entry">
            <div class="entry-head">
                <h3>${escapeHtml(title)}</h3>
                ${date ? `<span class="date">${escapeHtml(date)}</span>` : ""}
            </div>
            ${org ? `<p class="org">${org}</p>` : ""}
            ${body}
        </div>`;
}

function renderHeader(data) {
    const c = data.contatti || {};
    const personal = [
        c.residenza && escapeHtml(c.residenza),
        c.telefono && link(`tel:${c.telefono.replace(/\s/g, "")}`, c.telefono),
        c.email && link(`mailto:${c.email}`, c.email)
    ].filter(Boolean);
    const online = [
        c.linkedin && `LinkedIn: ${link(c.linkedin)}`,
        c.github && `GitHub: ${link(c.github)}`
    ].filter(Boolean);
    const portfolio = [`Portfolio: ${link(SITE_URL)}`];
    const contactLine = items => `<p class="contacts">${items.map(item => `<span>${item}</span>`).join(" ")}</p>`;

    return `
        <header>
            <div>
                <h1>${escapeHtml(data.nome)}</h1>
                <p class="role">${escapeHtml(data.titolo)}</p>
                ${contactLine(personal)}
                ${contactLine(online)}
                ${contactLine(portfolio)}
            </div>
            <a class="qr" href="${SITE_URL}">
                <img src="${QR_IMAGE}" alt="QR code del curriculum online">
                CV online
            </a>
        </header>`;
}

function renderExperiences(esperienze) {
    return section("Esperienza professionale", esperienze
        .map(exp => entry(exp.ruolo, formatPeriod(exp.periodo), escapeHtml(exp.azienda), bulletList(exp.note)))
        .join(""));
}

function renderProjects(progetti) {
    return section("Progetti", progetti
        .map(p => {
            const meta = [toList(p.tecnologie).map(escapeHtml).join(", "), p.link && link(p.link)]
                .filter(Boolean)
                .join(" | ");
            return entry(p.nome, "", meta, bulletList(p.descrizione));
        })
        .join(""));
}

function renderSkills(competenze) {
    const rows = Object.entries(competenze).map(([category, skills]) => {
        // Se le voci contengono già virgole o due punti, le separo con ";" per non confonderle
        const separator = skills.some(s => /[,:]/.test(s.nome)) ? "; " : ", ";
        const list = skills
            .map(s => escapeHtml(s.nome) + (s.livello ? ` <span class="level">– ${escapeHtml(s.livello.toLowerCase())}</span>` : ""))
            .join(separator);
        return `<li><strong>${escapeHtml(formatCategoryName(category))}:</strong> ${list}</li>`;
    });
    return section("Competenze tecniche", `<ul class="skills">${rows.join("")}</ul>`);
}

function renderLanguages(lingue) {
    const items = lingue.map(l => `<span><strong>${escapeHtml(l.lingua)}:</strong> ${escapeHtml(l.livello)}</span>`);
    return section("Lingue", `<p class="languages">${items.join(" ")}</p>`);
}

function renderEducation(formazione) {
    return section("Formazione", formazione
        .map(f => {
            const org = [f.istituto && escapeHtml(f.istituto), f.voto && `Voto: ${escapeHtml(f.voto)}`]
                .filter(Boolean)
                .join(" | ");
            return entry(f.corso, f.anno, org);
        })
        .join(""));
}

function generateHtml(data) {
    const sections = [
        renderHeader(data),
        data.profilo && section("Profilo", `<p>${escapeHtml(data.profilo)}</p>`),
        data.esperienze?.length && renderExperiences(data.esperienze),
        data.progetti?.length && renderProjects(data.progetti),
        data.competenze && renderSkills(data.competenze),
        data.lingue?.length && renderLanguages(data.lingue),
        data.formazione?.length && renderEducation(data.formazione),
        `<p class="consent">Autorizzo il trattamento dei dati personali contenuti nel presente curriculum ai sensi del D.Lgs. 196/2003 e del Regolamento UE 2016/679 (GDPR).</p>`
    ].filter(Boolean);

    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curriculum Vitae - ${escapeHtml(data.nome)}</title>
    <style>${STYLE}</style>
</head>
<body>
    <main class="sheet">
        ${sections.join("\n")}
    </main>
</body>
</html>
`;
}

const dataPath = path.join(__dirname, "data.json");
const outputPath = path.resolve(process.argv[2] || path.join(__dirname, "curriculum_ats.html"));

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
fs.writeFileSync(outputPath, generateHtml(data), "utf8");
console.log(`Curriculum generato: ${outputPath}`);
