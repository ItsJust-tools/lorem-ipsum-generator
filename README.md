# Lorem Ipsum Generator

Generate lorem ipsum filler text for design mockups, CMS seeding and layout testing — with fine-grained control over paragraphs, sentences and words, deterministic seeded output and an optional HTML mode.

**Live:** [lorem-ipsum-generator.itsjust.tools](https://lorem-ipsum-generator.itsjust.tools)

## Features

- Three generation modes: paragraphs, sentences or an exact word count
- Deterministic seeded output — the same seed always produces identical text
- Optional classic opening ("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
- Plain text or HTML output (paragraphs wrapped in `<p>` tags)
- Live word count for the generated text
- Copy the generated text to the clipboard (`Y`) with toast feedback
- Save snippets to a session history (up to 20 entries, newest first)
- Shareable state via URL, `.itsjust.json` import/export and image/PDF export
- 100% client-side — no data ever leaves your browser

## Keyboard shortcuts

| Key | Action          |
| --- | --------------- |
| `P` | Paragraphs mode |
| `S` | Sentences mode  |
| `W` | Words mode      |
| `Y` | Copy result     |
| `G` | Regenerate      |

## Development

```bash
npm ci
npm run dev
```

Run the test suites:

```bash
CI=true npm test -- --coverage
npm run build
```

## License

MIT
