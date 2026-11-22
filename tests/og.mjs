// Rigenera ../og-image.jpg da ../og-template.html (1200x630, JPEG q90).
// Uso: cd tests && node og.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const server = spawn(process.execPath, ['serve.mjs'], { cwd: new URL('.', import.meta.url), stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/og-template.html');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const out = fileURLToPath(new URL('../og-image.jpg', import.meta.url));
  await page.screenshot({ path: out, type: 'jpeg', quality: 90 });
  console.log(out);
} finally {
  await browser.close();
  server.kill();
}
