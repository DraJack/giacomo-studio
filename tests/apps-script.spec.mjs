// Script del foglio Google (apps-script/Code.gs) eseguito in Node con servizi Google finti.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const CODE = readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');

test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'una volta sola'); });

// Crea un contesto con il foglio `rows` (riga 1 = intestazioni) e registra cosa fa lo script.
// Giorno di calendario 'yyyyMMdd' di un istante in un fuso, come Utilities.formatDate.
const ymd = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/-/g, '');

function load({ rows = [['Data']], token = 't0k', sheetTz = 'Europe/Rome' } = {}) {
  const log = { appended: [], mails: [], formats: {}, validations: {}, triggers: [], deleted: [], frozen: 0, headers: null };
  const range = (a1) => {
    const r = {
      setValues(v) { log.headers = v; return r; },
      setFontWeight() { return r; },
      setNumberFormat(f) { log.formats[a1] = f; return r; },
      setDataValidation(v) { log.validations[a1] = v; return r; },
    };
    return r;
  };
  const sheet = {
    getName: () => 'Contatti',
    setName() { return sheet; },
    appendRow(r) { log.appended.push(r); rows.push(r); },
    getDataRange: () => ({ getValues: () => rows.map((r) => r.slice()) }),
    getRange(a, b, c, d) { return range(typeof a === 'string' ? a : `R${a}C${b}:${c}x${d}`); },
    setFrozenRows(n) { log.frozen = n; },
  };
  const ss = { getSheetByName: (n) => (n === 'Contatti' ? sheet : null), getSheets: () => [sheet], getUrl: () => 'https://docs.google.com/spreadsheets/d/F', getSpreadsheetTimeZone: () => sheetTz };
  const validation = () => {
    const v = { list: null, date: false };
    const b = { requireValueInList(l) { v.list = l; return b; }, requireDate() { v.date = true; return b; }, setAllowInvalid() { return b; }, build: () => v };
    return b;
  };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, newDataValidation: validation },
    MailApp: { sendEmail(to, subject, body) { log.mails.push({ to, subject, body }); } },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'proprietario@gmail.com' }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k === 'SHEET_TOKEN' ? token : null) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s) => ({ text: s, setMimeType() { return this; } }),
    },
    Utilities: { formatDate: (d, tz, f) => (f === 'yyyyMMdd' ? ymd(d, tz) : `${tz}|${f}`) },
    ScriptApp: {
      getProjectTriggers: () => [{ getHandlerFunction: () => 'promemoria' }, { getHandlerFunction: () => 'altro' }],
      deleteTrigger(t) { log.deleted.push(t.getHandlerFunction()); },
      newTrigger(fn) {
        const t = { fn };
        const b = { timeBased() { return b; }, everyDays(n) { t.days = n; return b; }, atHour(h) { t.hour = h; return b; }, inTimezone(z) { t.tz = z; return b; }, create() { log.triggers.push(t); return t; } };
        return b;
      },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx);
  return { ctx, log, rows };
}

const post = (ctx, obj) => JSON.parse(ctx.doPost({ postData: { contents: typeof obj === 'string' ? obj : JSON.stringify(obj) } }).text);
const BUONO = { token: 't0k', telefono: '+393401234567', ha_sito: 'vecchio', source: 'landing-checkup' };

test('token giusto → riga + email', () => {
  const { ctx, log } = load();
  expect(post(ctx, BUONO)).toEqual({ ok: true });
  expect(log.appended).toHaveLength(1);
  const r = log.appended[0];
  expect(r).toHaveLength(9);
  expect(r[1]).toBe('+393401234567');
  expect(r[3]).toBe('landing-checkup');
  expect(r[4]).toBe('vecchio');
  expect(r[5]).toBe('Nuovo');
  expect(r[8].startsWith('https://wa.me/393401234567?text=')).toBe(true);
  expect(decodeURIComponent(r[8])).toContain('https://giacomostudio.it/esempio/');
  expect(log.mails).toHaveLength(1);
  expect(log.mails[0].to).toBe('proprietario@gmail.com');
  expect(log.mails[0].subject).toBe('Nuovo contatto dal sito: +393401234567');
  expect(log.mails[0].body).toContain('Ha già un sito: vecchio');
  expect(log.mails[0].body).toContain('Telefono: +393401234567');
  expect(log.mails[0].body).toContain('Europe/Rome|dd/MM/yyyy HH:mm');
  expect(log.mails[0].body).toContain(r[8]);
});

for (const [name, body, opts] of [
  ['token sbagliato', { ...BUONO, token: 'no' }, {}],
  ['token assente', { ...BUONO, token: undefined }, {}],
  ['token non impostato nello script', BUONO, { token: null }],
]) {
  test(`${name} → niente riga, niente email, ok:false`, () => {
    const { ctx, log } = load(opts);
    expect(post(ctx, body)).toEqual({ ok: false });
    expect(log.appended).toEqual([]);
    expect(log.mails).toEqual([]);
  });
}

test('JSON rotto o postData assente → ok:false senza eccezione', () => {
  const { ctx, log } = load();
  expect(post(ctx, '{rotto')).toEqual({ ok: false });
  expect(JSON.parse(ctx.doPost({}).text)).toEqual({ ok: false });
  expect(JSON.parse(ctx.doPost(undefined).text)).toEqual({ ok: false });
  expect(log.appended).toEqual([]);
});

test('telefono non normalizzato → ok:false', () => {
  const { ctx, log } = load();
  for (const t of ['3401234567', '+44770090012', '=1+1', '']) expect(post(ctx, { ...BUONO, telefono: t })).toEqual({ ok: false });
  expect(log.appended).toEqual([]);
});

test('formula in ha_sito → salvata come testo, testo lungo troncato', () => {
  const { ctx, log } = load();
  post(ctx, { ...BUONO, ha_sito: '=HYPERLINK("x")', source: 'x'.repeat(500) });
  expect(log.appended[0][4]).toBe("'=HYPERLINK(\"x\")");
  expect(log.appended[0][3].length).toBeLessThanOrEqual(101);
  for (const c of ['+', '-', '@']) expect(ctx.testo(c + 'a')).toBe("'" + c + 'a');
  expect(ctx.testo(undefined)).toBe('');
});

test('email che non parte → la riga resta e la risposta è ok', () => {
  const { ctx, log } = load();
  ctx.MailApp.sendEmail = () => { throw new Error('quota'); };
  expect(post(ctx, BUONO)).toEqual({ ok: true });
  expect(log.appended).toHaveLength(1);
});

const giorno = (delta) => { const d = new Date(); d.setDate(d.getDate() + delta); d.setHours(12, 0, 0, 0); return d; };
const riga = (tel, stato, quando, nome = '') => [giorno(-3), tel, nome, 'whatsapp', '', stato, quando ?? '', '', 'https://wa.me/' + tel.slice(1)];

test('promemoria: nessuno da ricontattare → nessuna email', () => {
  const { ctx, log } = load({ rows: [['Data'], riga('+391', 'Scritto', giorno(2)), riga('+392', 'Cliente', giorno(-1)), riga('+393', 'In attesa')] });
  ctx.promemoria();
  expect(log.mails).toEqual([]);
});

test('promemoria: un Nuovo e uno scaduto, uno di oggi, un Cliente scaduto → email con 3 righe', () => {
  const { ctx, log } = load({ rows: [['Data'], riga('+391', 'Nuovo'), riga('+392', 'Da ricontattare', giorno(-1), 'Mario'), riga('+393', 'Cliente', giorno(-1)), riga('+394', 'In attesa', giorno(0))] });
  ctx.promemoria();
  expect(log.mails).toHaveLength(1);
  expect(log.mails[0].to).toBe('proprietario@gmail.com');
  expect(log.mails[0].subject).toBe('Da ricontattare oggi: 3');
  const body = log.mails[0].body;
  expect(body).toContain('+391');
  expect(body).toContain('+392 · Mario · Da ricontattare');
  expect(body).toContain('+394');
  expect(body).not.toContain('+393');
});

// "Oggi" non deve dipendere dal fuso del progetto Apps Script: si confrontano giorni di calendario,
// la data della cella nel fuso del foglio e oggi in Europe/Rome.
test('promemoria: confronta i giorni con Utilities.formatDate nel fuso del foglio', () => {
  const lontano = new Date(Date.UTC(2099, 0, 1));
  const { ctx, log } = load({ rows: [['Data'], riga('+395', 'Da ricontattare', lontano)], sheetTz: 'Foglio/TZ' });
  const real = ctx.Utilities.formatDate;
  const seen = [];
  ctx.Utilities.formatDate = (d, tz, f) => {
    seen.push(tz);
    if (f === 'yyyyMMdd' && tz === 'Foglio/TZ' && d.getTime() === lontano.getTime()) return '20000101';
    return real(d, tz === 'Foglio/TZ' ? 'UTC' : tz, f);
  };
  ctx.promemoria();
  expect(log.mails).toHaveLength(1);
  expect(seen).toContain('Europe/Rome');
});

test('prepara imposta intestazioni, formati, tendina e un solo trigger alle 8', () => {
  const { ctx, log } = load();
  ctx.prepara();
  expect(log.headers).toEqual([['Data', 'Telefono', 'Nome', 'Da dove', 'Ha già un sito', 'Stato', 'Ricontatta il', 'Note', 'WhatsApp']]);
  expect(log.frozen).toBe(1);
  expect(log.formats['B:B']).toBe('@');
  expect(log.formats['A:A']).toBe('dd/MM/yyyy HH:mm');
  expect(log.formats['G:G']).toBe('dd/MM/yyyy');
  expect(log.validations['F2:F'].list).toEqual(['Nuovo', 'Scritto', 'In attesa', 'Da ricontattare', 'Cliente', 'Perso']);
  expect(log.validations['G2:G'].date).toBe(true);
  expect(log.deleted).toEqual(['promemoria']);
  expect(log.triggers).toEqual([{ fn: 'promemoria', days: 1, hour: 8, tz: 'Europe/Rome' }]);
});
