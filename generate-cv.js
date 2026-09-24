// Genera un curriculum in Markdown, ottimizzato per gli ATS, a partire da data.json.
// Uso: node generate-cv.js [output.md]

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
    ai: "AI e sviluppo assistito"
};

function formatCategoryName(category) {
    if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
    const label = category.replace(/_/g, " ");
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function stripProtocol(url) {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function renderHeader(data) {
    const c = data.contatti;
    return [
        `# ${data.nome}`,
        "",
        `**${data.titolo}**`,
        "",
        `${c.residenza} | ${c.telefono} | ${c.email}`,
        "",
        `LinkedIn: ${stripProtocol(c.linkedin)} | GitHub: ${stripProtocol(c.github)} | Curriculum online: ${stripProtocol(SITE_URL)}`
    ];
}

function renderProfile(data) {
    return ["## Profilo", "", data.profilo];
}

function renderExperiences(esperienze) {
    const lines = ["## Esperienza professionale"];
    esperienze.forEach(exp => {
        lines.push("", `### ${exp.ruolo}`, `${exp.azienda} | ${exp.periodo}`);
        if (exp.note) lines.push("", `- ${exp.note}`);
    });
    return lines;
}

function renderSkills(competenze) {
    const lines = ["## Competenze", ""];
    Object.entries(competenze).forEach(([category, skills]) => {
        const list = skills.map(s => `${s.nome} (${s.livello})`).join(", ");
        lines.push(`- **${formatCategoryName(category)}:** ${list}`);
    });
    return lines;
}

function renderEducation(formazione) {
    const lines = ["## Formazione"];
    formazione.forEach(f => {
        const details = [f.istituto, f.anno, f.voto && `Voto: ${f.voto}`].filter(Boolean).join(" | ");
        lines.push("", `### ${f.corso}`, details);
    });
    return lines;
}

function renderFooter() {
    return [
        "## Curriculum online",
        "",
        `Versione completa e aggiornata: ${SITE_URL}`,
        "",
        `<img src="${QR_IMAGE}" width="120" alt="QR code del curriculum online"/>`,
        "",
        "---",
        "",
        "Autorizzo il trattamento dei dati personali contenuti nel presente curriculum ai sensi del D.Lgs. 196/2003 e del Regolamento UE 2016/679 (GDPR)."
    ];
}

function generateMarkdown(data) {
    const sections = [
        renderHeader(data),
        renderProfile(data),
        renderExperiences(data.esperienze),
        renderSkills(data.competenze),
        renderEducation(data.formazione),
        renderFooter()
    ];
    return sections.map(s => s.join("\n")).join("\n\n") + "\n";
}

const dataPath = path.join(__dirname, "data.json");
const outputPath = path.resolve(process.argv[2] || path.join(__dirname, "curriculum_ats.md"));

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
fs.writeFileSync(outputPath, generateMarkdown(data), "utf8");
console.log(`Curriculum generato: ${outputPath}`);
