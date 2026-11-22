import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { blockExternal, gaEvents, pixelEvents, scrollThrough, WA_BASE_HREF } from './helpers.mjs';

const URL_GUIDA = '/siti-web-serramentisti/';

async function gotoGuida(page) {
  await blockExternal(page);
  return page.goto(URL_GUIDA);
}

test('guida: esiste, va su Google, titolo e dati giusti', async ({ page }) => {
  const res = await gotoGuida(page);
  expect(res.status()).toBe(200);
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).not.toMatch(/noindex/);
  await expect(page).toHaveTitle('Sito web per serramentisti: quanto costa e cosa serve');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://giacomostudio.it/siti-web-serramentisti/');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc.length).toBeLessThanOrEqual(155);
  await expect(page.locator('h1')).toHaveCount(1);
  const ld = await page.evaluate(() => Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .flatMap((s) => JSON.parse(s.textContent)['@graph']).map((n) => n['@type']));
  expect(ld).toEqual(['Article', 'BreadcrumbList']);
});

test('guida: ogni link WhatsApp è tracciato con la sua sezione', async ({ page }) => {
  await gotoGuida(page);
  const links = page.locator('a[href*="wa.me"]');
  const n = await links.count();
  for (let i = 0; i < n; i++) {
    await expect(links.nth(i)).toHaveAttribute('href', WA_BASE_HREF);
    await expect(links.nth(i)).toHaveAttribute('data-wa', '');
    await expect(links.nth(i).locator('img.wa-mark')).toHaveCount(1);
  }
  await page.evaluate(() => {
    document.addEventListener('click', (e) => { if (e.target.closest('a[href*="wa.me"]')) e.preventDefault(); }, true);
    document.querySelectorAll('a[href*="wa.me"]').forEach((a) => a.click());
  });
  const expected = ['nav', 'quanto-costa', 'cosa-deve-avere', 'esempio', 'preventivi-whatsapp', 'google', 'piu-richieste', 'contatto', 'sticky']
    .map((l) => ({ button_location: l }));
  expect(await gaEvents(page, 'whatsapp_click')).toEqual(expected);
  expect(await pixelEvents(page, 'WhatsAppClick')).toEqual(expected);
});

test('guida: niente città, niente scarsità, niente gergo', async ({ page }) => {
  await gotoGuida(page);
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/\b(taranto|bari|lecce|brindisi|foggia|andria|barletta|trani)\b/i);
  expect(text).not.toMatch(/solo \d+ posti|offerta lancio|responsive|chiavi in mano|partner digitale/i);
  expect(text).not.toMatch(/!!/);
});

test('guida: indice, immagini e telefono a 360px', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 360, height: 780 });
  await gotoGuida(page);
  const anchors = await page.$$eval('.toc a', (as) => as.map((a) => a.getAttribute('href')));
  expect(anchors.length).toBe(6);
  for (const a of anchors) await expect(page.locator(a)).toHaveCount(1);
  await scrollThrough(page);
  const broken = await page.$$eval('img', (imgs) => Promise.all(imgs.map((i) => (i.loading = 'eager', i.decode().then(() => null, () => i.src)))))
    .then((r) => r.filter(Boolean));
  expect(broken).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  expect(errors).toEqual([]);
});

test('guida: collegata dalla home e nella sitemap', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/');
  await expect(page.locator('footer a[href="/siti-web-serramentisti/"]')).toHaveCount(1);
  const sitemap = readFileSync(new URL('../sitemap.xml', import.meta.url), 'utf8');
  expect(sitemap).toContain('<loc>https://giacomostudio.it/siti-web-serramentisti/</loc>');
});
