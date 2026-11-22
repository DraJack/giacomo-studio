# CLAUDE.md — giacomostudio.it

Documento di riferimento per chiunque (persona o AI) lavori su questo repo.
Contiene identità, posizionamento, offerta, tono di voce, design system, architettura tecnica e regole operative.

**Leggi la sezione "Regole operative" prima di toccare qualsiasi cosa.**

---

## 1. Identità

**Giacomo** — Brand Designer & Developer freelance. Il brand è `giacomostudio` (minuscolo, tutto attaccato, "studio" in gradient).

Non è un'agenzia. È **una persona sola** che fa tutto: strategia, design, codice, consegna, assistenza. Questo non è un limite da nascondere, è **il differenziale principale**:

- risponde una persona, non un centralino
- non ci sono passaggi di consegne, quindi i tempi sono corti davvero
- il cliente parla sempre con chi fa il lavoro

**Non scrivere mai "noi", "il nostro team", "i nostri reparti".** Prima persona singolare, sempre.

- Email: `giacomo.abbracciaventoo@gmail.com`
- WhatsApp: `393493457558` (canale di contatto primario — vedi §8)
- Dominio: `https://giacomostudio.it` (deploy Vercel, push su `master` = deploy)

---

## 2. Target

**Imprese di infissi e serramenti in Puglia** (dal 21/11/2026; prima: ristoranti, B&B, servizi).

Perché questa nicchia: un lavoro vale migliaia di euro, vivono di richieste di preventivo,
rispondono su WhatsApp. Giacomo lavora **solo a distanza** (WhatsApp e telefono, niente incontri).
Design della strategia: `docs/superpowers/specs/2026-11-21-primo-cliente-serramentisti-puglia-design.md`.

### Come sono fatti

- Poco o per niente digitalizzati. Spesso hanno solo un profilo Instagram e una scheda Google incompleta.
- **Decidono via WhatsApp.** Non leggono preventivi PDF, non compilano form lunghi, non fissano call su Calendly.
- Hanno già ricevuto preventivi da agenzie a 1.500–3.000€ e si sono spaventati.
- Il loro dubbio vero non è "quanto costa" ma **"e se poi non mi piace / mi frega?"** → è per questo che la garanzia sta al centro della pagina.
- Sono su mobile. Quasi tutto il traffico è mobile.

### Regola geografica — importante

Si nomina **la regione (Puglia)**, **mai una singola città**.

L'area di lavoro si allargherà. Se il copy si incastra su "Taranto" o "Bari", ogni espansione richiede una riscrittura e brucia la creatività ads già validata. Puglia è abbastanza specifico da creare prossimità ("uno di qui") e abbastanza largo da reggere la crescita.

⚠️ Non introdurre nomi di città nel copy della landing. Se serve targeting cittadino, si fa **nelle impostazioni della campagna ads**, non nell'HTML.

---

## 3. Canale: questa è una landing per ads

`index.html` è la **destinazione di campagne a pagamento** (Meta e Google), non una pagina che vive di traffico organico.

Conseguenze pratiche su ogni modifica:

- **Message match.** La promessa dell'annuncio (impresa di infissi + gratis da vedere + 48 ore + 150€ solo se ti piace) deve essere leggibile nell'hero **senza scrollare**. Se cambia l'hero, cambia l'annuncio, e viceversa.
- **Il traffico è freddo.** Nessuno conosce Giacomo. Le obiezioni vanno gestite nell'ordine: *"non mi serve" → "non mi fido" → "costa troppo" → "è complicato"*. È l'ordine delle sezioni.
- **Un tap dalla conversione.** Da qualsiasi punto della pagina il CTA WhatsApp deve essere raggiungibile: nav in alto, sticky bar in basso su mobile, CTA nelle sezioni.
- **Velocità.** File singolo, zero librerie, zero framework. Non aggiungere dipendenze: ogni 100ms in più costa conversioni pagate.
- **Il tracking è sacro.** Senza gli eventi, la campagna non ottimizza. Vedi §8.

---

## 4. L'offerta — unica fonte di verità

| Voce | Valore |
|---|---|
| **Pacchetto unico** | **150€** (prezzo barrato di riferimento: **390€**) |
| **Anteprima** | **Gratis, entro 48 ore** — si prepara il sito prima di qualsiasi pagamento |
| **Incluso** (oltre al sito) | Preventivo guidato → WhatsApp, scheda Google sistemata, SEO locale |
| **Add-on** | Nessuno (il menu digitale è stato tolto con la nicchia ristoranti) |
| **Anticipo** | **Zero.** Nessun acconto, nessuna carta bloccata |
| **Pagamento** | Solo dopo approvazione, solo se il cliente decide di pubblicare |
| **Revisioni** | **Illimitate**, finché non è soddisfatto (nel perimetro concordato) |
| **Incluso** | Dominio + hosting primo anno, SEO base, Google Analytics, pulsante WhatsApp, recensioni Google |
| **Tempo di risposta** | Immediato — in pagina si scrive "rispondo subito" |
| **Scarsità** | **Nessuna.** Niente "solo 5 posti", niente countdown, niente "offerta lancio" |

### Cosa c'è nel pacchetto (le 5 card della sezione `#pacchetto`)

1. **Sito completo** — prodotti, lavori realizzati, contatti + mappa. `150€ · tutto incluso`
2. **Preventivi su WhatsApp** — preventivo guidato in 4 tocchi. `Incluso` *(visual `.pkg-quote`)*
3. **Google** — scheda Google + SEO locale; mai promettere il primo posto. `Incluso` *(visual `.pkg-serp`)*
4. **Lo vedi in 48 ore** — timeline oggi / 24 ore / 48 ore. `48 ore`
5. **Garanzia** — lo vedi prima, paghi solo se ti piace. `Zero rischio garantito` *(card verde)*

Il messaggio deve combaciare con gli annunci Meta in `Documents/meta ads/serramentisti-puglia/`
(gratis da vedere · 48 ore · 150€ solo se ti piace).

### Sulla scarsità — decisione presa

La scarsità è stata **rimossa deliberatamente**. Un contatore di "posti" che non si consuma mai brucia credibilità, e a 150€ il prezzo è già di per sé l'argomento. Tutto il peso persuasivo è sulla **garanzia**.

**Non reintrodurre "solo N posti" / "offerta lancio" / countdown senza una richiesta esplicita di Giacomo.**

---

## 5. Modello di business — perché il prezzo è basso

150€ **non è il prodotto, è la porta d'ingresso.**

```
Sito 150€  →  cliente acquisito, fiducia costruita, risultato visibile
              ↓
        Lead generation (campagne, Google Business, prenotazioni)
        Social media marketing (gestione contenuti, ads)
              ↓
        Ricavo ricorrente mensile ← qui sta il margine reale
```

Il sito serve a: (a) entrare in casa del cliente con attrito quasi zero, (b) dimostrare di saper consegnare, (c) creare la relazione da cui nasce l'upsell.

### Come si tratta l'upsell sulla landing

**Accennato, mai venduto.** Una riga sola, nella sezione "Chi sono":

> *"Il sito è il primo passo. Quando funziona, c'è il resto — farti trovare su Google, portare prenotazioni, curare i social. Ma prima il sito."*

⚠️ **Non creare sezioni, pacchetti o listini per lead gen / social sulla landing.** Ogni offerta aggiuntiva in pagina abbassa la conversione sull'offerta d'ingresso, che è l'unica cosa che questa pagina deve fare. L'upsell si propone a voce, dopo la consegna.

---

## 6. Tono di voce

**Diretto, concreto, senza fronzoli. Come parlare al bancone.**

### Regole

- **Seconda persona singolare.** "Il tuo locale", "ti porta clienti", "paghi solo se ti piace". Mai il "voi".
- **Frasi corte. Punto fermo aggressivo.** `Semplice come deve essere.` / `Se non ti convince, ci salutiamo. Fine.` Il ritmo si costruisce col punto, non con le virgole.
- **Numeri, non aggettivi.** "150€", "3 giorni", "zero anticipo" — non "conveniente", "veloce", "rapidissimo". (Unica eccezione: il tempo di risposta è "rispondo subito", non un numero.)
- **Zero gergo tecnico.** Mai "responsive", "stack", "CMS", "framework", "performance". Si dice "si vede bene dal telefono", "veloce", "lo aggiorni in un minuto".
- **Ogni claim dev'essere mantenibile.** Se non lo puoi consegnare, non lo scrivi. La pagina promette solo cose vere.
- **Titoli in due tempi:** frase bianca + seconda parte in gradient. `Prezzo chiaro.` / `Nessuna sorpresa.` È il pattern tipografico del sito, rispettalo.

### Vietato

- "soluzioni innovative", "il tuo partner digitale", "presenza online a 360°", "chiavi in mano" usato ovunque
- superlativi vuoti ("incredibile", "straordinario", "il migliore")
- punti esclamativi (uno ogni tanto, se serve — mai due)
- emoji nel copy della pagina (l'unico simbolo ammesso è `✦` nella nota prezzo e `✓ ✗` nel confronto)

---

## 7. Design system

Stile chiaro "Mix 1" (redesign del 22/11/2026): fondo bianco, titoli neri molto pesanti, un dettaglio
elegante in corsivo con il gradient del brand. Spec: `docs/superpowers/specs/2026-11-22-redesign-giacomostudio-design.md` (locale, non nel repo).

### Token — `:root` in `index.html`

```css
--bg:     #ffffff;   /* fondo pagina */
--bg-alt: #f7f6f3;   /* sezioni alterne, riquadri (grigio caldo) */
--ink:    #0a0a0a;   /* testo, pulsante principale */
--muted:  #555555;   /* testo secondario */
--soft:   #8a8a8a;   /* note, didascalie */
--line:   rgba(0,0,0,.08);
--red:    #ff2c32;  --orange: #fa6800;
--grad:   linear-gradient(90deg, #ff2c32 0%, #fa6800 100%);
--wa:     #25d366;   /* WhatsApp / garanzia / conferme */
--wa-ink: #128c4a;   /* verde leggibile su fondo chiaro (testi, ✓) */
--halo:   #ffe6da;   /* alone caldo dietro i telefoni */
```

**Il verde ha un significato preciso: garanzia, WhatsApp, "sì".** Non usarlo come colore decorativo.
La card garanzia (`.pkg-card--green`) ridefinisce `--accent` / `--accent-soft` localmente: **usa questo pattern** se serve un blocco a colore diverso.

**Un solo blocco nero**: `#contatto .cta-box`. Tutto il resto è bianco o `--bg-alt` (un test lo verifica).

### Tipografia (solo Google Fonts)

- **Titoli**: `Inter Tight` 800/900, `line-height` ~.92, `letter-spacing: -.05em`. Classi `.h1`, `.h2`, `.h3`.
- **Corsivo elegante**: `<em class="serif-accent">` = `Instrument Serif` corsivo + gradient. Per la seconda parte dei titoli chiave
  (hero, H2 di sezione, CTA finale), al posto del vecchio "frase bianca + frase in gradient". Con parsimonia.
- **Testo**: `Manrope` 400–700.
- `.kicker` = etichetta maiuscola piccola con pallino gradient sopra i titoli.

### Componenti

- Pulsanti: `.btn.btn-dark` (principale, nero con `.wa-dot` verde), `.btn.btn-wa` (verde: solo CTA finale), `.btn-link` (secondario sottolineato).
  Il gradient sui pulsanti si usa **solo** nel submit del Check-up.
- `.section` (contenitore 1120px) dentro `<section id="…">`; `class="section--alt"` sulla `<section>` per il fondo grigio caldo.
  `.section-head` = intestazione centrata (kicker + h2 + `.lead`).
- `.phone` > `.phone-screen` = telefono con mini-sito Alba (`.mini-logo`, `.mini-sub`, `.mini-win`, `.mini-title`, `.mini-btn`…),
  riusato in hero, prima/dopo, preventivo guidato e check-up. Ogni `.mini-logo` segue il nome scritto nell'hero.
- Radius: 14–24px (riquadri), 26–40px (card e blocchi), 100px (pill e bottoni). Breakpoint: 860 / 740 / 680 / 340px.

### Animazioni

| Utility | Effetto |
|---|---|
| `.reveal` (+ `.d1` `.d2` `.d3`) | ingresso: opacity 0 + translateY(20px) → visibile. Nascosto **solo** con `html.js` |
| `[data-observe]` | osservato senza animazione di ingresso (riceve solo `.is-in`) |
| `.is-in` | classe aggiunta dall'observer; per animare l'interno usa i discendenti (`.pkg-card.is-in .timeline`) |
| evento `gs:in` | emesso sull'elemento quando riceve `.is-in` (usato dalla ricerca Google simulata) |
| `--fill` 0→1 | riempimento di `.timeline` (pacchetto) e `.steps` (come funziona) |
| `[data-count]` | contatore animato |

Un unico `IntersectionObserver` (`revealIO`). Non crearne altri senza motivo.
⚠️ Ogni nuova animazione va disattivata nel blocco `@media (prefers-reduced-motion: reduce)` in fondo al CSS, mostrando lo stato finale.

---

## 8. Architettura tecnica

### Struttura

```
index.html      ~2200 righe — TUTTO qui: CSS inline in <style>, JS inline in fondo
privacy.html    pagina legale, <style> proprio — copre anche il form Check-up (Brevo, consenso, disiscrizione)
termini.html    pagina legale, <style> proprio — contiene prezzo e tempi di consegna
whatsapp.svg    logo ufficiale WhatsApp (cerchio verde + glifo bianco)
logo-mark.svg   favicon, mark "G" in gradient
og-image.jpg     anteprima social 1200×630 — generata da og-template.html
og-template.html sorgente dell'anteprima social (noindex, non linkata dal sito)
face.webp       avatar FAQ
giacomo-brand-designer-developer-freelance.webp   foto sezione "Chi sono"
robots.txt, sitemap.xml

api/            api/subscribe.js — funzione Vercel che iscrive l'email del form Check-up alla lista Brevo
tests/          test Playwright + server statico (escluso dal deploy con .vercelignore)
web-mockup/     DEMO CLIENTE scollegata (ristorante Shoshin) — non fa parte del sito
```

**Nessun build step, nessuna dipendenza nel sito.** Si apre il file, si modifica, si committa, Vercel pubblica.
L'unico `package.json` è in `tests/` (Playwright) e non finisce online: `.vercelignore` esclude `tests/`, `docs/`, `.superpowers/`, `web-mockup/`, `INFRASTRUTTURA.md`, `CLAUDE.md`, `og-template.html`. **Questo file non deve essere pubblico**: dopo ogni pubblicazione `curl -I https://giacomostudio.it/CLAUDE.md` deve dare 404.

### Test — lanciali prima di ogni commit

```bash
cd tests && npm install        # la prima volta
npx playwright test             # tutta la suite, telefono (375px) e computer (1280px)
node shot.mjs <cartella> "#hero" 375,1280   # screenshot di una sezione
node og.mjs                     # rigenera og-image.jpg da og-template.html
```

I test controllano: testi identici al sito di riferimento (`tests/fixtures/old-index.html`), FAQ = JSON-LD,
ogni link WhatsApp tracciato con il `button_location` giusto, form Check-up, interazioni, nessuno scroll
orizzontale a 360px, pagina leggibile senza JS, "riduci movimento", peso non superiore alla versione precedente.
Se cambi un testo **apposta**, aggiorna anche `tests/fixtures/old-index.html` (o il test fallisce, ed è giusto così).

### JS in pagina (tutto inline, fine di `index.html`)

anno nel footer · `#nav.scrolled` + sticky dopo 320px · observer reveal · smooth scroll · hamburger + drawer · scrollspy nav · contatori · **nome impresa** (`#demo-name`) · prima/dopo · preventivo guidato (`quoteMessage`) · ricerca Google simulata · calcolatore (`timesRepaid`) · accordion FAQ · **form Check-up** · **tracking WhatsApp**.

**Nome impresa.** Il campo `#demo-name` nell'hero chiama `cleanName` (max 28 caratteri), aggiorna ogni `.mini-logo` ed emette l'evento `gs:name` (`detail.name`; ultimo valore in `window.gsName`). Gli `href` dei link **restano sempre quelli base**: GA4 (clic in uscita) e Pixel leggono gli URL dei link, quindi il nome non ci deve stare. Al clic su un `a[data-wa]`, se c'è un nome, il listener di tracciamento fa `preventDefault()` e apre `WA_URL + buildWaText(nome)`. A GA4 va solo `demo_name_typed`, senza parametri, una volta per visita. **Ogni nuovo link WhatsApp deve avere l'attributo `data-wa`** (un test lo verifica).

**Rete di sicurezza.** Il listener di tracciamento è il primo codice dello script, così funziona anche se il resto si rompe. `html.js` viene messo solo se esiste `IntersectionObserver`, e se lo script non arriva in fondo (`window.gsReady`) entro 3 secondi la classe si toglie e tutti i blocchi diventano visibili.

### Tracking — NON ROMPERE

- **GA4**: `G-GGG2M3LL6Q`
- **Meta Pixel**: `2914769975530947`

Un listener delegato su `document` (funziona anche per i link il cui `href` cambia) intercetta **ogni** `a[href*="wa.me"]` e invia `whatsapp_click` (GA4) + `WhatsAppClick` (Pixel) con il parametro `button_location`, dedotto da:

- `#sticky-wa` → `sticky`
- `.nav-wa` → `nav`
- `.price-cta-btn` → `pricing`
- altrimenti l'`id` della `<section>` più vicina → `hero`, `pacchetto`, `chi-sono`, `faq`, `contatto`, `check-up`

**Quindi**: non rinominare `.nav-wa`, `.price-cta-btn`, `#sticky-wa`, non togliere gli `id` alle sezioni, non sostituire i link `wa.me` con altro. Se sposti un CTA in una sezione nuova, dalle un `id` sensato o il dato arriva come `unknown`.

Il numero nei link è `393493457558` (**con prefisso 39** — senza, `wa.me` fallisce fuori Italia).

### Form Check-up — seconda scelta, non conversione principale

Sezione `#check-up`, subito dopo `#contatto`, separata da un divisore "oppure". È per chi non è pronto a scrivere su WhatsApp: lascia email + tipo di attività e riceve un esempio di sito.

- Il form fa `POST /api/subscribe` con `{ email, tipo_business, source: 'landing-checkup' }`. La funzione aggiunge il contatto alla lista Brevo.
- Su Vercel servono le env `BREVO_API_KEY` e `BREVO_LIST_ID`. Senza, l'endpoint risponde 500 e l'utente vede l'errore. In Brevo vanno creati gli attributi `TIPO_BUSINESS` e `SOURCE`.
- Al successo invia `checkup_submit` (GA4) + `CheckupRequest` (Pixel, custom). **Evento distinto** da quello WhatsApp: le campagne ottimizzano su `WhatsAppClick`, non su questo.
- Honeypot `#cu-sito`: se compilato, mostra la conferma senza inviare nulla.
- Il submit è gradient, **mai verde**. Il blocco è volutamente più sobrio della `.cta-box` (bianco su fondo `--bg-alt`): non deve competere con WhatsApp.
- Il copy promette "quattro email al massimo, niente newsletter, niente telefonate". Qualsiasi sequenza Brevo deve stare dentro questo limite, e ogni email deve avere il link di disiscrizione (la privacy lo promette).

---

## 9. Struttura della pagina

| # | Sezione | `id` | Ruolo persuasivo |
|---|---|---|---|
| 1 | Nav | `#nav` | CTA sempre a portata |
| 2 | Hero | `#hero` | Message match con l'annuncio: cosa, quanto, quando, che rischio |
| 3 | Problema | `#problema` | "non mi serve" → sì che ti serve |
| 4 | **Cosa c'è nel pacchetto** | `#pacchetto` | 4 card alternate: cosa ricevi, concretamente |
| 5 | Prezzi | `#prezzi` | Prezzo chiaro, add-on, garanzia |
| 6 | Come funziona | `#come-funziona` | "è complicato" → tre step, non fai niente |
| 7 | Chi sono | `#chi-sono` | "non mi fido" → faccia, nome, prossimità + seme upsell |
| 8 | Confronto | `#confronto` | "costa troppo / posso fare da solo" |
| 9 | FAQ | `#faq` | Obiezioni residue (7 domande) |
| 10 | CTA finale | `#contatto` | Ultima chiamata |
| 11 | Check-up | `#check-up` | "oppure": chi non è pronto lascia l'email e riceve un esempio |
| 12 | Footer + sticky bar | `#sticky-wa` | CTA persistente su mobile |

---

## 10. Regole operative — leggere prima di modificare

### ⚠️ Se cambi il prezzo o i tempi di consegna

Il valore è ripetuto in **~30 punti**. Cambiarlo in un posto solo lascia il sito incoerente e i rich snippet di Google sbagliati. Checklist obbligatoria:

**`index.html` — `<head>`**
- [ ] `<title>`
- [ ] `<meta name="description">`
- [ ] `og:title`, `og:description`
- [ ] `twitter:title`, `twitter:description`
- [ ] JSON-LD `ProfessionalService` → `description` + array `offers`
- [ ] JSON-LD `FAQPage` → tutte le risposte che citano prezzo o giorni

**`index.html` — `<body>`**
- [ ] hero: kicker prezzo + H1
- [ ] `#pacchetto`: pill delle 5 card + checklist + didascalia scudo "Non ti piace? 0€."
- [ ] `#prezzi`: `.price-number`, `.price-orig`, riga add-on, riga totale, label CTA
- [ ] `#come-funziona`: le tre `.step-time-pill` + il testo dello step 3
- [ ] `#chi-sono`: `data-count` della stat giorni
- [ ] `#confronto`: **due copie** — tabella desktop **e** card mobile
- [ ] `#faq`: 7 risposte
- [ ] `#contatto`: H2 + trust item
- [ ] **tutti i link `wa.me`**: il testo precompilato cita il prezzo (e `buildWaText` nel JS)
- [ ] calcolatore: `timesRepaid` divide per 150
- [ ] `tests/fixtures/old-index.html`: aggiorna i testi di riferimento, o i test di "testi invariati" falliscono

**Altri file**
- [ ] `termini.html` — prezzo, add-on, giorni di consegna, clausola ritardo
- [ ] `sitemap.xml` — `lastmod`
- [ ] `og-image.jpg` — il prezzo è **impresso nell'immagine**. Non ritoccarla a mano: aggiorna `og-template.html` e rigenerala con `cd tests && node og.mjs` (1200×630, JPEG q90). Se salti questo passaggio, le anteprime WhatsApp e Google continuano a mostrare il prezzo vecchio.

**Verifica finale** (deve dare zero risultati):
```bash
grep -rnE "249|980|570|197|5 giorni|3 giorni|Giorno 5|5 posti|offerta lancio|add-on|Menu digitale" index.html termini.html privacy.html
grep -rniE "taranto|bari|lecce|brindisi|foggia" index.html termini.html
```

### ⚠️ JSON-LD ↔ DOM

Il blocco `FAQPage` nel `<head>` deve rispecchiare **parola per parola** le FAQ nel `<body>`. In passato hanno divergito (la Q7 aveva due risposte diverse). Se tocchi una FAQ, tocca entrambe nello stesso momento.

### ⚠️ Non fare mai

- Aggiungere librerie, framework, CDN o build step. Il valore di questa pagina è che carica istantaneamente.
- Rimuovere o rinominare gli hook di tracking (§8).
- Reintrodurre scarsità artificiale (§4).
- Nominare città specifiche (§2).
- Aggiungere sezioni che vendono lead gen o social (§5).
- Toccare `web-mockup/` — è una demo cliente scollegata.
- Promettere in pagina qualcosa che non è nel pacchetto reale.

### Note aperte

- Conversioni in pagina: WhatsApp (8 link `wa.me`, la principale), il form Check-up (email → Brevo) e il `mailto:` nel footer.
- **Sequenza email Check-up: non ancora costruita.** Oggi le email arrivano nella lista Brevo e basta. Finché la sequenza automatica non esiste, l'esempio di sito va mandato a mano a ogni nuovo iscritto — il form lo promette.
- Se cambi cosa raccoglie il form o chi riceve i dati, aggiorna `privacy.html` (sezioni 2, 3, 4, 5, 8) nello stesso commit.
