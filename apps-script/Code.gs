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

// Messaggio già scritto quando apri il link WhatsApp dall'email o dal foglio.
var TESTO_WA = 'Ciao, sono Giacomo di giacomostudio. Mi hai lasciato il numero sul sito: questo è un esempio di sito che preparo per le imprese di infissi https://giacomostudio.it/esempio/';

// Valori liberi: massimo 100 caratteri, e mai interpretati come formula.
function testo(v) {
  var s = String(v == null ? '' : v).slice(0, 100);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function linkWa(tel) {
  return 'https://wa.me/' + String(tel).replace(/\D/g, '') + '?text=' + encodeURIComponent(TESTO_WA);
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

function prepara() {
  var sh = foglio();
  sh.getRange(1, 1, 1, INTESTAZIONI.length).setValues([INTESTAZIONI]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange('B:B').setNumberFormat('@'); // testo: sennò "+39…" diventa un numero
  sh.getRange('G:G').setNumberFormat('dd/MM/yyyy');
  sh.getRange('F2:F').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATI, true).setAllowInvalid(false).build());
  sh.getRange('G2:G').setDataValidation(
    SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).build());

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
  var haSito = testo(dati.ha_sito);
  var wa = linkWa(tel);

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    foglio().appendRow([ora, tel, '', testo(dati.source), haSito, 'Nuovo', '', '', wa]);
  } finally {
    lock.releaseLock();
  }

  // La riga è salvata: se l'email non parte (es. quota giornaliera), il contatto non si perde.
  try {
    MailApp.sendEmail(proprietario(), 'Nuovo contatto dal sito: ' + tel, [
      'Nuovo contatto dal modulo Check-up.',
      '',
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

  var righe = lista.map(function (r) {
    return [r[1], r[2], r[5], r[8]].filter(function (x) { return x !== '' && x != null; }).join(' · ');
  });
  MailApp.sendEmail(proprietario(), 'Da ricontattare oggi: ' + lista.length, [
    'Contatti ancora "Nuovo" o con "Ricontatta il" a oggi o prima:',
    '',
  ].concat(righe).concat(['', 'Foglio: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()]).join('\n'));
}
