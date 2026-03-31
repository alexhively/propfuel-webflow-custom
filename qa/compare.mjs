#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { launchBrowser, captureFullPage } from './lib/screenshot.mjs';
import { generateVisualReport } from './lib/report.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, 'reports');

const ORIGINAL = 'https://propfuel-hero-v2-deploy.vercel.app';
const WEBFLOW  = 'https://propfuel-v2.webflow.io';

const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'Platform', path: '/platform/overview' },
  { name: 'Renewals', path: '/use-cases/renewals' },
  { name: 'Demo',     path: '/demo' },
];

const VIEWPORTS = ['desktop', 'tablet', 'mobile'];
const THRESHOLD = 0.15; // pixelmatch threshold

export async function runVisualComparison() {
  mkdirSync(REPORTS_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await launchBrowser();
  const comparisons = [];

  for (const page of PAGES) {
    for (const viewport of VIEWPORTS) {
      const label = `${page.name}-${viewport}`;
      console.log(`  Capturing ${label}...`);

      try {
        // Capture both sites
        const [origBuf, wfBuf] = await Promise.all([
          captureFullPage(browser, ORIGINAL + page.path, viewport),
          captureFullPage(browser, WEBFLOW + page.path, viewport),
        ]);

        // Decode PNGs
        const origPng = PNG.sync.read(origBuf);
        const wfPng = PNG.sync.read(wfBuf);

        // Normalize dimensions (pad shorter to match taller)
        const width = Math.max(origPng.width, wfPng.width);
        const height = Math.max(origPng.height, wfPng.height);

        const img1 = padImage(origPng, width, height);
        const img2 = padImage(wfPng, width, height);
        const diff = new PNG({ width, height });

        const mismatchCount = pixelmatch(
          img1.data, img2.data, diff.data,
          width, height,
          { threshold: THRESHOLD, alpha: 0.3, diffColor: [255, 60, 40] }
        );

        const totalPixels = width * height;
        const similarity = ((1 - mismatchCount / totalPixels) * 100).toFixed(2);

        // Save images
        const origFile = `${label}-original.png`;
        const wfFile = `${label}-webflow.png`;
        const diffFile = `${label}-diff.png`;

        writeFileSync(path.join(REPORTS_DIR, origFile), PNG.sync.write(img1));
        writeFileSync(path.join(REPORTS_DIR, wfFile), PNG.sync.write(img2));
        writeFileSync(path.join(REPORTS_DIR, diffFile), PNG.sync.write(diff));

        console.log(`    ${label}: ${similarity}% match`);

        comparisons.push({
          page: page.name,
          viewport,
          similarity: parseFloat(similarity),
          originalFile: origFile,
          webflowFile: wfFile,
          diffFile: diffFile,
        });
      } catch (err) {
        console.error(`    ERROR on ${label}: ${err.message}`);
        comparisons.push({
          page: page.name,
          viewport,
          similarity: 0,
          originalFile: '',
          webflowFile: '',
          diffFile: '',
        });
      }
    }
  }

  await browser.close();

  const reportPath = generateVisualReport(comparisons, REPORTS_DIR);
  console.log(`\nVisual report: file://${reportPath}`);

  return { comparisons, reportPath };
}

// Pad a PNG to target dimensions with page background color
function padImage(png, targetWidth, targetHeight) {
  if (png.width === targetWidth && png.height === targetHeight) return png;

  const padded = new PNG({ width: targetWidth, height: targetHeight });
  // Fill with page-bg color (#F4F1EA)
  for (let i = 0; i < padded.data.length; i += 4) {
    padded.data[i]     = 244;
    padded.data[i + 1] = 241;
    padded.data[i + 2] = 234;
    padded.data[i + 3] = 255;
  }
  // Copy original pixels
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const srcIdx = (y * png.width + x) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      padded.data[dstIdx]     = png.data[srcIdx];
      padded.data[dstIdx + 1] = png.data[srcIdx + 1];
      padded.data[dstIdx + 2] = png.data[srcIdx + 2];
      padded.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return padded;
}

// Run directly if called as script
if (process.argv[1] && process.argv[1].endsWith('compare.mjs')) {
  runVisualComparison().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
