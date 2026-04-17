/**
 * Test corpus for the detector.
 * Every entry here is a real pattern from the Feb-Mar 2026 threat reports
 * (Netcraft, Malwarebytes, Mandiant) or a reasonable adversarial variant.
 */
import type { Verdict } from '../src/detector.js';

export interface TestCase {
  url: string;
  expected: Verdict;
  note?: string;
}

export const cases: TestCase[] = [
  // --- SAFE cases (must never false-positive) ---
  { url: 'https://zoom.us/j/8472938471',                        expected: 'SAFE' },
  { url: 'https://us06web.zoom.us/j/8472938471',                expected: 'SAFE', note: 'regional Zoom subdomain' },
  { url: 'https://us02web.zoom.us/j/123?pwd=abc',               expected: 'SAFE' },
  { url: 'https://company.zoom.us/j/123',                       expected: 'SAFE', note: 'vanity Zoom subdomain' },
  { url: 'https://zoomgov.com/j/123',                           expected: 'SAFE', note: 'ZoomGov' },
  { url: 'https://meet.google.com/abc-defg-hij',                expected: 'SAFE' },
  { url: 'https://teams.microsoft.com/l/meetup-join/19%3a123',  expected: 'SAFE' },
  { url: 'https://calendly.com/ian/30min',                      expected: 'SAFE' },
  { url: 'https://cal.com/ian/intro',                           expected: 'SAFE' },
  { url: 'https://whereby.com/ianmeeting',                      expected: 'SAFE' },
  { url: 'https://meet.jit.si/my-call',                         expected: 'SAFE' },

  // --- DANGEROUS: real scam domains from Feb-Mar 2026 reports ---
  { url: 'https://uswebzoomus.com/zoom',                        expected: 'DANGEROUS', note: 'Netcraft Feb 2026' },
  { url: 'https://us01web-zoom.us/j/123',                       expected: 'DANGEROUS', note: 'Netcraft Feb 2026' },
  { url: 'https://googlemeetinterview.click/abc',               expected: 'DANGEROUS', note: 'Malwarebytes Feb 2026' },

  // --- DANGEROUS: subdomain tricks ---
  { url: 'https://zoom.us.meeting-join.co/j/123',               expected: 'DANGEROUS' },
  { url: 'https://meet.google.com.fake-invite.xyz/abc',         expected: 'DANGEROUS' },
  { url: 'https://calendly.com.confirm-meeting.live/ian',       expected: 'DANGEROUS' },

  // --- DANGEROUS: brand impersonation variants ---
  { url: 'https://zoom-meeting.click/j/123',                    expected: 'DANGEROUS' },
  { url: 'https://join-zoom-call.xyz/j/123',                    expected: 'DANGEROUS' },
  { url: 'https://google-meet-invite.top/abc',                  expected: 'DANGEROUS', note: 'gmeet normalizer hit: googlemeet' },
  { url: 'https://calendly-confirm.link/ian',                   expected: 'DANGEROUS' },
  { url: 'https://webexmeeting.click/j/123',                    expected: 'DANGEROUS' },

  // --- DANGEROUS: typosquats ---
  { url: 'https://zo0m.us/j/123',                               expected: 'DANGEROUS' },
  { url: 'https://z00m.us/j/123',                               expected: 'DANGEROUS' },
  { url: 'https://zooom.com/j/123',                             expected: 'DANGEROUS' },
  { url: 'https://ca1endly.com/ian',                            expected: 'DANGEROUS' },

  // --- UNRECOGNIZED: random domains that don't try to impersonate ---
  { url: 'https://example.com/meeting',                         expected: 'UNRECOGNIZED' },
  { url: 'https://github.com/some/repo',                        expected: 'UNRECOGNIZED' },
  // Narrow tokens (googlemeet/gmeet rather than bare "meet") mean internal meeting-room tools
  // are UNRECOGNIZED rather than false-positive DANGEROUS. Still surfaces the "not official" warning.
  { url: 'https://my-company-meeting-room.com/join/abc',        expected: 'UNRECOGNIZED', note: 'narrow tokens avoid false positive' },

  // --- INVALID ---
  { url: 'not a url',                                           expected: 'INVALID' },
  { url: 'javascript:alert(1)',                                 expected: 'INVALID', note: 'javascript: URL has no hostname; URL parser may accept it but protocol check rejects' },
  { url: 'ftp://zoom.us/file',                                  expected: 'INVALID' },
];
