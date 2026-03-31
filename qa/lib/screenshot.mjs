import puppeteer from 'puppeteer';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  tablet:  { width: 768,  height: 1024, deviceScaleFactor: 1 },
  mobile:  { width: 375,  height: 812, deviceScaleFactor: 1 },
};

const PRNG_SEED = 12345;

// Mulberry32 seeded PRNG — injected to make canvas textures deterministic
const PRNG_INJECT = `
  (function(seed) {
    var t = seed | 0;
    Math.random = function() {
      t = (t + 0x6D2B79F5) | 0;
      var v = Math.imul(t ^ (t >>> 15), 1 | t);
      v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    };
  })(${PRNG_SEED});
`;

export async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

export async function captureFullPage(browser, url, viewport = 'desktop') {
  const vp = VIEWPORTS[viewport];
  if (!vp) throw new Error('Unknown viewport: ' + viewport);

  const page = await browser.newPage();
  await page.setViewport(vp);

  // Seed Math.random for deterministic textures
  await page.evaluateOnNewDocument(PRNG_INJECT);

  // Hide Webflow badge
  await page.evaluateOnNewDocument(() => {
    var style = document.createElement('style');
    style.textContent = '.w-webflow-badge{display:none!important}';
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(style);
    });
  });

  // Navigate
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts
  await page.evaluate(() => document.fonts.ready);

  // Scroll to bottom to trigger all IntersectionObserver animations
  await page.evaluate(async () => {
    await new Promise(resolve => {
      var total = document.body.scrollHeight;
      var step = window.innerHeight;
      var current = 0;
      var timer = setInterval(function() {
        current += step;
        window.scrollTo(0, current);
        if (current >= total) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // Wait for animations to settle
  await new Promise(r => setTimeout(r, 2000));

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));

  // Full page screenshot (cap height to prevent memory errors on long pages)
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  const maxHeight = 8000; // Cap at 8000px to prevent protocol errors
  const clipHeight = Math.min(pageHeight, maxHeight * vp.deviceScaleFactor);
  const buffer = await page.screenshot({
    fullPage: pageHeight <= maxHeight,
    clip: pageHeight > maxHeight ? { x: 0, y: 0, width: vp.width * vp.deviceScaleFactor, height: clipHeight } : undefined,
    type: 'png'
  });
  await page.close();
  return buffer;
}

export { VIEWPORTS };
