#!/usr/bin/env node
// PropFuel QA gate. Tests what's being pushed: the staging site loads this repo's files from the
// working tree (instead of GitHub Pages = live main), and each check compares against live main.
//
//   Brand:  blocks only on violations this push ADDS. Ones already live are listed, not blocking.
//   Visual: before/after diff of the push. Advisory: it reports visible changes but doesn't block,
//           unless QA_VISUAL_STRICT=1.
//   Scope:  the pre-push hook passes the pushed files in QA_CHANGED_FILES. If none of them can
//           change how pages render (js/, css/, images/), the checks are skipped.
//           Run by hand (no QA_CHANGED_FILES), everything runs.
import { runVisualComparison, MIN_SIMILARITY } from './compare.mjs';
import { runBrandCheck } from './brand-check.mjs';

const RENDERS = /^(js|css|images)\//;

function changedFiles() {
  if (process.env.QA_CHANGED_FILES === undefined) return null;
  return process.env.QA_CHANGED_FILES.split('\n').map(s => s.trim()).filter(Boolean);
}

// Violations in the push run that the live run doesn't have, per blocking (FAIL-level) pass.
function newBrandViolations(live, push) {
  const out = [];
  for (const p of push.passes) {
    const before = new Set((live.passes.find(l => l.name === p.name) || { all: [] }).all);
    const added = p.all.filter(v => !before.has(v));
    out.push({ name: p.name, blocking: p.status === 'FAIL', added, existing: p.all.length - added.length });
  }
  return out;
}

async function main() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║     PropFuel QA Suite                 ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const changed = changedFiles();
  if (changed) {
    const rendering = changed.filter(f => RENDERS.test(f));
    console.log(`Files in this push: ${changed.length} (${rendering.length} that can change rendering)`);
    if (rendering.length === 0) {
      console.log('Nothing in this push changes how pages render (js/, css/, images/). Skipping brand + visual checks.');
      console.log('\nOVERALL: ✓ ALL CLEAR (skipped: no rendering changes)');
      return 0;
    }
    rendering.slice(0, 15).forEach(f => console.log('  ' + f));
    console.log('');
  }

  // Brand: live main vs this push
  console.log('── Brand Compliance: live main ──\n');
  const brandLive = await runBrandCheck({ side: 'main' });
  console.log('\n── Brand Compliance: this push ──\n');
  const brandPush = await runBrandCheck({ side: 'push' });
  const brandDiff = newBrandViolations(brandLive, brandPush);
  const brandBlocking = brandDiff.filter(d => d.blocking && d.added.length > 0);

  // Visual: before/after of this push
  console.log('\n── Visual: live main vs this push ──\n');
  const visual = await runVisualComparison();
  const errors = visual.comparisons.filter(c => c.error);
  const changedPages = visual.comparisons.filter(c => !c.error && c.similarity < MIN_SIMILARITY);
  const visualStrict = process.env.QA_VISUAL_STRICT === '1';

  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║     RESULTS                           ║');
  console.log('╚═══════════════════════════════════════╝');

  console.log(`\nBrand (blocks on violations this push adds):`);
  for (const d of brandDiff) {
    const tag = d.added.length === 0 ? '✓' : d.blocking ? '✗' : '!';
    console.log(`  ${tag} ${d.name}: ${d.added.length} new, ${d.existing} already live`);
    d.added.slice(0, 10).forEach(v => console.log(`      + ${v}`));
  }

  console.log(`\nVisual (${visualStrict ? 'blocking' : 'advisory'}; flags pages below ${MIN_SIMILARITY}% vs live):`);
  if (changedPages.length === 0) console.log('  ✓ No visible changes on the checked pages');
  changedPages.forEach(c => console.log(`  ! ${c.page}-${c.viewport}: ${c.similarity}% (check this change is intended)`));
  errors.forEach(c => console.log(`  ✗ ${c.page}-${c.viewport}: capture failed: ${c.error}`));

  console.log(`\nReports:`);
  console.log(`  Brand:  file://${brandPush.reportPath}`);
  console.log(`  Visual: file://${visual.reportPath}`);

  // Capture errors are environment problems (network, browser); they block so a broken run never passes silently.
  const fail = brandBlocking.length > 0 || errors.length > 0 || (visualStrict && changedPages.length > 0);
  console.log(`\nOVERALL: ${fail ? '✗ ISSUES FOUND' : '✓ ALL CLEAR'}${!fail && changedPages.length ? ' (visual changes flagged above)' : ''}`);
  return fail ? 1 : 0;
}

main().then(code => process.exit(code)).catch(err => {
  console.error(err);
  process.exit(1);
});
