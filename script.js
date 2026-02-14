async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`Errore nel caricamento del file JSON: ${response.statusText}`);
        }
        const data = await response.json();
        renderCV(data);
    } catch (error) {
        console.error('Si è verificato un errore:', error);
        document.getElementById('nome').textContent = "Errore nel caricamento";
    }
}

/**
 * Utility per creare elementi in modo più pulito
 */
function el(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'className') {
            element.className = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
}

function renderCV(data) {
    // Header basics
    document.getElementById('nome').textContent = data.nome;
    document.getElementById('titolo').textContent = data.titolo;
    document.getElementById('ultimo-aggiornamento').textContent = `Ultimo aggiornamento: ${data["ultimo aggiornamento"]}`;

    // Contatti
    const contattiList = document.getElementById('contatti-list');
    contattiList.innerHTML = '';
    
    const contactEntries = [
        { label: 'Residenza', value: data.contatti.residenza },
        { label: 'Email', value: data.contatti.email, isEmail: true },
        { label: 'Telefono', value: data.contatti.telefono },
        { label: 'GitHub', value: data.contatti.github, isLink: true },
        { label: 'LinkedIn', value: data.contatti.linkedin, isLink: true }
    ];

    contactEntries.forEach(item => {
        const p = el('p');
        const strong = el('strong', { textContent: `${item.label}: ` });
        p.appendChild(strong);

        if (item.isEmail) {
            p.appendChild(el('a', { href: `mailto:${item.value}`, textContent: item.value }));
        } else if (item.isLink) {
            p.appendChild(el('a', { href: item.value, target: '_blank', textContent: item.label === 'GitHub' ? 'GitHub' : 'LinkedIn' }));
        } else {
            p.appendChild(document.createTextNode(item.value));
        }
        contattiList.appendChild(p);
    });

    // Esperienze
    const esperienzeList = document.getElementById('esperienze-list');
    esperienzeList.innerHTML = '';
    data.esperienze.forEach(exp => {
        const item = el('div', { className: 'item' }, [
            el('h3', { textContent: exp.ruolo }),
            el('p', { className: 'azienda-periodo' }, [
                el('strong', { textContent: exp.azienda }),
                ` | ${exp.periodo}`
            ]),
            el('p', { className: 'note', textContent: exp.note })
        ]);
        esperienzeList.appendChild(item);
    });

    // Competenze
    const competenzeContainer = document.getElementById('competenze-container');
    competenzeContainer.innerHTML = '';
    for (const [categoria, skills] of Object.entries(data.competenze)) {
        const catDiv = el('div', { className: 'skill-category' }, [
            el('h3', { textContent: categoria.replace(/_/g, ' ') })
        ]);
        const ul = el('ul');
        skills.forEach(skill => {
            const li = el('li');
            li.appendChild(el('strong', { textContent: skill.nome }));
            li.appendChild(document.createTextNode(`: ${skill.livello}`));
            ul.appendChild(li);
        });
        catDiv.appendChild(ul);
        competenzeContainer.appendChild(catDiv);
    }

    // Formazione
    const formazioneList = document.getElementById('formazione-list');
    formazioneList.innerHTML = '';
    data.formazione.forEach(edu => {
        const item = el('div', { className: 'item' }, [
            el('h3', { textContent: edu.corso }),
            el('p', { className: 'istituto-anno' }, [
                el('strong', { textContent: edu.istituto }),
                ` | ${edu.anno}`
            ]),
            el('p', { textContent: `Voto: ${edu.voto}` })
        ]);
        formazioneList.appendChild(item);
    });
}

function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
        toggle.textContent = '☀️';
    }

    toggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDark ? 'enabled' : 'disabled');
        toggle.textContent = isDark ? '☀️' : '🌙';
    });
}

function initCollapsibles() {
    const headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.parentElement;
            const btn = header.querySelector('.toggle-btn');
            section.classList.toggle('collapsed');
            btn.textContent = section.classList.contains('collapsed') ? '+' : '−';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initDarkMode();
    initCollapsibles();
});
