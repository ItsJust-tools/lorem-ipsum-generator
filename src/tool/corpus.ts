import { seedRandom } from './types';

/** Canonical latin lorem ipsum word pool. */
export const CORPUS: string[] = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
];

export const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

/** Capitalize the first letter of a sentence-ish string. */
export function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Generate `count` sentences. Each sentence has 6-14 words chosen from the
 * corpus using the seeded PRNG. Length varies per sentence.
 */
export function generateSentences(count: number, seed: string): string[] {
  if (count <= 0) return [];
  const rand = seedRandom(seed);
  const sentences: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const wordCount = 6 + Math.floor(rand() * 9); // 6..14
    const words: string[] = [];
    for (let w = 0; w < wordCount; w += 1) {
      const next = CORPUS[Math.floor(rand() * CORPUS.length)] ?? 'lorem';
      words.push(next);
    }
    sentences.push(`${capitalize(words.join(' '))}.`);
  }
  return sentences;
}

/** Generate `count` paragraphs of 3-6 sentences each. */
export function generateParagraphs(count: number, seed: string): string[] {
  if (count <= 0) return [];
  const rand = seedRandom(`${seed}#p`);
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const sentenceCount = 3 + Math.floor(rand() * 4); // 3..6
    const sentenceRand = seedRandom(`${seed}#p${i}`);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s += 1) {
      const generated = generateSentences(1, `${seed}#p${i}s${s}`);
      if (generated.length === 0) break;
      // vary length using the paragraph-local rand
      void sentenceRand;
      const first = generated[0];
      if (first === undefined) break;
      sentences.push(first);
    }
    paragraphs.push(sentences.join(' '));
    void rand;
  }
  return paragraphs;
}

/**
 * Generate exactly `count` words, joined by spaces, ending with a period.
 * Splits into sentence-like chunks only visually (single text block).
 */
export function generateWords(count: number, seed: string): string {
  if (count <= 0) return '';
  const rand = seedRandom(`${seed}#w`);
  const words: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const next = CORPUS[Math.floor(rand() * CORPUS.length)] ?? 'lorem';
    words.push(next);
  }
  return `${capitalize(words.join(' '))}.`;
}

/** Replace the leading classic opener with the generated sentences. */
export function applyLoremStart(sentences: string[], startWithLorem: boolean): string[] {
  if (startWithLorem && sentences.length > 0) {
    return [LOREM_START, ...sentences.slice(1)];
  }
  return sentences;
}

/** Compose the final generated text for a full tool state input set. */
export function composeText(
  mode: 'paragraphs' | 'sentences' | 'words',
  amount: number,
  seed: string,
  startWithLorem: boolean,
  outputFormat: 'text' | 'html'
): string {
  if (amount <= 0) return '';
  if (mode === 'words') {
    const text = generateWords(amount, seed);
    return outputFormat === 'html' ? `<p>${text}</p>` : text;
  }
  if (mode === 'paragraphs') {
    const paragraphs = generateParagraphs(amount, seed);
    const perParagraph = paragraphs.map((p) => p);
    if (startWithLorem && perParagraph.length > 0 && perParagraph[0] !== undefined) {
      const firstSentences: string[] = perParagraph[0].match(/[^.!?]+[.!?]+/g) ?? [
        perParagraph[0] as string,
      ];
      perParagraph[0] = applyLoremStart(firstSentences, true).join(' ');
    }
    return outputFormat === 'html'
      ? perParagraph.map((p) => `<p>${p}</p>`).join('\n')
      : perParagraph.join('\n\n');
  }
  const sentencesResult = applyLoremStart(generateSentences(amount, seed), startWithLorem);
  return outputFormat === 'html'
    ? `<p>${sentencesResult.join(' ')}</p>`
    : sentencesResult.join(' ');
}
