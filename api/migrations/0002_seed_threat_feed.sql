-- Seed the threat feed with the confirmed Feb 2026 scam domains so the launch
-- post's "paste this real scam" demo works on day one. Idempotent — re-running
-- 0002 leaves existing rows alone.

INSERT INTO threat_feed (registrable_domain, first_seen, last_seen, report_count, brand_impersonated, status, notes)
VALUES
  ('uswebzoomus.com',         NOW(), NOW(), 0, 'zoom', 'confirmed', 'Netcraft Feb 2026 campaign'),
  ('us01web-zoom.us',         NOW(), NOW(), 0, 'zoom', 'confirmed', 'Netcraft Feb 2026 campaign'),
  ('googlemeetinterview.click', NOW(), NOW(), 0, 'meet', 'confirmed', 'Malwarebytes Feb 2026 campaign')
ON CONFLICT (registrable_domain) DO NOTHING;
