import { useEffect, type ReactNode } from 'react';

/**
 * Static privacy policy at /privacy. Required for Chrome Web Store submission
 * and linked from the site footer. Plain pathname-routed page (see main.tsx);
 * no router dependency. Content is intentionally English-only — translating
 * legal copy would risk meaning drift, and the policy must be authoritative.
 */

export function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy · Meetingcheck';
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-ink">
        <div className="max-w-[1320px] mx-auto py-[18px] px-7 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2.5 no-underline hover:bg-transparent hover:text-ink"
          >
            <span className="w-[34px] h-[34px] border-[1.5px] border-ink bg-ink text-paper grid place-items-center font-mono font-bold text-[18px] rounded-full leading-none">
              ✓
            </span>
            <span className="flex flex-col leading-[1.05]">
              <span className="font-display font-bold text-[22px] tracking-[-0.02em]">MEETINGCHECK</span>
              <span className="font-mono text-[10px] tracking-[0.12em] text-muted -mt-[3px] uppercase font-medium">
                v3.2 — link verifier
              </span>
            </span>
          </a>
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
            § privacy
          </span>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-6 sm:px-7 pt-12 sm:pt-16 pb-10">
        <h1
          className="font-serif italic font-normal text-ink m-0 leading-[0.95] tracking-[-0.025em]"
          style={{ fontSize: 'clamp(56px, 12vw, 104px)' }}
        >
          Privacy Policy
        </h1>
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted mt-4">
          Last updated: April 23, 2026
        </div>

        <div className="mt-10 pt-8 border-t-[3px] border-double border-ink">
          <p className="font-serif text-ink leading-[1.45] m-0"
             style={{ fontSize: 'clamp(20px, 2.4vw, 26px)' }}>
            Meetingcheck is a security tool. We take privacy seriously because the
            people who use this tool are trying to avoid getting tracked and
            exploited. This page explains exactly what we collect and why.
          </p>
        </div>

        <Section heading="What we collect">
          <p>
            <Term>URLs you check.</Term> When you paste a URL into the verifier,
            our API receives that URL to run the verification checks. We log this
            in a database for two purposes: rate limiting (to prevent abuse) and
            aggregated statistics (how many links have been checked total, etc.).
          </p>
          <p>
            <Term>Hashed IP addresses.</Term> Your IP address is hashed using
            SHA-256 with a server-side salt before being stored. We use these
            hashes for rate limiting and to detect abusive patterns. The hashed
            values cannot be reversed to recover your real IP.
          </p>
          <p>
            <Term>Anonymous install IDs.</Term> If you use the browser extension,
            we generate a random UUID stored locally that identifies your install
            (not you). This is sent with each check request to enable per-install
            rate limits and to deduplicate community reports. The install ID has
            no connection to your identity.
          </p>
          <p>
            <Term>Community reports.</Term> When you submit a domain as a scam
            through the report flow, we store the URL, the optional context you
            provide, the source category you select (Telegram, email, etc.), and
            the install ID and hashed IP described above. These are reviewed
            before any auto-promotion to the threat feed.
          </p>
        </Section>

        <Section heading="What we do NOT collect">
          <ul className="list-none p-0 m-0 grid gap-2">
            <Bullet>Names, email addresses, or any account information</Bullet>
            <Bullet>Browsing history or pages you visit</Bullet>
            <Bullet>Cookies for tracking purposes</Bullet>
            <Bullet>Personally identifiable information of any kind</Bullet>
            <Bullet>Anything beyond what's listed above</Bullet>
          </ul>
          <p className="mt-5">
            The browser extension does not read page content. It activates only
            when you explicitly invoke it (right-click a link, click the toolbar
            icon, or paste in the popup).
          </p>
        </Section>

        <Section heading="Data retention">
          <ul className="list-none p-0 m-0 grid gap-2">
            <Bullet>Raw check logs: deleted after 30 days via automated daily job</Bullet>
            <Bullet>Community reports: retained until reviewed and resolved</Bullet>
            <Bullet>Threat feed entries: retained indefinitely (these are the confirmed scam domains the tool relies on)</Bullet>
            <Bullet>Hashed IPs and install IDs: same retention as the records they're attached to</Bullet>
          </ul>
        </Section>

        <Section heading="Third parties">
          <ul className="list-none p-0 m-0 grid gap-3">
            <Bullet>
              <Term>Cloudflare Turnstile</Term> — used to detect bots on the
              report submission flow. Cloudflare receives a verification challenge
              interaction but no other data. See Cloudflare's privacy policy for
              their handling.
            </Bullet>
            <Bullet>
              <Term>Railway</Term> — our hosting provider. Receives traffic logs
              as any host would. See Railway's privacy policy.
            </Bullet>
          </ul>
          <p className="mt-5">
            We do not sell, share, or rent any data. We do not use your data for
            advertising. We do not have ad partners. We do not use Google
            Analytics or similar tracking services.
          </p>
        </Section>

        <Section heading="Open source">
          <p>
            Our detection rules and the entire frontend are open source. You can
            audit exactly what runs in your browser at{' '}
            <a
              href="https://github.com/0xWorkhorse/meetingcheck"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/0xWorkhorse/meetingcheck
            </a>
            .
          </p>
        </Section>

        <Section heading="Contact">
          <p>
            Privacy questions or data deletion requests:{' '}
            <a href="mailto:ian@themathteam.io">ian@themathteam.io</a>
          </p>
          <p>
            If you've reported a scam domain and want it removed from the threat
            feed, contact{' '}
            <a href="mailto:ian@themathteam.io">ian@themathteam.io</a>{' '}
            with the details.
          </p>
        </Section>
      </main>

      <footer className="max-w-[720px] mx-auto px-6 sm:px-7 pb-14">
        <div className="pt-6 border-t border-ink">
          <a
            href="/"
            className="font-mono text-[11px] tracking-[0.12em] uppercase no-underline"
          >
            ← Back to meetingcheck.io
          </a>
        </div>
      </footer>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-mono text-[12px] tracking-[0.16em] uppercase text-muted m-0 mb-4 pb-3 border-b border-ink">
        {heading}
      </h2>
      <div className="font-serif text-ink leading-[1.55] text-[18px] sm:text-[19px] grid gap-4 [&_p]:m-0">
        {children}
      </div>
    </section>
  );
}

function Term({ children }: { children: ReactNode }) {
  return <strong className="font-display font-semibold not-italic">{children}</strong>;
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[14px_1fr] gap-3">
      <span aria-hidden className="font-mono text-ink leading-[1.55] select-none">▌</span>
      <span>{children}</span>
    </li>
  );
}
