import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

export const OLD_HTML = readFileSync(new URL('./fixtures/old-index.html', import.meta.url), 'utf8');
export const WA_BASE_HREF =
  'https://wa.me/393493457558?text=Ciao%20Giacomo%2C%20ho%20un%27impresa%20di%20infissi%20e%20vorrei%20vedere%20gratis%20il%20sito%20che%20mi%20prepari.';

export const squash = (s) => String(s ?? '').replace(/\s+/g, '');

export async function blockExternal(page) {
  await page.route(/googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr|wa\.me/, (r) => r.abort());
}

export async function gotoHome(page, opts = {}) {
  if (opts.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  await blockExternal(page);
  await page.goto('/');
}

export async function blockWaNavigation(page) {
  await page.evaluate(() => {
    document.addEventListener('click', (e) => {
      if (e.target.closest('a[href*="wa.me"]')) e.preventDefault();
    }, true);
  });
}

export async function gaEvents(page, name) {
  return page.evaluate((n) => (window.dataLayer || [])
    .map((a) => Array.from(a))
    .filter((a) => a[0] === 'event' && a[1] === n)
    .map((a) => a[2] ?? {}), name);
}

export async function pixelEvents(page, name) {
  return page.evaluate((n) => ((window.fbq && window.fbq.queue) || [])
    .map((a) => Array.from(a))
    .filter((a) => a[0] === 'trackCustom' && a[1] === n)
    .map((a) => a[2] ?? {}), name);
}

/** Scorre tutta la pagina a passi, per far scattare gli observer. */
export async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
}

let oldPagePromise;
async function oldPage() {
  if (!oldPagePromise) {
    oldPagePromise = (async () => {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.route('**/*', (r) => r.abort());
      await page.setContent(OLD_HTML.replace(/<script[\s\S]*?<\/script>/g, ''), { waitUntil: 'domcontentloaded' });
      return page;
    })();
  }
  return oldPagePromise;
}

/** Testi (senza spazi) degli elementi `selector` nella pagina vecchia. */
export async function oldTexts(selector) {
  const page = await oldPage();
  return page.$$eval(selector, (els) => els.map((e) => e.textContent.replace(/\s+/g, '')));
}

/** Testo (senza spazi) di un elemento nella pagina nuova. */
export async function newText(page, selector) {
  return squash(await page.locator(selector).first().evaluate((e) => e.textContent));
}

export async function expectOldTextsIn(expect, page, containerSel, selectors) {
  const hay = await newText(page, containerSel);
  for (const sel of selectors) {
    const texts = await oldTexts(sel);
    expect(texts.length, `nessun testo vecchio per ${sel}`).toBeGreaterThan(0);
    for (const t of texts) expect(hay, `${sel}: "${t}"`).toContain(t);
  }
}
