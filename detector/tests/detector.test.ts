import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, format, pickLocale, en, es } from '../src/index.js';
import { cases } from './corpus.js';

for (const tc of cases) {
  test(`${tc.expected.padEnd(13)} ${tc.url}${tc.note ? ` (${tc.note})` : ''}`, () => {
    const result = check(tc.url);
    assert.equal(
      result.verdict,
      tc.expected,
      `expected ${tc.expected}, got ${result.verdict}\n  titleKey: ${result.titleKey}`
    );
    // Detector must never return English strings directly — only keys + params.
    assert.ok(!('title' in result), `detector result should not contain 'title'`);
    assert.ok(!('reason' in result), `detector result should not contain 'reason'`);
    assert.ok(result.titleKey.length > 0, `titleKey must be non-empty`);
    assert.ok(result.reasonKey.length > 0, `reasonKey must be non-empty`);
  });
}

test('community-reported domain returns DANGEROUS even without other signals', () => {
  const reported = new Set(['benign-looking-name.com']);
  const result = check('https://benign-looking-name.com/join', { reportedDomains: reported });
  assert.equal(result.verdict, 'DANGEROUS');
  assert.equal(result.titleKey, 'title.dangerous.community');
  assert.ok(result.signals.some((s) => s.id === 'community_reports'));
});

test('CheckResult includes registrableDomain for threat-feed correlation', () => {
  const result = check('https://us06web.zoom.us/j/123');
  assert.equal(result.registrableDomain, 'zoom.us');
});

// --- i18n ---

test('format() produces English strings by default', () => {
  const r = check('https://uswebzoomus.com/j/123');
  const f = format(r);
  assert.equal(f.locale, 'en');
  assert.equal(f.title, 'Almost certainly a scam');
  assert.ok(f.reason.includes('not on the official list'));
  assert.ok(f.signals.every((s) => typeof s.label === 'string' && s.label.length > 0));
});

test('format() produces Spanish strings with locale="es"', () => {
  const r = check('https://uswebzoomus.com/j/123');
  const f = format(r, 'es');
  assert.equal(f.locale, 'es');
  assert.equal(f.title, 'Casi con certeza una estafa');
  assert.ok(f.reason.includes('servicio de reuniones'));
});

test('format() interpolates reasonParams', () => {
  const r = check('https://zoom.us.meeting-join.co/j/123');
  const f = format(r, 'en');
  assert.ok(f.reason.includes('meeting-join.co'));
  assert.ok(f.reason.includes('zoom'));
});

test('format() falls back to English when a key is missing in the target locale', () => {
  const partial: Record<string, string> = { 'title.safe': 'SAFE-ONLY-KEY' };
  const r = check('https://zoom.us/j/123');
  const f = format(r, partial);
  assert.equal(f.title, 'SAFE-ONLY-KEY');
  // Reason key isn't in the partial dict → falls back to en.
  assert.ok(f.reason.includes('zoom'));
});

test('format() keeps titleKey/reasonKey so clients can re-format', () => {
  const r = check('https://uswebzoomus.com/j/123');
  const f = format(r, 'es');
  assert.equal(f.titleKey, 'title.dangerous.impersonation');
  assert.equal(f.reasonKey, 'reason.dangerous.impersonation');
});

test('pickLocale() handles Accept-Language headers', () => {
  assert.equal(pickLocale('es-MX,es;q=0.9,en;q=0.8'), 'es');
  assert.equal(pickLocale('en-US,en;q=0.9'), 'en');
  assert.equal(pickLocale('fr-FR'), 'en', 'unknown locale falls back to en');
  assert.equal(pickLocale(''), 'en');
  assert.equal(pickLocale(null), 'en');
  assert.equal(pickLocale('es'), 'es');
});

test('English and Spanish locales cover the same keys', () => {
  const enKeys = new Set(Object.keys(en));
  const esKeys = new Set(Object.keys(es));
  const missingInEs: string[] = [];
  for (const k of enKeys) if (!esKeys.has(k)) missingInEs.push(k);
  const missingInEn: string[] = [];
  for (const k of esKeys) if (!enKeys.has(k)) missingInEn.push(k);
  assert.deepEqual(missingInEs, [], `keys missing in es: ${missingInEs.join(', ')}`);
  assert.deepEqual(missingInEn, [], `keys missing in en: ${missingInEn.join(', ')}`);
});
