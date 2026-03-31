#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import { runVisualComparison } from './compare.mjs';
import { runBrandCheck } from './brand-check.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║     PropFuel QA Suite                 ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // Run brand check first (faster)
  console.log('── Brand Compliance Check ──\n');
  const brandResult = await runBrandCheck();

  // Run visual comparison
  console.log('\n── Visual Comparison ──\n');
  const visualResult = await runVisualComparison();

  // Summary
  const visualPass = visualResult.comparisons.every(c => c.similarity >= 95);

  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║     RESULTS                           ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log(`║  Brand:  ${brandResult.overallPass ? '✓ PASS' : '✗ FAIL'}                          ║`);
  console.log(`║  Visual: ${visualPass ? '✓ PASS' : '✗ FAIL'}                          ║`);
  console.log('╠═══════════════════════════════════════╣');

  if (brandResult.overallPass && visualPass) {
    console.log('║  OVERALL: ✓ ALL CLEAR                ║');
    console.log('╚═══════════════════════════════════════╝');
    return 0;
  } else {
    console.log('║  OVERALL: ✗ ISSUES FOUND             ║');
    console.log('╚═══════════════════════════════════════╝');
    console.log(`\nReports:`);
    console.log(`  Brand:  file://${brandResult.reportPath}`);
    console.log(`  Visual: file://${visualResult.reportPath}`);
    return 1;
  }
}

main().then(code => process.exit(code)).catch(err => {
  console.error(err);
  process.exit(1);
});
