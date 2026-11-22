/**
 * Foglio "Contatti giacomostudio" — CRM dei contatti + ricezione del modulo Check-up.
 *
 * Si incolla in: foglio Google → Estensioni → Apps Script → Code.gs.
 * Il token NON sta qui: Impostazioni progetto → Proprietà script → SHEET_TOKEN
 * (stesso valore della variabile SHEET_TOKEN su Vercel).
 *
 * - prepara()    da lanciare una volta a mano: intestazioni, formati, tendina Stato, promemoria delle 8.
 * - doPost(e)    chiamata da api/subscribe.js: aggiunge la riga e manda l'email di avviso.
 * - promemoria() parte da sola ogni mattina: chi è ancora "Nuovo" e chi va ricontattato oggi.
 *
 * Se modifichi questo file, incollalo di nuovo e fai: Esegui il deployment → Gestisci deployment →
 * matita → Versione: Nuova versione → Esegui il deployment. L'URL /exec resta lo stesso.
 */

var FOGLIO = 'Contatti';
var FUSO = 'Europe/Rome';
var INTESTAZIONI = ['Data', 'Telefono', 'Nome', 'Da dove', 'Ha già un sito', 'Stato', 'Ricontatta il', 'Note', 'WhatsApp'];
var STATI = ['Nuovo', 'Scritto', 'In attesa', 'Da ricontattare', 'Cliente', 'Perso'];
var CHIUSI = ['Cliente', 'Perso'];

// Aspetto del foglio
var LARGHEZZE = [130, 130, 150, 120, 200, 150, 120, 280, 110]; // px, una per colonna
var COLORI_STATO = { // [sfondo, testo]
  'Nuovo':           ['#fff1ea', '#c2410c'],
  'Scritto':         ['#e8f0fe', '#1a56db'],
  'In attesa':       ['#fef7e0', '#a16207'],
  'Da ricontattare': ['#fde8e8', '#c81e1e'],
  'Cliente':         ['#e3f6ea', '#128c4a'],
  'Perso':           ['#f1f1f1', '#8a8a8a'],
};

// I codici del modulo diventano frasi leggibili nel foglio e nell'email.
var RISPOSTE_SITO = { no: 'No, ne vuole uno', vecchio: 'Sì, ma è vecchio', si: 'Sì, ma non porta preventivi' };
var ORIGINI = { 'landing-checkup': 'Sito · modulo' };
var TESTO_LINK = 'Apri chat →';

// Messaggio già scritto quando apri il link WhatsApp dall'email o dal foglio.
var TESTO_WA = ', sono Giacomo di giacomostudio. Mi hai lasciato il numero sul sito: questo è un esempio di sito che preparo per le imprese di infissi https://giacomostudio.it/esempio/';

// Valori liberi: massimo 100 caratteri, e mai interpretati come formula.
function testo(v) {
  var s = String(v == null ? '' : v).slice(0, 100);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// "Ciao Mario, sono Giacomo…" se c'è il nome, altrimenti "Ciao, sono Giacomo…"
function linkWa(tel, nome) {
  var saluto = 'Ciao' + (nome ? ' ' + String(nome).replace(/^'/, '') : '');
  return 'https://wa.me/' + String(tel).replace(/\D/g, '') + '?text=' + encodeURIComponent(saluto + TESTO_WA);
}

// Cella WhatsApp: testo corto cliccabile invece dell'URL lunghissimo.
function linkChat(url) {
  return SpreadsheetApp.newRichTextValue().setText(TESTO_LINK).setLinkUrl(url).build();
}

function leggibile(mappa, v) {
  return Object.prototype.hasOwnProperty.call(mappa, v) ? mappa[v] : testo(v);
}

function risposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function foglio() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(FOGLIO) || ss.getSheets()[0].setName(FOGLIO);
}

function proprietario() {
  return Session.getEffectiveUser().getEmail();
}

function colore(hex) {
  var n = parseInt(hex.slice(1), 16);
  return { rgbColor: { red: (n >> 16 & 255) / 255, green: (n >> 8 & 255) / 255, blue: (n & 255) / 255 } };
}

// Crea la tabella sull'intero foglio (tutte le righe: i contatti nuovi finiscono sempre dentro).
// Serve il servizio avanzato "Google Sheets API" (editor → Servizi → + → Google Sheets API).
// Se la tabella c'è già non la tocca. Restituisce true se l'ha creata.
function creaTabella(sh) {
  if (typeof Sheets === 'undefined') {
    throw new Error('Attiva il servizio "Google Sheets API": nell\'editor, a sinistra, Servizi → + → Google Sheets API → Aggiungi. Poi rilancia prepara.');
  }
  var id = SpreadsheetApp.getActiveSpreadsheet().getId();
  var info = Sheets.Spreadsheets.get(id, { fields: 'sheets(properties(sheetId),tables(tableId))' });
  var questo = (info.sheets || []).filter(function (s) { return s.properties.sheetId === sh.getSheetId(); })[0];
  if (questo && questo.tables && questo.tables.length) return false;

  sh.getRange(2, 1, sh.getMaxRows() - 1, INTESTAZIONI.length).clearDataValidations();
  var tipi = ['DATE_TIME', 'TEXT', 'TEXT', 'TEXT', 'TEXT', 'DROPDOWN', 'DATE', 'TEXT', 'TEXT'];
  var colonne = INTESTAZIONI.map(function (nome, i) {
    var c = { columnIndex: i, columnName: nome, columnType: tipi[i] };
    if (tipi[i] === 'DROPDOWN') {
      c.dataValidationRule = { condition: { type: 'ONE_OF_LIST', values: STATI.map(function (s) { return { userEnteredValue: s }; }) } };
    }
    return c;
  });
  Sheets.Spreadsheets.batchUpdate({ requests: [{ addTable: { table: {
    name: 'Contatti',
    range: { sheetId: sh.getSheetId(), startRowIndex: 0, endRowIndex: sh.getMaxRows(), startColumnIndex: 0, endColumnIndex: INTESTAZIONI.length },
    rowsProperties: { headerColorStyle: colore('#0a0a0a'), firstBandColorStyle: colore('#ffffff'), secondBandColorStyle: colore('#fbfaf7') },
    columnProperties: colonne,
  } } }] }, id);
  return true;
}

// Prima riga vuota sotto l'ultimo contatto. Non si usa appendRow: con la tabella che copre tutto il foglio
// le righe vuote della tabella potrebbero contare come "occupate" e il contatto finirebbe fuori.
function rigaLibera(sh) {
  var n = INTESTAZIONI.length;
  var valori = sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), n).getValues();
  for (var i = valori.length - 1; i >= 0; i--) {
    if (valori[i].join('') !== '') return i + 3;
  }
  return 2;
}

// Si può rilanciare quando vuoi: rifà intestazioni, formati, colori e promemoria senza duplicarli.
function prepara() {
  var sh = foglio();
  var n = INTESTAZIONI.length;

  // Solo le colonne che servono
  if (sh.getMaxColumns() > n) sh.deleteColumns(n + 1, sh.getMaxColumns() - n);
  var righe = sh.getMaxRows();

  sh.getRange(1, 1, righe, n).setFontFamily('Inter').setFontSize(10).setVerticalAlignment('middle');
  sh.getRange(1, 1, 1, n).setValues([INTESTAZIONI]).setFontWeight('bold')
    .setBackground('#0a0a0a').setFontColor('#ffffff');
  sh.setRowHeight(1, 36);
  sh.setFrozenRows(1);
  sh.setTabColor('#fa6800');
  LARGHEZZE.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });

  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange('B:B').setNumberFormat('@'); // testo: sennò "+39…" diventa un numero
  sh.getRange('G:G').setNumberFormat('dd/MM/yyyy');
  sh.getRange('B2:B').setFontWeight('bold');
  sh.getRange('F2:F').setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange('H2:H').setWrap(true);
  sh.getRange('I2:I').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

  // Tabella vera di Google Fogli: intestazione colorata, righe alternate, tendina Stato, colonna data.
  // Le righe alternate "vecchie" e le tendine fatte a mano vanno tolte prima: la tabella le rifà lei.
  sh.getBandings().forEach(function (b) { b.remove(); });
  creaTabella(sh);

  // Stato colorato; "Ricontatta il" in rosso se è oggi o passato; riga grigia se Perso
  var regola = function () { return SpreadsheetApp.newConditionalFormatRule(); };
  var regole = STATI.map(function (s) {
    return regola().whenTextEqualTo(s).setBackground(COLORI_STATO[s][0]).setFontColor(COLORI_STATO[s][1])
      .setRanges([sh.getRange('F2:F')]).build();
  });
  regole.push(regola().whenFormulaSatisfied('=($G2<>"")*($G2<=TODAY())*($F2<>"Cliente")*($F2<>"Perso")') // senza "," o ";": vale in ogni lingua
    .setBackground('#fde8e8').setFontColor('#c81e1e').setBold(true).setRanges([sh.getRange('G2:G')]).build());
  regole.push(regola().whenFormulaSatisfied('=$F2="Perso"')
    .setFontColor('#9a9a9a').setRanges([sh.getRange('A2:E'), sh.getRange('G2:I')]).build());
  sh.setConditionalFormatRules(regole);

  // Link WhatsApp già presenti come URL → "Apri chat →"
  var ultima = sh.getLastRow();
  if (ultima > 1) {
    sh.getRange(2, 9, ultima - 1, 1).getValues().forEach(function (r, i) {
      if (/^https:\/\/wa\.me\//.test(String(r[0]))) sh.getRange(i + 2, 9).setRichTextValue(linkChat(r[0]));
    });
  }

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'promemoria') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('promemoria').timeBased().everyDays(1).atHour(8).inTimezone(FUSO).create();
}

function doPost(e) {
  var dati;
  try {
    dati = JSON.parse(e.postData.contents);
  } catch (err) {
    return risposta({ ok: false });
  }

  // Token sbagliato: non scrive e non avvisa. Nessun dettaglio nella risposta.
  var atteso = PropertiesService.getScriptProperties().getProperty('SHEET_TOKEN');
  if (!atteso || !dati || dati.token !== atteso) return risposta({ ok: false });

  var tel = String(dati.telefono || '');
  if (!/^\+39\d{6,11}$/.test(tel)) return risposta({ ok: false });

  var ora = new Date();
  var haSito = leggibile(RISPOSTE_SITO, dati.ha_sito);
  var nome = String(dati.nome == null ? '' : dati.nome).trim().replace(/\s+/g, ' ').slice(0, 60);
  var wa = linkWa(tel, nome);

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = foglio();
    var riga = [ora, tel, testo(nome), leggibile(ORIGINI, dati.source), haSito, 'Nuovo', '', '', wa];
    var r = rigaLibera(sh);
    if (r > sh.getMaxRows()) {
      sh.appendRow(riga); // foglio pieno: si aggiunge in fondo
      r = sh.getLastRow();
    } else {
      sh.getRange(r, 1, 1, riga.length).setValues([riga]);
    }
    // Se il testo cliccabile non riesce, resta l'URL: il contatto è già salvato.
    try { sh.getRange(r, 9).setRichTextValue(linkChat(wa)); } catch (err) { console.error(err); }
  } finally {
    lock.releaseLock();
  }

  // La riga è salvata: se l'email non parte (es. quota giornaliera), il contatto non si perde.
  try {
    MailApp.sendEmail(proprietario(), 'Nuovo contatto dal sito: ' + (nome ? nome + ' · ' : '') + tel, [
      'Nuovo contatto dal modulo Check-up.',
      '',
      'Nome: ' + (nome || '-'),
      'Telefono: ' + tel,
      'Ha già un sito: ' + (haSito || '-'),
      'Data: ' + Utilities.formatDate(ora, FUSO, 'dd/MM/yyyy HH:mm'),
      '',
      'Scrivigli su WhatsApp: ' + wa,
      '',
      'Foglio: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].join('\n'));
  } catch (err) {
    console.error('Email non inviata: ' + err);
  }

  return risposta({ ok: true });
}

function eData(v) {
  return v && typeof v.getTime === 'function' && !isNaN(v.getTime());
}

function promemoria() {
  // Si confrontano giorni di calendario ('yyyyMMdd'): la data della cella letta nel fuso del foglio,
  // oggi in Europe/Rome. Così non conta il fuso del progetto Apps Script.
  var oggi = Utilities.formatDate(new Date(), FUSO, 'yyyyMMdd');
  var fusoFoglio = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

  var lista = foglio().getDataRange().getValues().slice(1).filter(function (r) {
    var stato = r[5];
    if (CHIUSI.indexOf(stato) !== -1) return false;
    if (stato === 'Nuovo') return true;
    return eData(r[6]) && Utilities.formatDate(r[6], fusoFoglio, 'yyyyMMdd') <= oggi;
  });
  if (!lista.length) return;

  // Il link si ricostruisce dal telefono: nella cella c'è il testo "Apri chat →", non l'URL.
  var righe = lista.map(function (r) {
    return [r[1], r[2], r[5], r[1] ? linkWa(r[1], r[2]) : ''].filter(function (x) { return x !== '' && x != null; }).join(' · ');
  });
  MailApp.sendEmail(proprietario(), 'Da ricontattare oggi: ' + lista.length, [
    'Contatti ancora "Nuovo" o con "Ricontatta il" a oggi o prima:',
    '',
  ].concat(righe).concat(['', 'Foglio: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()]).join('\n'));
}
