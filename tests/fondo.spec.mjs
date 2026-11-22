import { test, expect } from '@playwright/test';
import { gotoHome, blockWaNavigation, gaEvents, pixelEvents, expectOldTextsIn, squash } from './helpers.mjs';

test('testi invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, 'main', ['.about-name', '.about-role', '.about-bio', '.about-stat-label',
    '.compare-feature', '.compare-val-me', '.compare-val', '.cmc-title', '.cmc-val', '.faq-q', '.faq-a',
    '.faq-contact-title', '#contatto .h2', '.cta-sub', '.cta-trust-item', '.cu-sub', '.cu-legend', '.cu-chip span',
    '.cu-note', '.cu-privacy', '.cu-done-title']);
});

test('FAQ = dati Google', async ({ page }) => {
  await gotoHome(page);
  const ld = await page.evaluate(() => Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
    .map((s) => JSON.parse(s.textContent)).find((j) => j['@type'] === 'FAQPage').mainEntity);
  const qs = await page.locator('.faq-q').allTextContents();
  const as = await page.locator('.faq-a').allTextContents();
  expect(ld.length).toBe(7);
  expect(qs.map(squash)).toEqual(ld.map((x) => squash(x.name)));
  expect(as.map(squash)).toEqual(ld.map((x) => squash(x.acceptedAnswer.text)));
});

test('accordion uno per volta', async ({ page }) => {
  await gotoHome(page);
  const t = page.locator('.faq-trigger');
  await t.nth(0).click();
  await t.nth(1).click();
  await expect(t.nth(0)).toHaveAttribute('aria-expanded', 'false');
  await expect(t.nth(1)).toHaveAttribute('aria-expanded', 'true');
});

test('tutti i WhatsApp tracciati', async ({ page }) => {
  await gotoHome(page);
  await blockWaNavigation(page);
  await page.evaluate(() => { document.getElementById('cu-done').hidden = false; document.getElementById('nav-drawer').hidden = false; });
  const n = await page.locator('a[href*="wa.me"]').count();
  expect(await page.locator('a[href*="wa.me"]:not([data-wa])').count()).toBe(0);
  for (let i = 0; i < n; i++) await page.locator('a[href*="wa.me"]').nth(i).dispatchEvent('click');
  const locs = new Set((await gaEvents(page, 'whatsapp_click')).map((e) => e.button_location));
  expect([...locs].sort()).toEqual(['check-up', 'chi-sono', 'contatto', 'faq', 'hero', 'nav', 'pricing', 'sticky']);
  expect((await pixelEvents(page, 'WhatsAppClick')).length).toBe(n);
});

async function mockSubscribe(page, status, body) {
  const calls = [];
  await page.route('**/api/subscribe', async (r) => {
    calls.push(r.request().postDataJSON());
    await r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return calls;
}

test('check-up invio', async ({ page }) => {
  await gotoHome(page);
  const calls = await mockSubscribe(page, 200, {});
  await page.locator('#check-up').scrollIntoViewIfNeeded();
  await page.locator('.cu-chip', { hasText: 'Sì, ma è vecchio' }).click();
  await page.locator('#cu-email').fill('test@example.com');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-done')).toBeVisible();
  expect(calls).toEqual([{ email: 'test@example.com', tipo_business: 'serramenti', ha_sito: 'vecchio', source: 'landing-checkup' }]);
  expect(await gaEvents(page, 'checkup_submit')).toEqual([{ tipo_business: 'serramenti', ha_sito: 'vecchio' }]);
  expect(await pixelEvents(page, 'CheckupRequest')).toEqual([{ tipo_business: 'serramenti', ha_sito: 'vecchio' }]);
});

test('check-up email sbagliata', async ({ page }) => {
  await gotoHome(page);
  const calls = await mockSubscribe(page, 200, {});
  await page.locator('#cu-email').fill('test@');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-error')).toHaveText('Controlla l’email, sembra incompleta.');
  expect(calls).toEqual([]);
});

test('check-up honeypot', async ({ page }) => {
  await gotoHome(page);
  const calls = await mockSubscribe(page, 200, {});
  await page.locator('#cu-sito').evaluate((e) => { e.value = 'bot'; });
  await page.locator('#cu-email').fill('test@example.com');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-done')).toBeVisible();
  expect(calls).toEqual([]);
});

test('check-up errore server', async ({ page }) => {
  await gotoHome(page);
  await mockSubscribe(page, 500, { error: 'x' });
  await page.locator('#cu-email').fill('test@example.com');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-error')).toHaveText('x');
  await expect(page.locator('#cu-submit')).toBeEnabled();
  await expect(page.locator('#cu-submit-label')).toHaveText('Fammi vedere');
});

test("contatto è l'unico blocco nero", async ({ page }) => {
  await gotoHome(page);
  expect(await page.locator('#contatto .cta-box').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(10, 10, 10)');
  const dark = await page.evaluate(() => {
    const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g); if (!m || (m[3] !== undefined && +m[3] === 0)) return 1;
      return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
    return Array.from(document.querySelectorAll('section, section *'))
      .filter((e) => !e.closest('#contatto') && !e.closest('.phone') && e.offsetWidth > 300 && e.offsetHeight > 150)
      .filter((e) => lum(getComputedStyle(e).backgroundColor) < 0.2)
      .map((e) => e.id || e.className);
  });
  expect(dark).toEqual([]);
});

test('check-up col telefono della demo vera', async ({ page }) => {
  await gotoHome(page);
  const img = page.locator('#check-up .phone img');
  expect(await img.getAttribute('src')).toMatch(/img\/esempio-mobile\.webp$/);
  if (!(await page.locator('#check-up .cu-visual').isVisible())) return; // su telefono il visual è nascosto
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => img.evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
});
