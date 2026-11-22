import { test, expect } from '@playwright/test';
import { gotoHome, blockWaNavigation, gaEvents, pixelEvents, expectOldTextsIn, squash } from './helpers.mjs';

test('testi invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, 'main', ['.about-name', '.about-stat-label',
    '.compare-feature', '.compare-val-me', '.compare-val', '.cmc-title', '.cmc-val', '.faq-q', '.faq-a',
    '.faq-contact-title', '#contatto .h2', '.cta-sub', '.cta-trust-item', '.cu-legend', '.cu-chip span']);
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

test("check-up chiede il cellulare, non l'email", async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('#cu-email')).toHaveCount(0);
  const tel = page.locator('#cu-tel');
  await expect(tel).toHaveAttribute('type', 'tel');
  await expect(tel).toHaveAttribute('autocomplete', 'tel');
  await expect(page.locator('.cu-sub')).toContainText('Lasciami il numero');
  await expect(page.locator('.cu-done-title')).toHaveText('Fatto. Ti scrivo su WhatsApp a breve.');
});

test('check-up invio', async ({ page }) => {
  await gotoHome(page);
  const calls = await mockSubscribe(page, 200, {});
  await page.locator('#check-up').scrollIntoViewIfNeeded();
  await page.locator('.cu-chip', { hasText: 'Sì, ma è vecchio' }).click();
  await page.locator('#cu-nome').fill('  Mario   Rossi ');
  await page.locator('#cu-tel').fill('340 123 4567');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-done')).toBeVisible();
  expect(calls).toEqual([{ nome: 'Mario Rossi', telefono: '+393401234567', tipo_business: 'serramenti', ha_sito: 'vecchio', source: 'landing-checkup' }]);
  expect(await gaEvents(page, 'checkup_submit')).toEqual([{ tipo_business: 'serramenti', ha_sito: 'vecchio' }]);
  expect(await pixelEvents(page, 'CheckupRequest')).toEqual([{ tipo_business: 'serramenti', ha_sito: 'vecchio' }]);
});

for (const [raw, norm] of [['+39 340-123.4567', '+393401234567'], ['0039 080 1234567', '+390801234567'], ['(080) 123456', '+39080123456']]) {
  test(`check-up numero ${raw}`, async ({ page }) => {
    await gotoHome(page);
    const calls = await mockSubscribe(page, 200, {});
    await page.locator('#cu-nome').fill('Mario');
    await page.locator('#cu-tel').fill(raw);
    await page.locator('#cu-submit').click();
    await expect(page.locator('#cu-done')).toBeVisible();
    expect(calls[0].telefono).toBe(norm);
  });
}

for (const bad of ['12ab', '12345', '+39 12', '340 123 4567 8901 2']) {
  test(`check-up numero sbagliato ${bad}`, async ({ page }) => {
    await gotoHome(page);
    const calls = await mockSubscribe(page, 200, {});
    await page.locator('#cu-nome').fill('Mario');
    await page.locator('#cu-tel').fill(bad);
    await page.locator('#cu-submit').click();
    await expect(page.locator('#cu-error')).toHaveText('Controlla il numero, sembra incompleto.');
    expect(calls).toEqual([]);
  });
}

test('check-up senza nome → errore, niente invio', async ({ page }) => {
  await gotoHome(page);
  const calls = await mockSubscribe(page, 200, {});
  const nome = page.locator('#cu-nome');
  await expect(nome).toHaveAttribute('autocomplete', 'given-name');
  await nome.fill('   ');
  await page.locator('#cu-tel').fill('340 123 4567');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-error')).toHaveText('Scrivi il tuo nome.');
  await expect(nome).toBeFocused();
  expect(calls).toEqual([]);
});

test('check-up honeypot', async ({ page }) => {
  await gotoHome(page);
  const calls = await mockSubscribe(page, 200, {});
  await page.locator('#cu-sito').evaluate((e) => { e.value = 'bot'; });
  await page.locator('#cu-nome').fill('Mario');
  await page.locator('#cu-tel').fill('340 123 4567');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-done')).toBeVisible();
  expect(calls).toEqual([]);
});

test('check-up errore server', async ({ page }) => {
  await gotoHome(page);
  await mockSubscribe(page, 500, { error: 'x' });
  await page.locator('#cu-nome').fill('Mario');
  await page.locator('#cu-tel').fill('340 123 4567');
  await page.locator('#cu-submit').click();
  await expect(page.locator('#cu-error')).toHaveText('x');
  await expect(page.locator('#cu-submit')).toBeEnabled();
  await expect(page.locator('#cu-tel')).toBeEnabled();
  await expect(page.locator('#cu-nome')).toBeEnabled();
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

test('chi sono: ruolo, niente etichetta sulla foto', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('.about-photo-tag')).toHaveCount(0);
  await expect(page.locator('.about-role')).toHaveText('Studente di Ingegneria Informatica · Web Designer');
});

test('su telefono la foto mostra la faccia', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo telefono');
  await gotoHome(page);
  const img = page.locator('.about-photo img');
  expect(await img.evaluate((i) => getComputedStyle(i).objectPosition)).toBe('50% 0%');
  const box = await page.locator('.about-photo').boundingBox();
  expect(Math.abs(box.width / box.height - 4 / 5)).toBeLessThan(0.02);
});

test('chi sono: nuovo testo e ruolo in rosso brand', async ({ page }) => {
  await gotoHome(page);
  const bio = page.locator('.about-bio');
  await expect(bio).toContainText("Lavoro con imprese di infissi e serramenti in Puglia. Gente che monta finestre a regola d'arte, ma online non si vede.");
  await expect(bio).toContainText('Non faccio siti vetrina da guardare: faccio siti che portano richieste di preventivo, dritte sul tuo WhatsApp.');
  await expect(bio).toContainText('Tu pensi al cantiere, al resto penso io: testi, foto, sito e scheda Google. Non devi imparare niente e non devi perdere tempo.');
  await expect(bio).not.toContainText('Ma prima il sito');
  expect(await page.locator('.about-role').evaluate((e) => getComputedStyle(e).color)).toBe('rgb(255, 44, 50)');
});
