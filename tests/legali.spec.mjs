import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { blockExternal, squash } from './helpers.mjs';

const BASE = '4afc96d';
const repo = new URL('..', import.meta.url);

for (const file of ['privacy.html', 'termini.html']) {
  test(`${file}: testo identico e stile chiaro`, async ({ page, browser }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await blockExternal(page);
    await page.goto('/' + file);
    const now = squash(await page.evaluate(() => document.body.innerText));
    await expect(page.locator('link[href*="cdnfonts"]')).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

    const oldHtml = execFileSync('git', ['show', `${BASE}:${file}`], { cwd: repo, encoding: 'utf8' });
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 } });
    const old = await ctx.newPage();
    await old.route('**/*', (r) => (r.request().url().endsWith('/' + file) ? r.fulfill({ contentType: 'text/html', body: oldHtml }) : r.abort()));
    await old.goto('http://localhost:4173/' + file);
    const before = squash(await old.evaluate(() => document.body.innerText));
    await ctx.close();
    expect(now).toBe(before);
  });
}
