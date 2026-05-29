import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = 'file://' + join(__dirname, 'og-mmct-session.html');
const outPath = join(__dirname, '..', 'og-images', 'mmct-session.png');

const browser = await puppeteer.launch({
  defaultViewport: { width: 1200, height: 630, deviceScaleFactor: 2 }
});
const page = await browser.newPage();
await page.goto(htmlPath, { waitUntil: 'networkidle0' });
// Give web fonts a moment to fully apply
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outPath, type: 'png', omitBackground: false, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('Wrote', outPath);
