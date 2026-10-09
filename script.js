async function loadData() {
    try {
        const response = await fetch("data.json");
        if (!response.ok) {
            throw new Error(`Errore nel caricamento del file JSON: ${response.statusText}`);
        }
        const data = await response.json();
        renderCV(data);
    } catch (error) {
        console.error("Si è verificato un errore:", error);
        document.getElementById("nome").textContent = "Errore nel caricamento";
    }
}

function el(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
        if (key === "textContent") {
            element.textContent = value;
        } else if (key === "className") {
            element.className = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    children.forEach(child => {
        if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
}

function formatCategoryName(category) {
    return category.replace(/_/g, " ");
}

function renderCV(data) {
    document.getElementById("nome").textContent = data.nome;
    document.getElementById("titolo").textContent = data.titolo;
    document.getElementById("profilo").textContent = data.profilo
        || "Sviluppatore full stack con esperienza su applicativi web, database e strumenti di automazione. Mi occupo di sviluppo e manutenzione di soluzioni software concrete.";
    document.getElementById("ultimo-aggiornamento").textContent = `Ultimo aggiornamento: ${data["ultimo aggiornamento"]}`;

    renderContacts(data.contatti);
    renderExperiences(data.esperienze);
    renderSkills(data.competenze);
    renderEducation(data.formazione);
    renderLanguages(data.lingue);
}

function renderLanguages(lingue) {
    const section = document.getElementById("lingue-section");
    if (!lingue || !lingue.length) {
        section.hidden = true;
        return;
    }

    const lingueList = document.getElementById("lingue-list");
    lingueList.innerHTML = "";

    lingue.forEach(lingua => {
        lingueList.appendChild(el("div", { className: "contact-item" }, [
            el("span", { className: "contact-label", textContent: lingua.lingua }),
            el("span", { className: "contact-value", textContent: lingua.livello })
        ]));
    });
}

function renderContacts(contatti) {
    const contattiList = document.getElementById("contatti-list");
    contattiList.innerHTML = "";

    const contactEntries = [
        { label: "Residenza", value: contatti.residenza },
        { label: "Email", value: contatti.email, href: `mailto:${contatti.email}` },
        { label: "Telefono", value: contatti.telefono, href: `tel:${contatti.telefono.replace(/\s/g, "")}` },
        { label: "GitHub", value: "github.com/perni24", href: contatti.github },
        { label: "LinkedIn", value: "Profilo LinkedIn", href: contatti.linkedin }
    ];

    contactEntries.forEach(item => {
        const value = item.href
            ? el("a", { className: "contact-value", href: item.href, target: item.href.startsWith("http") ? "_blank" : "_self", textContent: item.value })
            : el("span", { className: "contact-value", textContent: item.value });

        contattiList.appendChild(el("div", { className: "contact-item" }, [
            el("span", { className: "contact-label", textContent: item.label }),
            value
        ]));
    });
}

function renderExperiences(esperienze) {
    const esperienzeList = document.getElementById("esperienze-list");
    esperienzeList.innerHTML = "";

    esperienze.forEach(exp => {
        const note = Array.isArray(exp.note)
            ? el("ul", { className: "note note-list" }, exp.note.map(n => el("li", { textContent: n })))
            : el("p", { className: "note", textContent: exp.note });

        esperienzeList.appendChild(el("article", { className: "item" }, [
            el("h3", { textContent: exp.ruolo }),
            el("p", { className: "azienda-periodo" }, [
                el("strong", { textContent: exp.azienda }),
                ` | ${exp.periodo}`
            ]),
            note
        ]));
    });
}

function renderSkills(competenze) {
    const competenzeContainer = document.getElementById("competenze-container");
    competenzeContainer.innerHTML = "";

    for (const [categoria, skills] of Object.entries(competenze)) {
        const list = el("ul", { className: "skill-list" });
        skills.forEach(skill => {
            const children = [el("span", { textContent: skill.nome })];
            if (skill.livello) {
                children.push(el("span", { className: "skill-level", textContent: skill.livello }));
            }
            list.appendChild(el("li", { className: "skill-badge" }, children));
        });

        competenzeContainer.appendChild(el("div", { className: "skill-category" }, [
            el("h3", { textContent: formatCategoryName(categoria) }),
            list
        ]));
    }
}

function renderEducation(formazione) {
    const formazioneList = document.getElementById("formazione-list");
    formazioneList.innerHTML = "";

    formazione.forEach(edu => {
        formazioneList.appendChild(el("article", { className: "item" }, [
            el("h3", { textContent: edu.corso }),
            el("p", { className: "istituto-anno" }, [
                el("strong", { textContent: edu.istituto }),
                ` | ${edu.anno}`
            ]),
            el("p", { className: "education-vote", textContent: `Voto: ${edu.voto}` })
        ]));
    });
}

function initDarkMode() {
    const toggle = document.getElementById("dark-mode-toggle");
    const body = document.body;

    if (localStorage.getItem("dark-mode") === "enabled") {
        body.classList.add("dark-mode");
        toggle.textContent = "☀️";
    }

    toggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        localStorage.setItem("dark-mode", isDark ? "enabled" : "disabled");
        toggle.textContent = isDark ? "☀️" : "🌙";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    initDarkMode();
});
