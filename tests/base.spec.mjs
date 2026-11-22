import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { gotoHome, blockWaNavigation, gaEvents, pixelEvents, scrollThrough, blockExternal, OLD_HTML } from './helpers.mjs';

const isIgnorableConsole = (t) => /Failed to load resource|net::ERR_FAILED|ERR_BLOCKED/.test(t);

test('nessun errore in console', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !isIgnorableConsole(m.text())) errors.push(m.text()); });
  await gotoHome(page);
  await scrollThrough(page);
  expect(errors).toEqual([]);
});

test('niente scroll orizzontale a 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await gotoHome(page);
  await scrollThrough(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('font nuovi e niente Clash Display', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('link[href*="cdnfonts"]')).toHaveCount(0);
  await expect(page.locator('link[href*="Inter+Tight"]')).toHaveCount(1);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(251, 250, 247)'); // avorio
});

test('head invariato', async ({ page, browser }) => {
  await gotoHome(page);
  const pick = () => {
    const q = (s) => Array.from(document.querySelectorAll(s)).map((e) => e.outerHTML.replace(/\s+/g, ' ').trim());
    return {
      title: document.title,
      metas: q('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]'),
      ld: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => JSON.parse(s.textContent)),
    };
  };
  const now = await page.evaluate(pick);
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const old = await ctx.newPage();
  await old.route('**/*', (r) => r.abort());
  await old.setContent(OLD_HTML);
  const before = await old.evaluate(pick);
  await ctx.close();
  expect(now).toEqual(before);
});

test('nav e sticky tracciati', async ({ page, isMobile }) => {
  await gotoHome(page);
  await blockWaNavigation(page);
  if (isMobile) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('#sticky-wa')).toHaveClass(/show/);
    await page.locator('#sticky-wa a').click();
    expect(await gaEvents(page, 'whatsapp_click')).toEqual([{ button_location: 'sticky' }]);
    expect(await pixelEvents(page, 'WhatsAppClick')).toEqual([{ button_location: 'sticky' }]);
  } else {
    await page.locator('.nav-wa').click();
    expect(await gaEvents(page, 'whatsapp_click')).toEqual([{ button_location: 'nav' }]);
    expect(await pixelEvents(page, 'WhatsAppClick')).toEqual([{ button_location: 'nav' }]);
  }
});

test('senza JS si legge tutto', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await blockExternal(page);
  await page.goto('/');
  const hidden = await page.evaluate(() => Array.from(document.querySelectorAll('section, section *'))
    .filter((e) => getComputedStyle(e).opacity === '0' && e.offsetParent !== null && e.textContent.trim().length > 20)
    .map((e) => e.className || e.tagName));
  await ctx.close();
  expect(hidden).toEqual([]);
});

test('errore JS presto: sezioni visibili e WhatsApp tracciato', async ({ page }) => {
  await page.addInitScript(() => { window.matchMedia = undefined; });
  await gotoHome(page);
  await blockWaNavigation(page);
  await page.waitForTimeout(3200);
  const hidden = await page.$$eval('.reveal', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
  await page.locator('#hero a[href*="wa.me"]').first().dispatchEvent('click');
  expect(await gaEvents(page, 'whatsapp_click')).toEqual([{ button_location: 'hero' }]);
});

test('senza IntersectionObserver la pagina si legge', async ({ page }) => {
  await page.addInitScript(() => { delete window.IntersectionObserver; });
  await gotoHome(page);
  const hidden = await page.$$eval('.reveal', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(hidden).toBe(0);
});

test('file interni esclusi dal deploy', () => {
  const lines = readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8').split(/\r?\n/).map((l) => l.trim());
  for (const f of ['CLAUDE.md', 'tests/', 'docs/', '.superpowers/', 'og-template.html']) expect(lines).toContain(f);
});

test('icona WhatsApp su ogni pulsante WhatsApp', async ({ page }) => {
  await gotoHome(page);
  await expect(page.locator('.wa-dot')).toHaveCount(0);
  const missing = await page.$$eval('a[data-wa]', (as) => as.filter((a) => !a.querySelector('img.wa-mark[src="whatsapp.svg"]')).map((a) => a.textContent.trim()));
  expect(missing).toEqual([]);
});

test("sfondo: griglia nell'hero e nel riquadro finale, barra intonata", async ({ page }) => {
  await gotoHome(page);
  const heroGrid = await page.evaluate(() => getComputedStyle(document.querySelector('#hero'), '::before').backgroundImage);
  expect(heroGrid).toContain('linear-gradient');
  expect(await page.locator('#contatto .cta-box').evaluate((e) => getComputedStyle(e).backgroundImage)).toContain('linear-gradient');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(page.locator('#nav')).toHaveClass(/scrolled/);
  await expect.poll(() => page.locator('#nav').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgba(251, 250, 247, 0.86)');
});
