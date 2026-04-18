import { useLocale } from './i18n/LocaleContext.js';
import { format } from './i18n/format.js';
import type { UiMessages } from './i18n/types.js';

export function HowItWorks() {
  const { t } = useLocale();

  return (
    <section className="wrap py-[76px]" id="how">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 pb-7 border-b border-ink mb-10 items-end">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
          § 02<br />
          <b className="text-ink font-semibold">{t.howItWorks.sectionTag}</b>
        </div>
        <h2 className="font-display font-bold tracking-[-0.035em] leading-[0.95] m-0 text-ink"
            style={{ fontSize: 'clamp(40px, 6vw, 82px)' }}>
          {format(t.howItWorks.heading, {
            three: <em className="font-serif italic font-normal">{t.howItWorks.headingThree}</em>,
          })}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 rule-double border-b-[3px] border-double border-ink">
        <Step
          num="0"
          numEm="1"
          title={t.howItWorks.step1.title}
          body={t.howItWorks.step1.body}
          miniLabel={t.howItWorks.step1.miniLabel}
          miniBody={<code className="block break-all">https://zoom-invite.app/j/8472910</code>}
          isLast={false}
        />
        <Step
          num="0"
          numEm="2"
          title={t.howItWorks.step2.title}
          body={t.howItWorks.step2.body}
          miniLabel={t.howItWorks.step2.miniLabel}
          miniBody={
            <code className="block whitespace-pre">{`▌ official domain ……… ✗ not allowlisted
▌ cert transparency … ✗ issued 2d ago
▌ community feed …… ✗ reported 23×`}</code>
          }
          isLast={false}
        />
        <Step
          num="0"
          numEm="3"
          title={t.howItWorks.step3.title}
          body={
            <>
              {format(t.howItWorks.step3.body, {
                safe:         <VerdictWord level="safe"         t={t} />,
                dangerous:    <VerdictWord level="dangerous"    t={t} />,
                unrecognized: <VerdictWord level="unrecognized" t={t} />,
              })}
            </>
          }
          miniLabel={t.howItWorks.step3.miniLabel}
          miniBody={
            <>
              <div className="text-muted text-center my-2">↓</div>
              <div className="font-bold tracking-[0.04em] text-danger">{t.howItWorks.step3.miniOutput}</div>
            </>
          }
          isLast
        />
      </div>
    </section>
  );
}

function VerdictWord({ level, t }: { level: 'safe' | 'dangerous' | 'unrecognized'; t: UiMessages }) {
  const color = level === 'safe' ? 'text-safe' : level === 'dangerous' ? 'text-danger' : 'text-warn';
  return <b className={color}>{t.verdictWords[level]}</b>;
}

function Step({
  num, numEm, title, body, miniLabel, miniBody, isLast,
}: {
  num: string;
  numEm: string;
  title: string;
  body: React.ReactNode;
  miniLabel: string;
  miniBody: React.ReactNode;
  isLast: boolean;
}) {
  return (
    <div className={'p-9 px-7 relative ' + (isLast ? '' : 'md:border-r md:border-ink border-b md:border-b-0 border-ink')}>
      <div className="font-display font-bold leading-[0.8] tracking-[-0.06em] text-ink mb-5" style={{ fontSize: '96px' }}>
        {num}<em className="font-serif italic font-normal text-danger">{numEm}</em>
      </div>
      <h3 className="font-display font-bold text-[26px] tracking-[-0.02em] m-0 mb-2">{title}</h3>
      <p className="font-mono text-[13px] leading-[1.6] text-ink-2 m-0 max-w-[34ch]">{body}</p>
      <div className="mt-5 p-3 border border-dashed border-ink bg-paper font-mono text-[11px] leading-[1.55]">
        <span className="block text-[9px] tracking-[0.16em] uppercase text-muted mb-1.5">{miniLabel}</span>
        {miniBody}
      </div>
    </div>
  );
}
