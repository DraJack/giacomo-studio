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

**Titolari di attività locali in Puglia.**

Nell'ordine di priorità:

1. **Ristorazione** — ristoranti, pizzerie, trattorie, bar, pub
2. **Ospitalità** — B&B, case vacanza, agriturismi
3. **Servizi alla persona** — palestre, centri estetici, parrucchieri

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

- **Message match.** La promessa dell'annuncio (locale + 150€ + 3 giorni + non paghi prima) deve essere leggibile nell'hero **senza scrollare**. Se cambia l'hero, cambia l'annuncio, e viceversa.
- **Il traffico è freddo.** Nessuno conosce Giacomo. Le obiezioni vanno gestite nell'ordine: *"non mi serve" → "non mi fido" → "costa troppo" → "è complicato"*. È l'ordine delle sezioni.
- **Un tap dalla conversione.** Da qualsiasi punto della pagina il CTA WhatsApp deve essere raggiungibile: nav in alto, sticky bar in basso su mobile, CTA nelle sezioni.
- **Velocità.** File singolo, zero librerie, zero framework. Non aggiungere dipendenze: ogni 100ms in più costa conversioni pagate.
- **Il tracking è sacro.** Senza gli eventi, la campagna non ottimizza. Vedi §8.

---

## 4. L'offerta — unica fonte di verità

| Voce | Valore |
|---|---|
| **Pacchetto base** | **150€** (prezzo barrato di riferimento: **390€**) |
| **Add-on unico** | **Menu digitale + QR — +50€** |
| **Tutto insieme** | 200€ |
| **Consegna** | **3 giorni lavorativi** |
| **Anticipo** | **Zero.** Nessun acconto, nessuna carta bloccata |
| **Pagamento** | Solo dopo approvazione, solo se il cliente decide di pubblicare |
| **Revisioni** | **Illimitate**, finché non è soddisfatto (nel perimetro concordato) |
| **Incluso** | Dominio + hosting primo anno, SEO base, Google Analytics, form contatto, pulsante WhatsApp, collegamento social, recensioni Google |
| **Tempo di risposta** | Immediato — in pagina si scrive "rispondo subito" |
| **Scarsità** | **Nessuna.** Niente "solo 5 posti", niente countdown, niente "offerta lancio" |

### Cosa c'è nel pacchetto (le 4 card della sezione `#pacchetto`)

1. **Sito completo** — Home, chi siamo, galleria, contatti + mappa, menu, prenotazioni. `150€ · tutto incluso`
2. **Menu digitale + QR** — pagina menu mobile-first + QR pronto per la stampa. `+50€ · add-on`
3. **Online in 3 giorni** — timeline giorno 1 / giorni 1–2 / giorno 3. `3 giorni lavorativi`
4. **Garanzia** — lo vedi prima, paghi solo se ti piace. `Zero rischio garantito` *(card verde)*

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

### Token — `:root` in `index.html`

```css
--red:    #ff2c32;   /* accento primario */
--orange: #fa6800;   /* accento secondario */
--green:  #25d366;   /* WhatsApp / garanzia / conferme */
--bg:     #050505;   /* fondo pagina */
--card:   #0c0c0c;   /* fondo card */
--border: rgba(255,255,255,0.07);
--text:   rgba(255,255,255,0.50);   /* testo secondario */
--grad:   linear-gradient(90deg, #ff2c32 0%, #fa6800 100%);
```

**Il verde ha un significato preciso: garanzia, WhatsApp, "sì".** Non usarlo come colore decorativo.
Il rosso/arancio è il brand. La card garanzia (`.pkg-card--green`) ridefinisce i token localmente invece di duplicare CSS — **usa questo pattern** se serve un blocco a colore diverso.

### Tipografia

- **Display**: `Clash Display` (via fonts.cdnfonts.com) — H1, H2, numeri, titoli card, logo.
- **Body**: `Inter` 400/500/600/700 (Google Fonts) — tutto il resto.
- Scala: `.h2 { clamp(30px, 5vw, 56px) }`, `.hero-h1 { clamp(52px, 11vw, 108px) }`.
- Il display ha sempre `letter-spacing` negativo (-0.02 / -0.04em). È la firma visiva.

### Spaziatura e forme

- Sezioni: `.section { padding: 96px 24px; max-width: 1080px; margin: 0 auto }` (76px 30px sotto 680px)
- Radius: 12–14px (elementi piccoli), 20–28px (card e sezioni), 100px (pill e bottoni)
- Breakpoint: **860px** (grid a 2 colonne → 1), **740px** (nav → hamburger), **680px** (mobile vero), **400px** (small)

### Animazioni

Il sistema esiste già, **riusalo invece di aggiungere codice**:

| Utility | Effetto |
|---|---|
| `.fade-up` (+ `.d1` `.d2` `.d3`) | opacity 0 + translateY(28px) → visibile, con delay scaglionato |
| `.fade-row` | variante corta per righe di tabella, stagger automatico via `:nth-child` |
| `.timeline-visible` | rivela la timeline degli step |
| `[data-count]` | contatore animato |

Un unico `IntersectionObserver` aggiunge `.visible` a `.fade-up` / `.fade-row`. **Per animare l'interno di un blocco, aggancia i selettori discendenti a `.visible`** (es. `.pkg-card.visible .pkg-scan { animation: … }`) — non creare nuovi observer.

Keyframes disponibili: `pulse`, `float`, `shimmer`, `badge-glow`, `pkg-scan`, `pkg-blink`.

⚠️ Ogni nuova animazione va disattivata nel blocco `@media (prefers-reduced-motion: reduce)` in fondo al CSS.

---

## 8. Architettura tecnica

### Struttura

```
index.html      ~2000 righe — TUTTO qui: CSS inline in <style>, JS inline in fondo
privacy.html    pagina legale, <style> proprio
termini.html    pagina legale, <style> proprio — contiene prezzo e tempi di consegna
whatsapp.svg    logo ufficiale WhatsApp (cerchio verde + glifo bianco)
logo-mark.svg   favicon, mark "G" in gradient
og-image.jpg     anteprima social 1200×630 — generata da og-template.html
og-template.html sorgente dell'anteprima social (noindex, non linkata dal sito)
face.webp       avatar FAQ
giacomo-brand-designer-developer-freelance.webp   foto sezione "Chi sono"
robots.txt, sitemap.xml

api/            ORFANO — api/subscribe.js (Brevo), non collegato a nessuna pagina
web-mockup/     DEMO CLIENTE scollegata (ristorante Shoshin) — non fa parte del sito
```

**Nessun build step. Nessun package.json. Nessuna dipendenza.** Si apre il file, si modifica, si committa, Vercel pubblica.

### JS in pagina (tutto inline, fine di `index.html`)

anno nel footer · `#nav.scrolled` allo scroll · IntersectionObserver reveal · accordion FAQ (uno aperto per volta) · smooth scroll · hamburger + drawer · scrollspy nav · reveal timeline · contatori · **tracking WhatsApp**.

### Tracking — NON ROMPERE

- **GA4**: `G-GGG2M3LL6Q`
- **Meta Pixel**: `2914769975530947`

Uno script delegato in fondo alla pagina intercetta **ogni** `a[href*="wa.me"]` e invia `whatsapp_click` (GA4) + `WhatsAppClick` (Pixel) con il parametro `button_location`, dedotto da:

- `#sticky-wa` → `sticky`
- `.nav-wa` → `nav`
- `.price-cta-btn` → `pricing`
- altrimenti l'`id` della `<section>` più vicina → `hero`, `pacchetto`, `chi-sono`, `faq`, `contatto`

**Quindi**: non rinominare `.nav-wa`, `.price-cta-btn`, `#sticky-wa`, non togliere gli `id` alle sezioni, non sostituire i link `wa.me` con altro. Se sposti un CTA in una sezione nuova, dalle un `id` sensato o il dato arriva come `unknown`.

Il numero nei link è `393493457558` (**con prefisso 39** — senza, `wa.me` fallisce fuori Italia).

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
| 11 | Footer + sticky bar | `#sticky-wa` | CTA persistente su mobile |

---

## 10. Regole operative — leggere prima di modificare

### ⚠️ Se cambi il prezzo o i tempi di consegna

Il valore è ripetuto in **~30 punti**. Cambiarlo in un posto solo lascia il sito incoerente e i rich snippet di Google sbagliati. Checklist obbligatoria:

**`index.html` — `<head>`**
- [ ] `<title>`
- [ ] `<meta name="description">`
- [ ] `og:title`, `og:description`
- [ ] `twitter:title`, `twitter:description`
- [ ] JSON-LD `ProfessionalService` → `description` + array `offers` (due `Offer`: 150 e 50 EUR)
- [ ] JSON-LD `FAQPage` → tutte le risposte che citano prezzo o giorni

**`index.html` — `<body>`**
- [ ] hero: kicker prezzo + H1
- [ ] `#pacchetto`: pill delle 4 card + checklist
- [ ] `#prezzi`: `.price-number`, `.price-orig`, riga add-on, riga totale, label CTA
- [ ] `#come-funziona`: le tre `.step-time-pill` + il testo dello step 3
- [ ] `#chi-sono`: `data-count` della stat giorni
- [ ] `#confronto`: **due copie** — tabella desktop **e** card mobile
- [ ] `#faq`: 7 risposte
- [ ] `#contatto`: H2 + trust item
- [ ] **tutti i link `wa.me`**: il testo precompilato cita il prezzo

**Altri file**
- [ ] `termini.html` — prezzo, add-on, giorni di consegna, clausola ritardo
- [ ] `sitemap.xml` — `lastmod`
- [ ] `og-image.jpg` — il prezzo è **impresso nell'immagine**. Non ritoccarla a mano: aggiorna `og-template.html` e ri-catturala a 1200×630 (Playwright, `deviceScaleFactor: 1`, `type: 'jpeg'`, `quality: 90`, con ~1.5s di attesa perché Clash Display finisca di caricare). Se salti questo passaggio, le anteprime WhatsApp e Google continuano a mostrare il prezzo vecchio.

**Verifica finale** (deve dare zero risultati):
```bash
grep -rnE "249|980|570|197|5 giorni|Giorno 5|5 posti|offerta lancio" index.html termini.html privacy.html
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

- `api/subscribe.js` (Brevo) è codice orfano: nessuna pagina ci fa `fetch`. Se un giorno si aggiunge la cattura email, l'endpoint è già pronto — servono `BREVO_API_KEY` e `BREVO_LIST_ID` su Vercel.
- Attualmente sulla landing **non c'è nessun form**. L'unica conversione è WhatsApp (7 link) più il `mailto:` nel footer.
