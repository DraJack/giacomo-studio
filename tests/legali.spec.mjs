import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { blockExternal, squash } from './helpers.mjs';

const BASE = '4afc96d';
const repo = new URL('..', import.meta.url);

for (const file of ['privacy.html', 'termini.html']) {
  test(`${file}: testo identico e stile chiaro`, async ({ page, browser }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await blockExternal(page);
    await page.goto('/' + file);
    // Privacy: le righe del modulo Check-up sono cambiate (telefono al posto dell'email, Google al posto di Brevo,
    // anche nella riga di Vercel), il resto no.
    const text = (f) => { document.querySelectorAll('li').forEach((li) => { if (f === 'privacy.html' && /Check-up|^Vercel Inc\./.test(li.textContent) && !li.querySelector('li')) li.remove(); }); return document.body.innerText; };
    const now = squash(await page.evaluate(text, file));
    await expect(page.locator('link[href*="cdnfonts"]')).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

    const oldHtml = execFileSync('git', ['show', `${BASE}:${file}`], { cwd: repo, encoding: 'utf8' });
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 } });
    const old = await ctx.newPage();
    await old.route('**/*', (r) => (r.request().url().endsWith('/' + file) ? r.fulfill({ contentType: 'text/html', body: oldHtml }) : r.abort()));
    await old.goto('http://localhost:4173/' + file);
    const before = squash(await old.evaluate(text, file));
    await ctx.close();
    expect(now).toBe(before);
  });
}

test('privacy: il Check-up raccoglie il telefono', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/privacy.html');
  const body = await page.locator('body').innerText();
  expect(body).toContain('numero di telefono e risposta alla domanda');
  expect(body).toContain("scriverti su WhatsApp per mandarti l'esempio di sito");
  expect(body).not.toContain('al massimo quattro');
  // I numeri del Check-up stanno nel foglio Google, non più su Brevo.
  expect(body).not.toContain('Brevo');
  expect(body).toContain('Google Ireland Ltd.');
  expect(body).toContain('inoltro dei dati del modulo "Check-up" a Google');
});
