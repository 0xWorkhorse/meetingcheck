/**
 * Simple test runner that prints a full report. Useful in CI logs.
 * Run with: npx tsx tests/run.ts
 */
import { check, format } from '../src/index.js';
import { cases } from './corpus.js';

let passed = 0;
let failed = 0;

for (const tc of cases) {
  const result = check(tc.url);
  const ok = result.verdict === tc.expected;
  if (ok) {
    passed++;
  } else {
    failed++;
    const formatted = format(result);
    console.log(`FAIL: ${tc.url}`);
    console.log(`  expected: ${tc.expected}`);
    console.log(`  got:      ${result.verdict}`);
    console.log(`  titleKey: ${result.titleKey}`);
    console.log(`  reason:   ${formatted.reason}`);
    if (tc.note) console.log(`  note:     ${tc.note}`);
  }
}

console.log(`\n${passed}/${cases.length} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
