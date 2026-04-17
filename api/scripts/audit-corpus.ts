/**
 * Audit corpus — intentionally DUPLICATED from the detector's test corpus.
 *
 * The point of this check is to catch deployment failure modes like
 * "Docker image was built without the detector workspace" or "API was
 * pinned to a stale detector version". If someone edits the detector's
 * own tests, we don't want that to silently change what the launch
 * audit considers correct. So the ten cases below are frozen here and
 * must be edited by hand when expectations legitimately change.
 */

export interface AuditCase {
  url: string;
  expected: 'SAFE' | 'DANGEROUS' | 'UNRECOGNIZED' | 'INVALID';
  note: string;
}

export const AUDIT_CORPUS: AuditCase[] = [
  { url: 'https://zoom.us/j/123',                     expected: 'SAFE',         note: 'exact official domain' },
  { url: 'https://us06web.zoom.us/j/123',             expected: 'SAFE',         note: 'subdomain of official' },
  { url: 'https://meet.google.com/abc-defg-hij',      expected: 'SAFE',         note: 'Google Meet' },
  { url: 'https://uswebzoomus.com/zoom',              expected: 'DANGEROUS',    note: 'real Feb 2026 attack' },
  { url: 'https://us01web-zoom.us/j/123',             expected: 'DANGEROUS',    note: 'real Feb 2026 attack' },
  { url: 'https://googlemeetinterview.click/abc',     expected: 'DANGEROUS',    note: 'real Feb 2026 attack' },
  { url: 'https://zoom.us.meeting-join.co/j/123',     expected: 'DANGEROUS',    note: 'subdomain trick' },
  { url: 'https://zo0m.us/j/123',                     expected: 'DANGEROUS',    note: 'typosquat' },
  { url: 'https://example.com/meeting',               expected: 'UNRECOGNIZED', note: 'neutral non-meeting domain' },
  { url: 'not a url',                                 expected: 'INVALID',      note: 'parse failure' },
];
