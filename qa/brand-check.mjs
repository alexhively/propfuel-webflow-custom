#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import { launchBrowser } from './lib/screenshot.mjs';
import { parseRgb, isCoolTone, isPureWhite, isPureBlack, isApprovedColor } from './lib/palette.mjs';
import { generateBrandReport } from './lib/report.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = path.join(__dirname, 'reports');
const SITE_URL = 'https://propfuel-v2.webflow.io';

export async function runBrandCheck() {
  mkdirSync(REPORTS_DIR, { recursive: true });

  console.log('Launching browser for brand check...');
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(SITE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  const passes = [];

  // ── PASS 1: COLOR ──
  console.log('  Pass 1: Color...');
  const colorViolations = [];
  const allColors = await page.evaluate(() => {
    var props = ['color', 'backgroundColor', 'borderColor'];
    var results = [];
    document.querySelectorAll('*').forEach(function(el) {
      // Skip hidden elements
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
      // Skip Webflow badge
      if (el.closest('.w-webflow-badge')) return;
      var cs = getComputedStyle(el);
      props.forEach(function(prop) {
        var val = cs[prop];
        if (val && val !== 'rgba(0, 0, 0, 0)' && val !== 'transparent') {
          results.push({
            prop: prop,
            value: val,
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 60)
          });
        }
      });
    });
    return results;
  });

  for (const c of allColors) {
    const rgb = parseRgb(c.value);
    if (!rgb) continue;
    const [r, g, b] = rgb;

    // Skip near-transparent
    const alphaMatch = c.value.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
    if (alphaMatch && parseFloat(alphaMatch[1]) < 0.05) continue;

    if (isPureWhite(r, g, b)) {
      // Allow white text on buttons (expected)
      if (c.prop === 'color' && (c.cls.includes('btn-primary') || c.cls.includes('btn-nav'))) continue;
      colorViolations.push(`Pure white (#FFFFFF) found: ${c.tag}.${c.cls} [${c.prop}]`);
    }
    if (isPureBlack(r, g, b)) {
      colorViolations.push(`Pure black (#000000) found: ${c.tag}.${c.cls} [${c.prop}]`);
    }
    if (isCoolTone(r, g, b)) {
      colorViolations.push(`Cool tone (${c.value}) found: ${c.tag}.${c.cls} [${c.prop}]`);
    }
  }
  passes.push({
    name: 'PASS 1: COLOR',
    status: colorViolations.length > 0 ? 'FAIL' : 'PASS',
    violations: colorViolations.slice(0, 20), // Cap at 20
  });

  // ── PASS 2: GRADIENT ──
  console.log('  Pass 2: Gradient...');
  const gradientViolations = [];
  const gradients = await page.evaluate(() => {
    var results = [];
    document.querySelectorAll('.pf-btn-primary').forEach(function(el) {
      var after = getComputedStyle(el, '::after');
      results.push({
        cls: el.className,
        bgImage: after ? after.backgroundImage : 'none',
      });
    });
    // Nav button uses background-image directly (not ::after) — check that instead
    document.querySelectorAll('.pf-btn-nav').forEach(function(el) {
      var bg = getComputedStyle(el).backgroundImage;
      results.push({
        cls: el.className,
        bgImage: bg || 'none',
      });
    });
    return results;
  });

  for (const g of gradients) {
    if (g.bgImage === 'none' || !g.bgImage.includes('gradient')) {
      gradientViolations.push(`Missing gradient on ${g.cls}`);
    }
    // Check direction (should be "to right")
    if (g.bgImage.includes('gradient') && !g.bgImage.includes('to right') && !g.bgImage.includes('90deg')) {
      gradientViolations.push(`Wrong gradient direction on ${g.cls}: ${g.bgImage.slice(0, 80)}`);
    }
  }
  passes.push({
    name: 'PASS 2: GRADIENT',
    status: gradientViolations.length > 0 ? 'WARN' : 'PASS',
    violations: gradientViolations,
  });

  // ── PASS 3: TEXTURE ──
  console.log('  Pass 3: Texture...');
  const textureViolations = [];
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);

  if (!bodyBg || bodyBg === 'none' || !bodyBg.includes('url(')) {
    textureViolations.push('Body has no background texture (expected canvas-generated data URI)');
  }

  const cardTextures = await page.evaluate(() => {
    var cards = document.querySelectorAll('.pf-card, .pf-demo-form-card, .pf-feature-visual');
    return Array.from(cards).map(function(card) {
      var before = getComputedStyle(card, '::before');
      return {
        cls: (card.className || '').toString().slice(0, 60),
        content: before.content,
        blendMode: before.mixBlendMode,
        opacity: before.opacity,
        bgImage: before.backgroundImage,
      };
    });
  });

  for (const ct of cardTextures) {
    if (!ct.bgImage || ct.bgImage === 'none') {
      textureViolations.push(`Card missing ::before texture: ${ct.cls}`);
    }
    if (ct.blendMode !== 'multiply') {
      textureViolations.push(`Card wrong blend mode (${ct.blendMode}, expected multiply): ${ct.cls}`);
    }
  }
  passes.push({
    name: 'PASS 3: TEXTURE',
    status: textureViolations.length > 0 ? 'FAIL' : 'PASS',
    violations: textureViolations,
  });

  // ── PASS 4: TYPOGRAPHY ──
  console.log('  Pass 4: Typography...');
  const typographyViolations = [];
  const fontCheck = await page.evaluate(() => {
    var violations = [];
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span, button, li, label, input, textarea').forEach(function(el) {
      if (el.closest('.w-webflow-badge')) return;
      if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
      var font = getComputedStyle(el).fontFamily;
      if (!font.toLowerCase().includes('dm sans')) {
        violations.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 40),
          font: font.slice(0, 60),
          text: (el.textContent || '').trim().slice(0, 30),
        });
      }
    });
    return violations;
  });

  for (const v of fontCheck) {
    if (!v.text) continue; // Skip empty elements
    typographyViolations.push(`Wrong font on ${v.tag}.${v.cls}: "${v.font}" (text: "${v.text}")`);
  }
  passes.push({
    name: 'PASS 4: TYPOGRAPHY',
    status: typographyViolations.length > 0 ? 'FAIL' : 'PASS',
    violations: typographyViolations.slice(0, 20),
  });

  // ── PASS 5: LAYOUT ──
  console.log('  Pass 5: Layout...');
  const layoutViolations = [];
  const layoutCheck = await page.evaluate(() => {
    var violations = [];
    // Check for sharp corners on interactive elements
    document.querySelectorAll('.pf-card, [class*="pf-btn"], [class*="input"]').forEach(function(el) {
      var radius = getComputedStyle(el).borderRadius;
      if (radius === '0px') {
        violations.push({ type: 'sharp-corner', cls: (el.className || '').toString().slice(0, 60) });
      }
    });
    return violations;
  });

  for (const v of layoutCheck) {
    layoutViolations.push(`Sharp corner (border-radius: 0) on ${v.cls}`);
  }
  passes.push({
    name: 'PASS 5: LAYOUT',
    status: layoutViolations.length > 0 ? 'WARN' : 'PASS',
    violations: layoutViolations,
  });

  // ── PASS 6: COMPONENTS ──
  console.log('  Pass 6: Components...');
  const componentViolations = [];
  const btnCheck = await page.evaluate(() => {
    var results = [];
    document.querySelectorAll('.pf-btn-primary').forEach(function(btn) {
      var cs = getComputedStyle(btn);
      results.push({
        type: 'primary',
        borderRadius: cs.borderRadius,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
      });
    });
    document.querySelectorAll('.pf-btn-secondary').forEach(function(btn) {
      var cs = getComputedStyle(btn);
      results.push({
        type: 'secondary',
        borderRadius: cs.borderRadius,
        color: cs.color,
      });
    });
    return results;
  });

  for (const btn of btnCheck) {
    // Check pill shape
    var radius = parseInt(btn.borderRadius);
    if (radius < 50) {
      componentViolations.push(`${btn.type} button not pill-shaped (radius: ${btn.borderRadius})`);
    }
    // Check secondary button color
    if (btn.type === 'secondary') {
      var rgb = parseRgb(btn.color);
      if (rgb && !(Math.abs(rgb[0] - 244) < 15 && Math.abs(rgb[1] - 124) < 15 && Math.abs(rgb[2] - 44) < 15)) {
        componentViolations.push(`Secondary button wrong text color: ${btn.color} (expected ~#F47C2C)`);
      }
    }
  }
  passes.push({
    name: 'PASS 6: COMPONENTS',
    status: componentViolations.length > 0 ? 'FAIL' : 'PASS',
    violations: componentViolations,
  });

  await browser.close();

  // Report
  const reportPath = generateBrandReport(passes, REPORTS_DIR);
  console.log(`\nBrand report: file://${reportPath}`);

  const overallPass = passes.every(p => p.status !== 'FAIL');
  console.log(`\nOverall: ${overallPass ? 'PASS' : 'FAIL'}`);
  passes.forEach(p => console.log(`  ${p.name}: ${p.status} (${p.violations.length} issues)`));

  return { passes, reportPath, overallPass };
}

// Run directly
if (process.argv[1] && process.argv[1].endsWith('brand-check.mjs')) {
  runBrandCheck().then(result => {
    process.exit(result.overallPass ? 0 : 1);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
