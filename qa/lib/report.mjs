import { writeFileSync } from 'fs';
import path from 'path';

export function generateVisualReport(comparisons, outputDir) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const allPass = comparisons.every(c => c.similarity >= 95);

  let rows = comparisons.map(c => {
    const status = c.similarity >= 95 ? 'pass' : 'fail';
    return `
      <div class="comparison">
        <div class="comp-header">
          <h2>${c.page} — ${c.viewport}</h2>
          <div class="similarity ${status}">${c.similarity}%</div>
        </div>
        <div class="images">
          <div><div class="label">Original</div><img src="${c.originalFile}" loading="lazy"></div>
          <div><div class="label">Webflow</div><img src="${c.webflowFile}" loading="lazy"></div>
          <div><div class="label">Diff</div><img src="${c.diffFile}" loading="lazy"></div>
        </div>
      </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>PropFuel Visual QA — ${timestamp}</title>
<style>
  body{font-family:'DM Sans',system-ui,sans-serif;background:#F4F1EA;color:#2F2F2F;max-width:1400px;margin:0 auto;padding:40px}
  h1{font-size:32px;font-weight:800;margin-bottom:8px}
  .meta{color:#6E6E6E;font-size:14px;margin-bottom:40px}
  .overall{font-size:20px;font-weight:700;margin-bottom:32px;padding:16px 24px;border-radius:12px}
  .overall.pass{background:#E8F5E9;color:#2E7D32}
  .overall.fail{background:#FFEBEE;color:#C62828}
  .comparison{margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid #E3DDD2}
  .comp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
  .comp-header h2{font-size:20px;font-weight:600;margin:0}
  .similarity{font-size:36px;font-weight:800}
  .similarity.pass{color:#7D9B4E}
  .similarity.fail{color:#C0392B}
  .images{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
  .images img{width:100%;border-radius:8px;border:1px solid #E3DDD2;max-height:600px;object-fit:cover;object-position:top}
  .label{font-size:11px;font-weight:700;color:#6E6E6E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px}
</style></head><body>
  <h1>Visual QA Report</h1>
  <p class="meta">Generated: ${timestamp} | Original: propfuel-hero-v2-deploy.vercel.app | Webflow: propfuel-v2.webflow.io</p>
  <div class="overall ${allPass ? 'pass' : 'fail'}">${allPass ? 'ALL PAGES PASS (≥95% similarity)' : 'SOME PAGES BELOW 95% THRESHOLD'}</div>
  ${rows}
</body></html>`;

  const outPath = path.join(outputDir, 'visual-report.html');
  writeFileSync(outPath, html);
  return outPath;
}

export function generateBrandReport(passes, outputDir) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const allPass = passes.every(p => p.status !== 'FAIL');

  let rows = passes.map(p => {
    const statusClass = p.status === 'PASS' ? 'pass' : p.status === 'WARN' ? 'warn' : 'fail';
    const violationHtml = p.violations.length > 0
      ? '<ul class="violations">' + p.violations.map(v => `<li>${v}</li>`).join('') + '</ul>'
      : '';
    return `
      <div class="pass-row">
        <div class="pass-header">
          <span class="pass-name">${p.name}</span>
          <span class="pass-status ${statusClass}">${p.status} (${p.violations.length} issues)</span>
        </div>
        ${violationHtml}
      </div>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>PropFuel Brand QA — ${timestamp}</title>
<style>
  body{font-family:'DM Sans',system-ui,sans-serif;background:#F4F1EA;color:#2F2F2F;max-width:900px;margin:0 auto;padding:40px}
  h1{font-size:32px;font-weight:800;margin-bottom:8px}
  .meta{color:#6E6E6E;font-size:14px;margin-bottom:40px}
  .overall{font-size:20px;font-weight:700;margin-bottom:32px;padding:16px 24px;border-radius:12px}
  .overall.pass{background:#E8F5E9;color:#2E7D32}
  .overall.fail{background:#FFEBEE;color:#C62828}
  .pass-row{padding:20px 0;border-bottom:1px solid #E3DDD2}
  .pass-header{display:flex;justify-content:space-between;align-items:center}
  .pass-name{font-size:16px;font-weight:700}
  .pass-status{font-size:14px;font-weight:600;padding:4px 12px;border-radius:100px}
  .pass-status.pass{background:#E8F5E9;color:#2E7D32}
  .pass-status.warn{background:#FFF3E0;color:#E65100}
  .pass-status.fail{background:#FFEBEE;color:#C62828}
  .violations{margin-top:12px;padding-left:20px;font-size:13px;color:#6E6E6E;line-height:1.8}
  .violations li{margin-bottom:4px}
</style></head><body>
  <h1>Brand Compliance Report</h1>
  <p class="meta">Generated: ${timestamp} | Site: propfuel-v2.webflow.io</p>
  <div class="overall ${allPass ? 'pass' : 'fail'}">${allPass ? 'ALL PASSES CLEAR' : 'BRAND VIOLATIONS DETECTED'}</div>
  ${rows}
</body></html>`;

  const outPath = path.join(outputDir, 'brand-report.html');
  writeFileSync(outPath, html);
  return outPath;
}
