import type { Messages } from './types.js';

export const en: Messages = {
  // Titles
  'title.safe':                           'Looks legitimate',
  'title.unrecognized':                   'Not a known meeting service',
  'title.invalid.unparseable':            'Not a valid URL',
  'title.invalid.protocol':               'Unsupported protocol',
  'title.dangerous.community':            'Confirmed scam',
  'title.dangerous.subdomain_trick':      'Almost certainly a scam',
  'title.dangerous.impersonation':        'Almost certainly a scam',
  'title.dangerous.homoglyph':            'Almost certainly a scam',

  // Reasons
  'reason.safe':
    'This is a real {brand} domain. Always verify the sender through a trusted channel before joining the call.',
  'reason.unrecognized':
    'This is not on our list of official meeting services (Zoom, Google Meet, Teams, Webex, Calendly, and others). If someone sent this as a meeting link, do not open it without verifying through a trusted channel first.',
  'reason.invalid.unparseable':
    'Could not parse this as a URL. Paste the full link starting with https://',
  'reason.invalid.protocol':
    'Protocol {protocol} is not supported. Paste a http(s) link.',
  'reason.dangerous.community':
    '{domain} has been reported by the community as a scam. Do not open this link.',
  'reason.dangerous.subdomain_trick':
    'The real domain here is {fakeDomain}, not {brand}. This is a classic subdomain spoofing pattern. Do not open this link.',
  'reason.dangerous.impersonation':
    'This domain is trying to look like a real meeting service but is not on the official list. This matches the exact pattern used in the Feb 2026 fake-Zoom campaigns. Do not open this link.',
  'reason.dangerous.homoglyph':
    'This domain uses look-alike characters (Cyrillic, Greek, or punycode) to impersonate {brand}. Stripped of the trick, it resembles "{skeleton}". Do not open this link.',

  // Signal labels and details
  'signal.hostname.label':                'Domain',
  'signal.hostname.detail':               '{host}',
  'signal.official.label':                'Verified',
  'signal.official.detail':               'official {brand} domain',
  'signal.subdomain_trick.label':         'Subdomain trick',
  'signal.subdomain_trick.detail':        'pretends to be {brand}; real domain is {fakeDomain}',
  'signal.brand_impersonation.label':     'Impersonation',
  'signal.brand_impersonation.detail':    'contains "{token}" but is not on the official {brand} domain list',
  'signal.typosquat.label':               'Typosquat',
  'signal.typosquat.detail':              'misspelled {brand}',
  'signal.community_reports.label':       'Community reported',
  'signal.community_reports.detail':      '{domain} is on the confirmed threat feed',
  'signal.suspicious_tld.label':          'Suspicious TLD',
  'signal.suspicious_tld.detail':         '{tld}',
  'signal.punycode.label':                'Punycode',
  'signal.punycode.detail':               'unicode characters in domain',
  'signal.homoglyph.label':               'Homoglyph attack',
  'signal.homoglyph.detail':              'decodes to "{skeleton}" — impersonates {brand}',
  'signal.no_https.label':                'Protocol',
  'signal.no_https.detail':               'not using HTTPS',
  'signal.not_official.label':            'Not recognized',
  'signal.not_official.detail':           'not on the official meeting service list',
};
