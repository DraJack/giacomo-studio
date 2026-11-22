import { test, expect } from '@playwright/test';
import { blockExternal, scrollThrough } from './helpers.mjs';

async function gotoEsempio(page) {
  await blockExternal(page);
  const res = await page.goto('/esempio/');
  return res;
}

test('la demo esiste e non va su Google', async ({ page }) => {
  const res = await gotoEsempio(page);
  expect(res.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('la demo dice che è un esempio', async ({ page }) => {
  await gotoEsempio(page);
  const bar = page.locator('.demo-bar');
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('Sito di esempio');
  await expect(bar.locator('a[href^="https://giacomostudio.it"]')).toHaveCount(1);
});

test('WhatsApp porta a Giacomo, niente numeri finti', async ({ page }) => {
  await gotoEsempio(page);
  const wa = await page.$$eval('a[href*="wa.me"]', (as) => as.map((a) => a.getAttribute('href')));
  expect(wa.length).toBeGreaterThan(0);
  for (const h of wa) expect(h.startsWith('https://wa.me/393493457558')).toBe(true);
  const tel = await page.$$eval('a[href^="tel:"]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of tel) expect(h).not.toContain('000');
  expect(await page.locator('body').innerText()).not.toMatch(/P\.?\s?IVA\s*0{5,}/i);
});

test('foto vere, caricate', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED/.test(m.text())) errors.push(m.text()); });
  await gotoEsempio(page);
  await expect(page.locator('.hero-art img')).toHaveCount(1);
  await scrollThrough(page);
  await page.waitForTimeout(600);
  const imgs = await page.$$eval('img[src]', (is) => is.map((i) => ({ src: i.getAttribute('src'), w: i.naturalWidth })));
  expect(imgs.length).toBeGreaterThanOrEqual(5);
  for (const i of imgs) expect(i.w, i.src).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('niente scroll orizzontale a 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await gotoEsempio(page);
  await scrollThrough(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
