import { test, expect } from '@playwright/test';
import { gotoHome, blockWaNavigation, gaEvents, expectOldTextsIn, WA_BASE_HREF } from './helpers.mjs';

test('testi hero invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, '#hero', ['.hero-h1', '.hero-kicker', '.hero-badge-text']);
});

test('hero tracciato', async ({ page }) => {
  await gotoHome(page);
  await blockWaNavigation(page);
  await page.locator('#hero a[href*="wa.me"]').first().click();
  expect(await gaEvents(page, 'whatsapp_click')).toEqual([{ button_location: 'hero' }]);
});

test('niente nome impresa né "Prova un modello"', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('#demo-name')).toHaveCount(0);
  const text = await page.locator('body').innerText();
  expect(text).not.toContain('Prova col nome');
  expect(text).not.toContain('Prova un modello');
});

test('il telefono mostra la demo vera', async ({ page }) => {
  await gotoHome(page);
  const img = page.locator('#hero .phone img');
  await expect(img).toHaveCount(1);
  expect(await img.getAttribute('src')).toMatch(/img\/esempio-mobile\.webp$/);
  expect(await img.getAttribute('loading')).not.toBe('lazy');
  await expect.poll(() => img.evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
  const s = await page.locator('#hero .phone-screen').evaluate((e) => ({ sh: e.scrollHeight, ch: e.clientHeight }));
  expect(s.sh).toBeGreaterThan(s.ch + 200);
});

test('link al sito di esempio', async ({ page }) => {
  await gotoHome(page);
  const a = page.locator('#hero .demo-link');
  await expect(a).toHaveAttribute('href', '/esempio/');
  await expect(a).toHaveAttribute('target', '_blank');
  await expect(a).toContainText('Apri il sito di esempio');
});

test('WhatsApp usa il link base, senza window.open', async ({ page }) => {
  await page.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await gotoHome(page);
  await blockWaNavigation(page);
  const hrefs = await page.$$eval('a[data-wa]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of hrefs) expect(h).toBe(WA_BASE_HREF);
  await page.locator('#hero a[data-wa]').first().click();
  expect(await page.evaluate(() => window.__opened)).toEqual([]);
});

test('i telefoni dicono che è un esempio', async ({ page }) => {
  await gotoHome(page);
  for (const sel of ['#hero .phone', '#quote', '#check-up .phone']) {
    await expect(page.locator(`${sel} .phone-tag`)).toHaveText('Esempio');
  }
});

test('riduci movimento: il telefono resta fermo', async ({ page }) => {
  await gotoHome(page, { reducedMotion: true });
  await page.waitForTimeout(2500);
  expect(await page.locator('#hero .phone-screen').evaluate((e) => e.scrollTop)).toBe(0);
});

test('il telefono scorre da solo e si ferma al tocco', async ({ page }) => {
  await gotoHome(page);
  const screen = page.locator('#hero .phone-screen');
  await expect.poll(() => screen.evaluate((e) => e.scrollTop), { timeout: 4000 }).toBeGreaterThan(0);
  await screen.dispatchEvent('pointerdown');
  const a = await screen.evaluate((e) => e.scrollTop);
  await page.waitForTimeout(600);
  expect(await screen.evaluate((e) => e.scrollTop)).toBe(a);
});

test('senza JS si vede la demo nel telefono', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.route(/googletagmanager|facebook/, (r) => r.abort());
  await page.goto('/');
  await expect.poll(() => page.locator('#hero .phone img').evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
  await ctx.close();
});
