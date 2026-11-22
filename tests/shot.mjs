// Screenshot rapido: node shot.mjs <out-dir> [selector] [width,...]
// Serve la pagina con serve.mjs già in ascolto su :4173 (lo avvia se serve).
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const [out = '.', selector = '', widths = '375,1280', full = ''] = process.argv.slice(2);
const server = spawn(process.execPath, ['serve.mjs'], { cwd: new URL('.', import.meta.url), stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch();
try {
  for (const w of widths.split(',').map(Number)) {
    const page = await browser.newPage({ viewport: { width: w, height: w < 700 ? 812 : 860 }, deviceScaleFactor: w < 700 ? 2 : 1 });
    await page.route(/googletagmanager|facebook|wa\.me/, (r) => r.abort());
    await page.goto('http://localhost:4173/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1600);
    const name = `${out}/${(selector || 'page').replace(/[^a-z0-9-]/gi, '')}-${w}.png`;
    if (selector) await page.locator(selector).screenshot({ path: name, animations: 'disabled' });
    else await page.screenshot({ path: name, fullPage: !!full, animations: 'disabled' });
    console.log(name);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
