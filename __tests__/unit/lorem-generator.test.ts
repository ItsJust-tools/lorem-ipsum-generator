import { describe, it, expect } from 'vitest';
import { parseCount, seedRandom, DEFAULT_STATE, MAX_HISTORY, type ToolState } from '@/tool/types';
import { deserializeState, serializeState, withHistory, roundTrips } from '@/tool/tool-definition';
import { loremIpsumGeneratorTool } from '@/tool/tool-definition';
import {
  CORPUS,
  LOREM_START,
  capitalize,
  applyLoremStart,
  composeText,
  generateParagraphs,
  generateSentences,
  generateWords,
} from '@/tool/corpus';
import { summaryText, resultSummary, generateResult } from '@/tool/shared';

const state = (patch: Partial<ToolState> = {}): ToolState => ({ ...DEFAULT_STATE, ...patch });

describe('parseCount', () => {
  it('parses non-negative integers', () => {
    expect(parseCount('3')).toBe(3);
    expect(parseCount(' 12 ')).toBe(12);
    expect(parseCount('0')).toBe(0);
  });

  it('rejects invalid input', () => {
    expect(parseCount('')).toBeNull();
    expect(parseCount('   ')).toBeNull();
    expect(parseCount('abc')).toBeNull();
    expect(parseCount('-1')).toBeNull();
    expect(parseCount('1.5')).toBeNull();
    expect(parseCount('1,5')).toBeNull();
    expect(parseCount('+3')).toBeNull();
  });
});

describe('seedRandom', () => {
  it('is deterministic for the same seed', () => {
    const a = seedRandom('alpha');
    const b = seedRandom('alpha');
    for (let i = 0; i < 10; i += 1) {
      const av = a();
      const bv = b();
      expect(av).toBe(bv);
    }
  });

  it('differs across seeds', () => {
    const a = seedRandom('one');
    const b = seedRandom('two');
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it('returns values in [0,1)', () => {
    const rand = seedRandom('range');
    for (let i = 0; i < 200; i += 1) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('generateSentences', () => {
  it('produces the requested count of sentences', () => {
    const sentences = generateSentences(5, 'seed');
    expect(sentences).toHaveLength(5);
  });

  it('returns empty array for zero', () => {
    expect(generateSentences(0, 'seed')).toEqual([]);
  });

  it('is deterministic for the same seed', () => {
    expect(generateSentences(4, 'same')).toEqual(generateSentences(4, 'same'));
  });

  it('capitalizes first word and ends with a period', () => {
    const sentences = generateSentences(6, 'fmt');
    for (const sentence of sentences) {
      expect(sentence.endsWith('.')).toBe(true);
      const firstChar = sentence.charAt(0);
      expect(firstChar).toBe(firstChar.toUpperCase());
    }
  });

  it('uses only corpus words', () => {
    const corpusSet = new Set(CORPUS);
    const sentences = generateSentences(8, 'words');
    for (const sentence of sentences) {
      const words = sentence.slice(0, -1).split(' ');
      if (words.length === 0) continue;
      expect(words.length).toBeGreaterThan(0);
      for (const w of words) {
        expect(corpusSet.has(w.toLowerCase())).toBe(true);
      }
    }
  });

  it('sentence length stays within 6-14 words', () => {
    for (const sentence of generateSentences(30, 'len')) {
      const parts = sentence.slice(0, -1).split(' ');
      if (parts.length === 0) continue;
      const n = parts.length;
      expect(n).toBeGreaterThanOrEqual(6);
      expect(n).toBeLessThanOrEqual(14);
    }
  });
});

describe('generateWords', () => {
  it('produces exactly the requested word count plus punctuation', () => {
    const text = generateWords(20, 'w');
    const words = text.slice(0, -1).split(' ');
    expect(words).toHaveLength(20);
    expect(text.endsWith('.')).toBe(true);
  });

  it('returns empty string for zero', () => {
    expect(generateWords(0, 'w')).toBe('');
  });

  it('is deterministic', () => {
    expect(generateWords(12, 'dw')).toBe(generateWords(12, 'dw'));
  });
});

describe('generateParagraphs', () => {
  it('produces one entry per requested paragraph', () => {
    expect(generateParagraphs(3, 'p')).toHaveLength(3);
  });

  it('each paragraph has at least 3 sentences', () => {
    for (const p of generateParagraphs(5, 'ps')) {
      expect(p.match(/\./g)?.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(p.match(/\./g)?.length ?? 0).toBeLessThanOrEqual(6);
    }
  });
});

describe('applyLoremStart', () => {
  it('replaces the first sentence with the classic opener', () => {
    const sentences = ['Foo bar.', 'Baz qux.'];
    expect(applyLoremStart(sentences, true)[0]).toBe(LOREM_START);
    expect(applyLoremStart(sentences, true)).toHaveLength(2);
  });

  it('leaves sentences untouched when disabled', () => {
    const sentences = ['Foo bar.', 'Baz qux.'];
    expect(applyLoremStart(sentences, false)).toEqual(sentences);
  });

  it('handles empty input', () => {
    expect(applyLoremStart([], true)).toEqual([]);
  });
});

describe('composeText', () => {
  it('words mode returns a plain single block for text output', () => {
    const text = composeText('words', 10, 's', false, 'text');
    expect(text.split(' ').length).toBe(10);
    expect(text).not.toContain('<p>');
  });

  it('words mode wraps in <p> for html output', () => {
    const text = composeText('words', 10, 's', false, 'html');
    expect(text.startsWith('<p>')).toBe(true);
    expect(text.endsWith('</p>')).toBe(true);
  });

  it('sentences mode honors startWithLorem', () => {
    const withStart = composeText('sentences', 3, 'sl', true, 'text');
    expect(withStart.startsWith(LOREM_START)).toBe(true);
    const withoutStart = composeText('sentences', 3, 'sl', false, 'text');
    expect(withoutStart.startsWith(LOREM_START)).toBe(false);
  });

  it('paragraph mode html output wraps each paragraph', () => {
    const text = composeText('paragraphs', 2, 'ph', false, 'html');
    const matches = text.match(/<p>/g);
    expect(matches).toHaveLength(2);
  });

  it('returns empty string for zero amount', () => {
    expect(composeText('paragraphs', 0, 'z', true, 'text')).toBe('');
    expect(composeText('sentences', 0, 'z', true, 'text')).toBe('');
    expect(composeText('words', 0, 'z', true, 'text')).toBe('');
  });

  it('is fully deterministic with a fixed seed', () => {
    const a = composeText('paragraphs', 2, 'det', true, 'text');
    const b = composeText('paragraphs', 2, 'det', true, 'text');
    expect(a).toBe(b);
  });
});

describe('serialize/deserialize', () => {
  it('serializes all fields', () => {
    const serialized = serializeState(state({ amount: '4', seed: 'x', outputFormat: 'html' }));
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(parsed.mode).toBe('paragraphs');
    expect(parsed.amount).toBe('4');
    expect(parsed.seed).toBe('x');
    expect(parsed.startWithLorem).toBe(true);
    expect(parsed.outputFormat).toBe('html');
    expect(Array.isArray(parsed.history)).toBe(true);
  });

  it('deserializes valid payloads', () => {
    const result = deserializeState({
      mode: 'words',
      amount: '42',
      seed: 's',
      startWithLorem: false,
      outputFormat: 'text',
      history: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe('words');
      expect(result.data.amount).toBe('42');
      expect(result.data.startWithLorem).toBe(false);
    }
  });

  it('repairs invalid payloads to defaults', () => {
    const result = deserializeState({ mode: 'bogus', amount: -5, outputFormat: 9 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ ...DEFAULT_STATE, history: [] });
    }
  });

  it('rejects non-object payloads', () => {
    expect(deserializeState('nope').success).toBe(false);
    expect(deserializeState(null).success).toBe(false);
    expect(deserializeState([1, 2]).success).toBe(false);
  });

  it('caps history at MAX_HISTORY', () => {
    const entries = Array.from({ length: MAX_HISTORY + 5 }, (_, i) => ({
      text: `entry ${i}`,
      createdAt: `2026-01-01T00:00:${String(i % 60).padStart(2, '0')}Z`,
    }));
    const result = deserializeState({ ...DEFAULT_STATE, history: entries });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.history).toHaveLength(MAX_HISTORY);
  });

  it('drops malformed history entries', () => {
    const result = deserializeState({
      ...DEFAULT_STATE,
      history: [{ text: 'ok', createdAt: '2026-01-01T00:00:00Z' }, 'bad', 42],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.history).toHaveLength(1);
  });

  it('round-trips through serialize/deserialize', () => {
    const sample = state({ amount: '9', seed: 'rt', outputFormat: 'html' });
    expect(roundTrips(sample)).toBe(true);
  });

  it('tool exposes config identity', () => {
    expect(loremIpsumGeneratorTool.id).toBe('lorem-ipsum-generator');
    expect(loremIpsumGeneratorTool.initialState).toEqual(DEFAULT_STATE);
  });
});

describe('withHistory', () => {
  it('prepends entries newest-first and caps the list', () => {
    let current = state();
    for (let i = 0; i < MAX_HISTORY + 3; i += 1) {
      current = withHistory(current, `gen ${i}`, new Date(2026, 0, 1, 0, 0, i));
    }
    expect(current.history).toHaveLength(MAX_HISTORY);
    expect(current.history[0]?.text).toBe(`gen ${MAX_HISTORY + 2}`);
    for (let i = 1; i < current.history.length; i += 1) {
      const prev = current.history[i - 1];
      const currEntry = current.history[i];
      if (!prev || !currEntry) continue;
      expect(prev.createdAt >= currEntry.createdAt).toBe(true);
    }
  });
});

describe('shared helpers', () => {
  it('summaryText describes mode, amount and seed', () => {
    expect(summaryText('paragraphs', 3, '', 'text')).toBe('3 paragraphs');
    expect(summaryText('words', 50, 'abc', 'text')).toBe('50 words, seed "abc"');
    expect(summaryText('sentences', 2, '', 'html')).toBe('2 sentences (HTML)');
  });

  it('resultSummary rejects invalid amounts', () => {
    expect(resultSummary('paragraphs', 'abc', '', 'text')).toContain('between 0 and 999');
    expect(resultSummary('paragraphs', '-1', '', 'text')).toContain('between 0 and 999');
    expect(resultSummary('paragraphs', '1000', '', 'text')).toContain('between 0 and 999');
    expect(resultSummary('paragraphs', '5', '', 'text')).toBe('5 paragraphs');
  });

  it('generateResult returns null for invalid counts', () => {
    expect(generateResult('paragraphs', 'abc', '', true, 'text')).toBeNull();
    expect(generateResult('paragraphs', '1000', '', true, 'text')).toBeNull();
    expect(generateResult('sentences', '-2', '', true, 'text')).toBeNull();
  });

  it('generateResult returns empty string for zero', () => {
    expect(generateResult('words', '0', '', true, 'text')).toBe('');
  });

  it('generateResult generates valid text', () => {
    const text = generateResult('sentences', '3', 'g', true, 'text');
    expect(text).not.toBeNull();
    expect(text?.startsWith(LOREM_START)).toBe(true);
  });
});

describe('capitalize', () => {
  it('capitalizes the first character', () => {
    expect(capitalize('lorem')).toBe('Lorem');
    expect(capitalize('')).toBe('');
    expect(capitalize('Lorem')).toBe('Lorem');
  });
});
