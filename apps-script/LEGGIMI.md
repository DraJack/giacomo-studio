# apps-script/

`Code.gs` è la copia di riferimento dello script legato al foglio Google "Contatti giacomostudio"
(Estensioni → Apps Script). Non gira su Vercel: si incolla nel foglio e si pubblica come app web.
Il token non è nel codice: sta nelle Proprietà script (`SHEET_TOKEN`) e, uguale, nelle env di Vercel.
Test: `tests/apps-script.spec.mjs`. Istruzioni complete in `CLAUDE.md` §8 "Form Check-up".
