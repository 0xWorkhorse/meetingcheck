import type { UiMessages } from '../../i18n/types.js';
import { SAMPLES } from './logic.js';

interface Props {
  onPick: (url: string) => void;
  t: UiMessages;
}

export function SampleChips({ onPick, t }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      <span className="text-[10px] tracking-[0.14em] uppercase text-muted self-center mr-0.5">
        {t.checker.tryLabel}
      </span>
      {SAMPLES.map((s) => {
        const tag =
          s.tagKey === 'safe'   ? t.checker.sampleTags.safe :
          s.tagKey === 'danger' ? t.checker.sampleTags.danger :
                                  t.checker.sampleTags.unrecog;
        const tagColor =
          s.klass === 'd' ? 'text-danger' :
          s.klass === 's' ? 'text-safe'   :
                            'text-warn';
        return (
          <button
            key={s.url}
            type="button"
            onClick={() => onPick(s.url)}
            className="font-mono text-[11px] py-1.5 px-2.5 border border-dashed border-ink bg-paper cursor-pointer normal-case tracking-normal inline-flex items-center gap-1.5 hover:bg-ink hover:text-paper"
          >
            <span className={`text-[9px] tracking-[0.1em] uppercase py-0.5 px-1.5 border border-current ${tagColor}`}>
              {tag}
            </span>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
