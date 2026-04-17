import type { CheckResult, Signal } from '../detector.js';

export type Messages = Readonly<Record<string, string>>;

export interface FormattedSignal extends Signal {
  label: string;
  detail: string;
}

export interface FormattedCheckResult
  extends Omit<CheckResult, 'signals' | 'titleKey' | 'reasonKey' | 'reasonParams'> {
  /** Kept so clients can re-format on the client without another API call. */
  titleKey: string;
  reasonKey: string;
  reasonParams?: CheckResult['reasonParams'];
  title: string;
  reason: string;
  signals: FormattedSignal[];
  locale: string;
}

export interface Locale {
  code: string;
  name: string;
  messages: Messages;
}
