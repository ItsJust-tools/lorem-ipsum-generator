import type { ToolConfig } from '@itsjust/core';

const toolConfig = {
  id: 'lorem-ipsum-generator',
  name: 'Lorem Ipsum Generator',
  description:
    'Generate lorem ipsum filler text with control over paragraphs, sentences and words, deterministic seeded output, an HTML mode, a start-with-lorem-ipsum toggle, and copy/share support.',
  version: '1.0.0',
  exportFormats: ['png', 'jpeg', 'webp', 'pdf'],
  features: {
    export: true,
    autoSave: true,
    undoRedo: false,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    accent: '#10b981',
    accentHover: '#059669',
    accentSubtle: 'rgba(16, 185, 129, 0.12)',
    brand: 'Lorem Ipsum Generator',
    icon: '📝',
  },
  shortcuts: [
    {
      title: 'Lorem Ipsum Generator',
      shortcuts: [
        { keys: 'P', label: 'Paragraphs', description: 'switch to paragraphs mode' },
        { keys: 'S', label: 'Sentences', description: 'switch to sentences mode' },
        { keys: 'W', label: 'Words', description: 'switch to words mode' },
        {
          keys: 'Y',
          label: 'Copy result',
          description: 'copy the generated text to the clipboard',
        },
        {
          keys: 'G',
          label: 'Regenerate',
          description: 're-roll the generator with the current seed',
        },
      ],
    },
  ],
} satisfies ToolConfig;

export default toolConfig;
