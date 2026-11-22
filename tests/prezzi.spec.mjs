import { test, expect } from '@playwright/test';
import { gotoHome, blockWaNavigation, gaEvents, expectOldTextsIn } from './helpers.mjs';

test('testi prezzo invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, '#prezzi', ['#prezzi .h2', '.price-label', '.price-number', '.price-sub',
    '.price-zero-risk-text', '.price-addon-name', '.price-addon-val', '.price-note']);
});

test('testi come funziona invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, '#come-funziona', ['#come-funziona .h2', '.step-time-pill', '.step-title', '.step-desc']);
});

test('prezzo tracciato', async ({ page }) => {
  await gotoHome(page);
  await blockWaNavigation(page);
  await page.locator('.price-cta-btn').scrollIntoViewIfNeeded();
  await page.locator('.price-cta-btn').click();
  expect(await gaEvents(page, 'whatsapp_click')).toEqual([{ button_location: 'pricing' }]);
});

test('calcolatore', async ({ page }) => {
  await gotoHome(page);
  const r = page.locator('#calc-range');
  await expect(r).toHaveAttribute('min', '1000');
  await expect(r).toHaveAttribute('max', '20000');
  await expect(r).toHaveAttribute('step', '500');
  await expect(r).toHaveValue('5000');
  await expect(page.locator('#calc-value')).toHaveText('5.000€');
  await expect(page.locator('#calc-times')).toHaveText('33');
  await r.fill('1000');
  await expect(page.locator('#calc-value')).toHaveText('1.000€');
  await expect(page.locator('#calc-times')).toHaveText('7');
  await r.fill('20000');
  await expect(page.locator('#calc-value')).toHaveText('20.000€');
  await expect(page.locator('#calc-times')).toHaveText('133');
  await expect(page.locator('#prezzi')).toContainText('È un conto, non una promessa.');
  expect(await page.evaluate(() => timesRepaid(5000))).toBe(33);
});

test('timeline come funziona', async ({ page }) => {
  await gotoHome(page);
  await page.locator('#come-funziona .steps').scrollIntoViewIfNeeded();
  await expect(page.locator('#come-funziona .steps')).toHaveClass(/is-in/);
  await expect(page.locator('#come-funziona .step-row')).toHaveCount(3);
  for (const row of await page.locator('#come-funziona .step-row').all()) await expect(row).toBeVisible();
});
