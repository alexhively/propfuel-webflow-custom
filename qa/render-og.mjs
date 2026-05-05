import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputHTML = path.resolve(__dirname, 'og-template.html');
const outputPNG = path.resolve(__dirname, '../og-images/platform-membership-ai.png');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto('file://' + inputHTML, { waitUntil: 'networkidle0' });
// give fonts an extra beat
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outputPNG, type: 'png', omitBackground: false, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log('wrote', outputPNG);
