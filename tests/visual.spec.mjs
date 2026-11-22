import { test, expect } from '@playwright/test';
import { gotoHome, scrollThrough, blockExternal, OLD_HTML } from './helpers.mjs';

test.describe.configure({ mode: 'serial' });

for (const width of [375, 768, 1280]) {
  test(`screenshot ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'una volta sola');
    await page.setViewportSize({ width, height: 900 });
    await gotoHome(page);
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: info.outputPath(`home-${width}.png`), fullPage: true, animations: 'disabled' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('riduci movimento: nessuna animazione in corso', async ({ page }) => {
  await gotoHome(page, { reducedMotion: true });
  await scrollThrough(page);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

async function pageWeight(browser, url, oldHtml) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await blockExternal(page);
  if (oldHtml) await page.route('**/__old.html', (r) => r.fulfill({ contentType: 'text/html', body: oldHtml }));
  const reads = [];
  page.on('response', (r) => reads.push(r.body().then((b) => b.length, () => 0)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await scrollThrough(page);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  const sizes = await Promise.all(reads);
  await ctx.close();
  return sizes.reduce((a, b) => a + b, 0);
}

// Le immagini vere della demo pesano: il tetto è la pagina vecchia + 450KB.
test('peso pagina entro il tetto', async ({ browser }, info) => {
  test.skip(info.project.name !== 'mobile', 'una volta sola');
  const now = await pageWeight(browser, 'http://localhost:4173/');
  const before = await pageWeight(browser, 'http://localhost:4173/__old.html', OLD_HTML);
  console.log(`peso nuovo ${now} B · vecchio ${before} B`);
  expect(now).toBeLessThanOrEqual(before + 450 * 1024);
});

// Quello che serve per la prima schermata (HTML + telefono dell'hero) resta leggero.
test('prima schermata leggera', async ({ request }) => {
  const html = (await (await request.get('/')).body()).length;
  const shot = (await (await request.get('/img/esempio-mobile.webp')).body()).length;
  console.log(`html ${html} B · telefono hero ${shot} B`);
  expect(html + shot).toBeLessThanOrEqual(320 * 1024);
});
