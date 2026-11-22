// Funzione Vercel api/subscribe.js: numero di telefono → app web Apps Script del foglio Google.
import { test, expect } from '@playwright/test';
import mod from '../api/subscribe.js';

// Playwright trascrive il file in CommonJS: l'export default arriva dentro `default`.
const handler = typeof mod === 'function' ? mod : mod.default;

test.describe.configure({ mode: 'serial' });

const URL_EXEC = 'https://script.google.com/macros/s/X/exec';
const OK = { ok: true, status: 200, json: async () => ({ ok: true }) };

async function call(body, { env = { SHEET_WEBHOOK_URL: URL_EXEC, SHEET_TOKEN: 't0k' }, reply = OK, method = 'POST' } = {}) {
  const sent = [];
  const realFetch = globalThis.fetch;
  const realEnv = { SHEET_WEBHOOK_URL: process.env.SHEET_WEBHOOK_URL, SHEET_TOKEN: process.env.SHEET_TOKEN };
  for (const k of ['SHEET_WEBHOOK_URL', 'SHEET_TOKEN']) { if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  globalThis.fetch = async (url, opts) => {
    sent.push({ url, opts, body: JSON.parse(opts.body) });
    if (typeof reply === 'function') return reply();
    return reply;
  };
  const res = { code: 0, data: null, status(c) { this.code = c; return this; }, json(d) { this.data = d; return this; } };
  try { await handler({ method, body }, res); } finally {
    globalThis.fetch = realFetch;
    for (const k of Object.keys(realEnv)) { if (realEnv[k] === undefined) delete process.env[k]; else process.env[k] = realEnv[k]; }
  }
  return { res, sent };
}

test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop', 'una volta sola'); });

test('numero valido → Apps Script con token e numero normalizzato', async () => {
  const { res, sent } = await call({ telefono: '+39 340-123.4567', tipo_business: 'serramenti', ha_sito: 'vecchio', source: 'landing-checkup' });
  expect(res.code).toBe(200);
  expect(res.data).toEqual({ ok: true });
  expect(sent).toHaveLength(1);
  expect(sent[0].url).toBe(URL_EXEC);
  expect(sent[0].opts.method).toBe('POST');
  expect(sent[0].opts.redirect).toBe('follow');
  expect(sent[0].opts.headers['content-type']).toBe('application/json');
  expect(sent[0].body).toEqual({ token: 't0k', telefono: '+393401234567', ha_sito: 'vecchio', source: 'landing-checkup' });
  const all = JSON.stringify(sent).toLowerCase();
  for (const w of ['brevo', 'sms', 'api-key']) expect(all).not.toContain(w);
});

test('0039 e fisso', async () => {
  const { sent } = await call({ telefono: '0039 080 1234567' });
  expect(sent[0].body.telefono).toBe('+390801234567');
  expect(sent[0].body.ha_sito).toBe('');
  expect(sent[0].body.source).toBe('');
});

for (const bad of ['abc', '', '12345', '+44 7700 900123', undefined]) {
  test(`numero sbagliato ${String(bad)} → 400`, async () => {
    const { res, sent } = await call({ telefono: bad });
    expect(res.code).toBe(400);
    expect(res.data.error).toBe('Controlla il numero, sembra incompleto.');
    expect(sent).toEqual([]);
  });
}

for (const missing of ['SHEET_WEBHOOK_URL', 'SHEET_TOKEN']) {
  test(`manca ${missing} → 500`, async () => {
    const env = { SHEET_WEBHOOK_URL: URL_EXEC, SHEET_TOKEN: 't0k', [missing]: undefined };
    const { res, sent } = await call({ telefono: '3401234567' }, { env });
    expect(res.code).toBe(500);
    expect(res.data.error).toBe('Configurazione server mancante.');
    expect(sent).toEqual([]);
  });
}

const failures = {
  'Apps Script dice ok:false': { ok: true, status: 200, json: async () => ({ ok: false }) },
  'Apps Script 500': { ok: false, status: 500, json: async () => ({}) },
  'risposta HTML (il JSON non si legge)': { ok: true, status: 200, json: async () => { throw new SyntaxError('Unexpected token <'); } },
  'fetch lancia': () => { throw new TypeError('fetch failed'); },
};
for (const [name, reply] of Object.entries(failures)) {
  test(`${name} → 502`, async () => {
    const { res } = await call({ telefono: '3401234567' }, { reply });
    expect(res.code).toBe(502);
    expect(res.data.error).toBe('Invio non riuscito. Riprova.');
  });
}

test('GET → 405', async () => {
  const { res, sent } = await call(undefined, { method: 'GET' });
  expect(res.code).toBe(405);
  expect(sent).toEqual([]);
});
