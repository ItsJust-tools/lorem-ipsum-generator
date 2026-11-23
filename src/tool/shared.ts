import { composeText } from './corpus';
import type { Mode, OutputFormatKind } from './types';

/** Build one short history/summary string for the current generation inputs. */
export function summaryText(
  mode: Mode,
  amount: number,
  seed: string,
  outputFormat: OutputFormatKind
): string {
  const unit = mode === 'words' ? 'words' : mode;
  const seedPart = seed ? `, seed "${seed}"` : '';
  const formatPart = outputFormat === 'html' ? ' (HTML)' : '';
  return `${amount} ${unit}${seedPart}${formatPart}`;
}

/** Human-readable status bar text; returns a fallback for invalid inputs. */
export function resultSummary(
  mode: Mode,
  amountRaw: string,
  seed: string,
  outputFormat: OutputFormatKind
): string {
  const amount = Number(amountRaw);
  if (!Number.isInteger(amount) || amount < 0 || amount > 999) {
    return 'Enter a count between 0 and 999.';
  }
  return summaryText(mode, amount, seed, outputFormat);
}

/** Full generated text or '' when inputs are invalid. */
export function generateResult(
  mode: Mode,
  amountRaw: string,
  seed: string,
  startWithLorem: boolean,
  outputFormat: OutputFormatKind
): string | null {
  const amount = Number(amountRaw.trim());
  if (!Number.isInteger(amount) || amount < 0 || amount > 999) return null;
  return composeText(mode, amount, seed, startWithLorem, outputFormat);
}

export { composeText };
