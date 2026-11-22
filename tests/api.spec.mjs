// Funzione Vercel api/subscribe.js: numero di telefono → contatto Brevo (attributo SMS).
import { test, expect } from '@playwright/test';
import mod from '../api/subscribe.js';

// Playwright trascrive il file in CommonJS: l'export default arriva dentro `default`.
const handler = typeof mod === 'function' ? mod : mod.default;

test.describe.configure({ mode: 'serial' });

async function call(body) {
  const sent = [];
  const realFetch = globalThis.fetch;
  process.env.BREVO_API_KEY = 'k';
  process.env.BREVO_LIST_ID = '7';
  globalThis.fetch = async (url, opts) => { sent.push({ url, body: JSON.parse(opts.body), key: opts.headers['api-key'] }); return { ok: true, status: 201, json: async () => ({}) }; };
  const res = { code: 0, data: null, status(c) { this.code = c; return this; }, json(d) { this.data = d; return this; } };
  try { await handler({ method: 'POST', body }, res); } finally { globalThis.fetch = realFetch; }
  return { res, sent };
}

test('numero valido → Brevo con SMS, senza email', async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'una volta sola');
  const { res, sent } = await call({ telefono: '+39 340-123.4567', tipo_business: 'serramenti', ha_sito: 'vecchio', source: 'landing-checkup' });
  expect(res.code).toBe(200);
  expect(sent).toHaveLength(1);
  expect(sent[0].url).toBe('https://api.brevo.com/v3/contacts');
  expect(sent[0].body).toEqual({
    attributes: { SMS: '+393401234567', TIPO_BUSINESS: 'serramenti', HA_SITO: 'vecchio', SOURCE: 'landing-checkup' },
    listIds: [7],
    updateEnabled: true,
  });
});

test('0039 e fisso', async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'una volta sola');
  const { sent } = await call({ telefono: '0039 080 1234567' });
  expect(sent[0].body.attributes.SMS).toBe('+390801234567');
});

for (const bad of ['abc', '', '12345', '+44 7700 900123', undefined]) {
  test(`numero sbagliato ${String(bad)} → 400`, async ({}, info) => {
    test.skip(info.project.name !== 'desktop', 'una volta sola');
    const { res, sent } = await call({ telefono: bad });
    expect(res.code).toBe(400);
    expect(res.data.error).toBe('Controlla il numero, sembra incompleto.');
    expect(sent).toEqual([]);
  });
}

test('numero già presente su Brevo → conferma lo stesso', async ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'una volta sola');
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ code: 'duplicate_parameter', message: 'SMS is already associated with another Contact' }) });
  const res = { code: 0, data: null, status(c) { this.code = c; return this; }, json(d) { this.data = d; return this; } };
  try { await handler({ method: 'POST', body: { telefono: '3401234567' } }, res); } finally { globalThis.fetch = realFetch; }
  expect(res.code).toBe(200);
});
