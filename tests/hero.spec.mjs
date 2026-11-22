import { test, expect } from '@playwright/test';
import { gotoHome, blockWaNavigation, gaEvents, expectOldTextsIn, WA_BASE_HREF } from './helpers.mjs';

const WA = 'https://wa.me/393493457558?text=';
const withName = (n) => WA + encodeURIComponent(`Ciao Giacomo, ho un'impresa di infissi (${n}) e vorrei vedere gratis il sito che mi prepari.`);

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

test('il nome aggiorna il telefono', async ({ page }) => {
  await gotoHome(page);
  const logo = page.locator('#hero .mini-logo');
  await page.locator('#demo-name').fill('Rossi Infissi');
  await expect(logo).toHaveText('ROSSI INFISSI');
  await page.locator('#demo-name').fill('');
  await expect(logo).toHaveText('ALBA');
  await expect(page.locator('#hero .mini-sub')).toHaveText('SERRAMENTI');
});

async function stubOpen(page) {
  await page.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
}

test('il nome entra nel WhatsApp solo al clic', async ({ page }) => {
  await stubOpen(page);
  await gotoHome(page);
  await blockWaNavigation(page);
  await page.locator('#demo-name').fill("Dell'Anna & Figli");
  const hrefs = await page.$$eval('a[data-wa]', (as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(1);
  for (const h of hrefs) expect(h).toBe(WA_BASE_HREF);
  await page.locator('#hero a[data-wa]').first().click();
  expect(await page.evaluate(() => window.__opened)).toEqual([withName("Dell'Anna & Figli")]);
  expect(await gaEvents(page, 'whatsapp_click')).toEqual([{ button_location: 'hero' }]);
});

test('emoji al limite non rompe i link', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await stubOpen(page);
  await gotoHome(page);
  await blockWaNavigation(page);
  await page.locator('#demo-name').fill('Serramenti Rossi e Figli ab😀 srl');
  const logo = await page.locator('#hero .mini-logo').textContent();
  expect(() => encodeURIComponent(logo)).not.toThrow();
  await page.locator('#hero a[data-wa]').first().click();
  const opened = await page.evaluate(() => window.__opened);
  expect(opened.length).toBe(1);
  expect(decodeURIComponent(opened[0])).toContain('Serramenti Rossi e Figli ab');
  expect(errors).toEqual([]);
});

test('su telefono il logo resta visibile mentre scrivi', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo telefono');
  await page.setViewportSize({ width: 375, height: 440 });
  await gotoHome(page);
  await page.locator('#demo-name').scrollIntoViewIfNeeded();
  await page.locator('#demo-name').fill('Rossi Infissi');
  const box = await page.locator('#hero .mini-logo').boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(440);
});

test('i telefoni dicono che è un esempio', async ({ page }) => {
  await gotoHome(page);
  for (const sel of ['#hero .phone', '#quote', '#check-up .phone']) {
    await expect(page.locator(`${sel} .phone-tag`)).toHaveText('Esempio');
  }
});

test('cancellare il nome ripristina i link', async ({ page }) => {
  await gotoHome(page);
  await page.locator('#demo-name').fill('Rossi Infissi');
  await page.locator('#demo-name').fill('');
  const hrefs = await page.$$eval('a[data-wa]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of hrefs) expect(h).toBe(WA_BASE_HREF);
});

test('niente HTML iniettato', async ({ page }) => {
  await gotoHome(page);
  await page.locator('#demo-name').fill('<b>x</b>');
  await expect(page.locator('#hero .mini-logo')).toHaveText('<B>X</B>');
  await expect(page.locator('#hero .phone b')).toHaveCount(0);
});

test('nome lungo troncato', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await gotoHome(page);
  await page.locator('#demo-name').fill('Infissi e Serramenti di Qualità Fratelli Rossi Sud Italia srl');
  const t = await page.locator('#hero .mini-logo').textContent();
  expect(t.length).toBeLessThanOrEqual(28);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('evento anonimo una volta', async ({ page }) => {
  await gotoHome(page);
  await page.locator('#demo-name').fill('Rossi Infissi');
  await page.locator('#demo-name').fill('Bianchi Serramenti');
  const ev = await gaEvents(page, 'demo_name_typed');
  expect(ev.length).toBe(1);
  expect(JSON.stringify(ev)).not.toMatch(/Rossi|Bianchi/);
});
