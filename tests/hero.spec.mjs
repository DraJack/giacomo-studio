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
  // Pillola cliccabile: icona, invito chiaro (niente indirizzo), freccia nel cerchio
  await expect(a).toHaveAttribute('aria-label', 'Apri il sito di esempio (nuova scheda)');
  await expect(a).toHaveText('Guarda un sito di esempio');
  await expect(a).not.toContainText('giacomostudio.it');
  await expect(a.locator('.demo-link-icon svg')).toHaveCount(1);
  await expect(a.locator('.demo-link-go svg')).toHaveCount(1);
  expect(await a.evaluate((e) => getComputedStyle(e).borderRadius)).toBe('100px');
  expect(await a.evaluate((e) => getComputedStyle(e).textDecorationLine)).toBe('none');
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
  await screen.evaluate((e) => e.scrollIntoView({ block: 'center' })); // su telefono è sotto la piega
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

test('gli schermi restano dentro la cornice (Safari)', async ({ page }) => {
  await gotoHome(page);
  // Safari ignora height:100% dentro un box ad aspect-ratio: lo schermo va posizionato con inset
  const s = await page.$$eval('.phone-screen', (els) => els.map((e) => {
    const c = getComputedStyle(e);
    return { pos: c.position, top: c.top, bottom: c.bottom, clip: c.clipPath };
  }));
  expect(s.length).toBeGreaterThan(3);
  for (const x of s) {
    expect(x).toMatchObject({ pos: 'absolute', top: '10px', bottom: '10px' });
    expect(x.clip).toMatch(/inset\(0px round 34px\)/);
  }
});

test('su telefono lo swipe sul telefono scorre la pagina', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo telefono');
  await gotoHome(page);
  expect(await page.locator('#hero .phone-screen').evaluate((e) => getComputedStyle(e).overflowY)).toBe('hidden');
});

test('lo scroll automatico parte quando il telefono si vede', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 420 });
  await gotoHome(page);
  const screen = page.locator('#hero .phone-screen');
  await page.waitForTimeout(2500);
  expect(await screen.evaluate((e) => e.scrollTop)).toBe(0);
  await screen.evaluate((e) => e.scrollIntoView({ block: 'center' })); // il telefono fluttua: niente attese di stabilità
  await expect.poll(() => screen.evaluate((e) => e.scrollTop), { timeout: 4000 }).toBeGreaterThan(0);
});

test('a 375px "Gratis" resta sulla riga della frase', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoHome(page);
  const top = (sel) => page.locator(sel).evaluate((e) => e.getClientRects()[0].top);
  expect(Math.abs((await top('.hero-kicker-price')) - (await top('.hero-kicker-claim')))).toBeLessThan(8);
});

test('a 375px "Puglia" non va a capo da sola', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoHome(page);
  // "serramenti", "·" e "Puglia" devono stare sulla stessa riga
  const tops = await page.locator('.hero-badge-text').evaluate((e) => {
    const node = e.firstChild, txt = node.textContent;
    const top = (word) => { const i = txt.indexOf(word); const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + word.length); return r.getClientRects()[0].top; };
    return [top('serramenti'), top('·'), top('Puglia')];
  });
  expect(Math.abs(tops[0] - tops[2])).toBeLessThan(4);
  expect(Math.abs(tops[1] - tops[2])).toBeLessThan(4);
});
