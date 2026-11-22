import { test, expect } from '@playwright/test';
import { gotoHome, expectOldTextsIn } from './helpers.mjs';

test('testi problema invariati', async ({ page }) => {
  await gotoHome(page);
  await expectOldTextsIn(expect, page, '#problema', ['#problema .h2', '.problem-sub', '.pain-title', '.pain-desc']);
});

test('cursore da tastiera', async ({ page }) => {
  await gotoHome(page);
  const range = page.locator('#ba-range');
  await expect(range).toHaveAttribute('aria-label', 'Confronta prima e dopo');
  await expect(range).toHaveValue('50');
  await range.focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await expect(range).toHaveValue('55');
  expect(await page.locator('.ba').evaluate((e) => e.style.getPropertyValue('--pos').trim())).toBe('55%');
});

test('cursore col dito', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo touch');
  await gotoHome(page);
  const ba = page.locator('.ba');
  await ba.scrollIntoViewIfNeeded();
  expect(await ba.evaluate((e) => getComputedStyle(e).touchAction)).toContain('pan-y');
  const box = await ba.boundingBox();
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, x) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await touch('touchStart', box.x + box.width * 0.5);
  for (let i = 1; i <= 6; i++) await touch('touchMove', box.x + box.width * (0.5 - i * 0.05));
  await touch('touchEnd');
  expect(Number(await page.locator('#ba-range').inputValue())).toBeLessThan(40);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('didascalie', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('.ba-cap', { hasText: 'Prima' })).toHaveCount(1);
  await expect(page.locator('.ba-cap', { hasText: 'Dopo' })).toHaveCount(1);
});

test('prima/dopo con siti veri', async ({ page }) => {
  await gotoHome(page);
  await page.locator('#ba').scrollIntoViewIfNeeded();
  const old = page.locator('.ba-old img');
  const neu = page.locator('.ba-new img');
  expect(await old.getAttribute('src')).toMatch(/img\/prima-mobile\.webp$/);
  expect(await neu.getAttribute('src')).toMatch(/img\/esempio-mobile\.webp$/);
  await expect.poll(() => old.evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => neu.evaluate((i) => i.naturalWidth)).toBeGreaterThan(0);
});

test('niente più mini-siti disegnati', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('.mini-logo, .mini-win, .old-head, .old-marquee')).toHaveCount(0);
});
