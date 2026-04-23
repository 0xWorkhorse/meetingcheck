import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, format, pickLocale, normalizeInput, en, es } from '../src/index.js';
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

// --- Normalizer contract ---

test('normalizeInput: already-formed URL round-trips unchanged (no extractedFrom)', () => {
  const r = normalizeInput('https://zoom.us/j/123');
  assert.deepEqual(r, { url: 'https://zoom.us/j/123' });
});

test('normalizeInput: bare hostname+path gets https:// prepended and flags extractedFrom', () => {
  const r = normalizeInput('meet.google.com/tfn-wtyz-qny');
  if ('error' in r) throw new Error('unexpected error result');
  assert.equal(r.url, 'https://meet.google.com/tfn-wtyz-qny');
  assert.equal(r.extractedFrom, 'meet.google.com/tfn-wtyz-qny');
});

test('normalizeInput: bare hostname alone also normalizes', () => {
  const r = normalizeInput('zoom.us');
  if ('error' in r) throw new Error('unexpected error result');
  assert.equal(r.url, 'https://zoom.us');
});

test('normalizeInput: markdown link syntax extracts the URL', () => {
  const r = normalizeInput('[Join](https://zoom.us/j/123)');
  if ('error' in r) throw new Error('unexpected error result');
  assert.equal(r.url, 'https://zoom.us/j/123');
  assert.ok(r.extractedFrom, 'extractedFrom should be set when input shape changed');
});

test('normalizeInput: angle-bracket wrapping strips the wrappers', () => {
  const r = normalizeInput('<https://meet.google.com/abc>');
  if ('error' in r) throw new Error('unexpected error result');
  assert.equal(r.url, 'https://meet.google.com/abc');
});

test('normalizeInput: text blob prioritizes official-domain URLs over others', () => {
  const blob = 'Join: tel.meet/xxx (backup) or https://meet.google.com/xyz for the real call';
  const r = normalizeInput(blob);
  if ('error' in r) throw new Error('unexpected error result');
  assert.ok(r.url.startsWith('https://meet.google.com/'));
});

test('normalizeInput: empty string returns empty error', () => {
  assert.deepEqual(normalizeInput(''),        { error: 'empty' });
  assert.deepEqual(normalizeInput('   '),     { error: 'empty' });
  assert.deepEqual(normalizeInput('\n\t\n'),  { error: 'empty' });
});

test('normalizeInput: prose with no URL-like substring returns no_url error', () => {
  assert.deepEqual(normalizeInput('hello world'),                 { error: 'no_url' });
  assert.deepEqual(normalizeInput('just some words here'),        { error: 'no_url' });
});

test('normalizeInput: native-app schemes each return a scheme-specific error code', () => {
  assert.deepEqual(normalizeInput('zoommtg://zoom.us/join?confno=123'), { error: 'scheme.zoommtg' });
  assert.deepEqual(normalizeInput('msteams:/l/meetup-join/...'),        { error: 'scheme.msteams' });
  assert.deepEqual(normalizeInput('tel:+15555551212'),                  { error: 'scheme.tel' });
  assert.deepEqual(normalizeInput('mailto:person@example.com'),         { error: 'scheme.mailto' });
});

test('normalizeInput: unknown non-http scheme returns scheme.other:<name>', () => {
  assert.deepEqual(normalizeInput('ftp://zoom.us/file'), { error: 'scheme.other:ftp' });
});

// --- check() integration: extractedFrom flows through, scheme rejection maps to INVALID ---

test('check() exposes extractedFrom when input was normalized', () => {
  const r = check('meet.google.com/abc-def-ghi');
  assert.equal(r.verdict, 'SAFE');
  assert.equal(r.extractedFrom, 'meet.google.com/abc-def-ghi');
});

test('check() does NOT set extractedFrom for pristine URL inputs', () => {
  const r = check('https://zoom.us/j/123');
  assert.equal(r.verdict, 'SAFE');
  assert.equal(r.extractedFrom, undefined);
});

test('check() maps zoommtg:// to a scheme-specific INVALID reason', () => {
  const r = check('zoommtg://zoom.us/join?confno=123');
  assert.equal(r.verdict, 'INVALID');
  assert.equal(r.reasonKey, 'reason.invalid.scheme.zoommtg');
});

test('check() maps empty input to reason.invalid.empty', () => {
  const r = check('');
  assert.equal(r.verdict, 'INVALID');
  assert.equal(r.reasonKey, 'reason.invalid.empty');
});

test('check() maps prose-with-no-url to reason.invalid.no_url', () => {
  const r = check('just some random text');
  assert.equal(r.verdict, 'INVALID');
  assert.equal(r.reasonKey, 'reason.invalid.no_url');
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
