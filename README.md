# Generare il curriculum

Richiede Node.js. Legge `data.json` e crea `curriculum_ats.html`:

```bash
node generate-cv.js
```

Per un nome di output diverso:

```bash
node generate-cv.js cv.html
```

Per il PDF: apri l'HTML in Chrome o Edge, `Ctrl+P` → "Salva come PDF", disattiva "Intestazioni e piè di pagina". Salvalo in `pdf/curriculum.pdf`.

Per aggiornare il curriculum modifica `data.json` e rilancia il comando.

Campi facoltativi supportati in `data.json`:

```json
"esperienze": [{ "note": ["punto 1", "punto 2"] }],
"progetti": [{ "nome": "", "tecnologie": [""], "link": "", "descrizione": [""] }],
"lingue": [{ "lingua": "Inglese", "livello": "B2" }]
```
