/** Generation mode: how the requested amount is interpreted. */
export type Mode = 'paragraphs' | 'sentences' | 'words';

/** Output format: plain text or HTML paragraph markup. */
export type OutputFormatKind = 'text' | 'html';

export interface HistoryEntry {
  /** Short human readable description of the generated text. */
  text: string;
  /** ISO timestamp when the entry was saved. */
  createdAt: string;
}

export interface ToolState {
  /** Active generation mode. */
  mode: Mode;
  /** Requested amount (meaning depends on mode). */
  amount: string;
  /** Deterministic seed; empty means a stable default corpus order. */
  seed: string;
  /** Whether the output starts with the classic "Lorem ipsum dolor sit amet". */
  startWithLorem: boolean;
  /** Plain text or HTML (wrapped in <p> tags). */
  outputFormat: OutputFormatKind;
  /** Saved snippets, newest first. */
  history: HistoryEntry[];
}

export const DEFAULT_STATE: ToolState = {
  mode: 'paragraphs',
  amount: '3',
  seed: '',
  startWithLorem: true,
  outputFormat: 'text',
  history: [],
};

export const MAX_HISTORY = 20;

export const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: 'paragraphs', label: 'Paragraphs', hint: 'generate full paragraphs' },
  { value: 'sentences', label: 'Sentences', hint: 'generate a number of sentences' },
  { value: 'words', label: 'Words', hint: 'generate an exact word count' },
];

/** Parse a non-negative integer; returns null for empty/unparseable input. */
export function parseCount(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 0) return null;
  return value;
}

/**
 * Mulberry32 seeded PRNG. Same seed string always yields the same sequence,
 * so the same seed always produces identical output.
 */
export function seedRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
