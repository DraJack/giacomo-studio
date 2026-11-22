// Fotografa la demo /esempio/ e il vecchio sito (fixtures/prima-sito.html) per la landing.
// Uso: cd tests && node shots.mjs   →   ../img/esempio-mobile.webp, esempio-desktop.webp, prima-mobile.webp
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = 'http://localhost:4173';
const OUT = fileURLToPath(new URL('../img/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ['serve.mjs'], { cwd: new URL('.', import.meta.url), stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch();

/** PNG → WebP (larghezza massima `width`, qualità `q`) tramite canvas di Chromium. */
async function toWebp(png, name, width, q = 0.72) {
  const page = await browser.newPage();
  const url = await page.evaluate(async ({ b64, width, q }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const w = Math.min(width, img.naturalWidth), h = Math.round(img.naturalHeight * w / img.naturalWidth);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
    return { data: c.toDataURL('image/webp', q), w, h };
  }, { b64: png.toString('base64'), width, q });
  await page.close();
  const buf = Buffer.from(url.data.split(',')[1], 'base64');
  writeFileSync(OUT + name, buf);
  console.log(`${name}  ${url.w}x${url.h}  ${Math.round(buf.length / 1024)}KB`);
}

async function esempioPage(viewport, scale, mobile) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  await page.route(/google\.com\/maps/, (r) => r.abort());
  await page.goto(BASE + '/esempio/', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.demo-bar,.mbar,.fwa{display:none!important}*{animation:none!important;transition:none!important}' });
  await page.evaluate(() => {
    document.body.classList.remove('has-demo');
    document.querySelectorAll('.rv').forEach((e) => e.classList.add('vis'));
    document.querySelectorAll('[data-n]').forEach((e) => { e.textContent = e.dataset.n + ('plus' in e.dataset ? '+' : ''); });
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return { ctx, page };
}

try {
  // 1. Home della demo vista da telefono: le prime ~4 schermate, per il telefono scorrevole.
  {
    const { ctx, page } = await esempioPage({ width: 390, height: 844 }, 1.5, true);
    const h = Math.min(3400, await page.evaluate(() => document.documentElement.scrollHeight));
    const png = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width: 390, height: h } });
    await toWebp(png, 'esempio-mobile.webp', 585, 0.7);
    await ctx.close();
  }
  // 2. Prima schermata della demo su computer, per il browser finto del pacchetto.
  {
    const { ctx, page } = await esempioPage({ width: 1280, height: 800 }, 1, false);
    await toWebp(await page.screenshot(), 'esempio-desktop.webp', 1000, 0.74);
    await ctx.close();
  }
  // 3. Il vecchio sito visto da telefono (layout fisso, tutto rimpicciolito).
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE + '/tests/fixtures/prima-sito.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await toWebp(await page.screenshot(), 'prima-mobile.webp', 585, 0.7);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
