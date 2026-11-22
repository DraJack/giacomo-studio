import { test, expect } from '@playwright/test';
import { gotoHome, expectOldTextsIn } from './helpers.mjs';

test('testi pacchetto invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, '#pacchetto',
    ['#pacchetto .h2', '.pkg-label', '.pkg-title', '.pkg-desc', '#pacchetto .checklist li', '.pkg-pill']);
});

test('preventivo guidato', async ({ page }) => {
  const opened = [];
  page.context().on('page', (p) => opened.push(p));
  const waReq = [];
  page.on('request', (r) => { if (r.url().includes('wa.me')) waReq.push(r.url()); });
  await gotoHome(page);
  const q = page.locator('#quote');
  await q.scrollIntoViewIfNeeded();
  await expect(q.locator('.quote-q')).toHaveText('Cosa ti serve?');
  await expect(q.locator('.quote-opt')).toHaveText(['Finestre', 'Porte', 'Persiane', 'Zanzariere']);
  await q.getByRole('button', { name: 'Finestre', exact: true }).click();
  await expect(q.locator('.quote-q')).toHaveText('Che materiale?');
  await expect(q.locator('.quote-opt')).toHaveText(['PVC', 'Alluminio', 'Legno-alluminio']);
  await q.getByRole('button', { name: 'PVC', exact: true }).click();
  await expect(q.locator('.quote-q')).toHaveText('Quanti pezzi?');
  await expect(q.locator('.quote-opt')).toHaveText(['1–2', '3–5', '6–10', 'Più di 10']);
  await q.getByRole('button', { name: '3–5', exact: true }).click();
  await expect(q.locator('.quote-q')).toHaveText('Dove?');
  await expect(q.locator('.quote-opt')).toHaveText(['Nel mio comune', 'In un comune vicino']);
  await q.getByRole('button', { name: 'Nel mio comune', exact: true }).click();
  const expected = 'Ciao! Vorrei un preventivo.\nCosa: Finestre\nMateriale: PVC\nQuanti: 3–5 pezzi\nDove: nel mio comune';
  await expect(q.locator('.quote-bubble')).toBeVisible();
  expect((await q.locator('.quote-bubble-text').innerText()).trim()).toBe(expected);
  expect(await page.evaluate(() => quoteMessage(['Finestre', 'PVC', '3–5', 'Nel mio comune']))).toBe(expected);
  expect(await page.evaluate(() => quoteMessage(['Porte', 'Alluminio', 'Più di 10', 'In un comune vicino'])))
    .toBe('Ciao! Vorrei un preventivo.\nCosa: Porte\nMateriale: Alluminio\nQuanti: più di 10 pezzi\nDove: in un comune vicino');
  expect(opened).toEqual([]);
  expect(waReq).toEqual([]);
  await q.getByRole('button', { name: 'Ricomincia' }).click();
  await expect(q.locator('.quote-q')).toHaveText('Cosa ti serve?');
});

test('ricerca Google simulata', async ({ page }) => {
  await gotoHome(page);
  await page.locator('.serp').scrollIntoViewIfNeeded();
  await expect(page.locator('.serp-query')).toHaveText('infissi vicino a me', { timeout: 4000 });
  await expect(page.locator('.serp-row').first().locator('.serp-name')).toHaveText('La tua impresa');
});


test('riduci movimento', async ({ page }) => {
  await gotoHome(page, { reducedMotion: true });
  await expect(page.locator('.serp-query')).toHaveText('infissi vicino a me');
  expect(await page.locator('#pacchetto .timeline').evaluate((e) => getComputedStyle(e).getPropertyValue('--fill').trim())).toBe('1');
  const animated = await page.$$eval('#pacchetto *', (els) => els.filter((e) => getComputedStyle(e).animationName !== 'none').length);
  expect(animated).toBe(0);
});

test('garanzia verde', async ({ page }) => {
  await gotoHome(page);
  const card = page.locator('.pkg-card').nth(4);
  await expect(card).toHaveClass(/pkg-card--green/);
  expect(await card.evaluate((e) => getComputedStyle(e).getPropertyValue('--accent').trim())).toBe('#25d366');
});
