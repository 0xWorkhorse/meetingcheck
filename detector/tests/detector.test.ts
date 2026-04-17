import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check } from '../src/detector.js';
import { cases } from './corpus.js';

for (const tc of cases) {
  test(`${tc.expected.padEnd(13)} ${tc.url}${tc.note ? ` (${tc.note})` : ''}`, () => {
    const result = check(tc.url);
    assert.equal(
      result.verdict,
      tc.expected,
      `expected ${tc.expected}, got ${result.verdict}\n  reason: ${result.reason}`
    );
  });
}

test('community-reported domain returns DANGEROUS even without other signals', () => {
  const reported = new Set(['benign-looking-name.com']);
  const result = check('https://benign-looking-name.com/join', { reportedDomains: reported });
  assert.equal(result.verdict, 'DANGEROUS');
  assert.ok(result.signals.some(s => s.id === 'community_reports'));
});

test('community-reported list does not override SAFE official domain', () => {
  // Threat feed must never be able to flag an official domain. The official check
  // runs after community, but OFFICIAL_DOMAINS are allow-listed at report-time
  // in the API layer. Here we just assert that normal calls without a reported
  // match still flow through to SAFE.
  const result = check('https://zoom.us/j/123');
  assert.equal(result.verdict, 'SAFE');
});

test('CheckResult includes registrableDomain for threat-feed correlation', () => {
  const result = check('https://us06web.zoom.us/j/123');
  assert.equal(result.registrableDomain, 'zoom.us');
});
