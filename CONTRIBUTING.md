# Contributing to ai-italian-deslop

## Setup

```bash
git clone https://github.com/puricelli-enterprise/ai-italian-deslop
cd ai-italian-deslop
npm install
npm test
```

## Adding a new slop phrase

Edit `src/rules/lexicon/data/slop-phrases.json` — no TypeScript required.

## Adding a new rule

1. Create `src/rules/<category>/<rule-name>.ts` implementing the `Rule` interface from `src/types.ts`.
2. Add tests in `tests/rules/<category>/<rule-name>.test.ts`.
3. Register it in `src/rules/index.ts`.
4. Run `npm test` — all tests must pass.

## Commit style

`feat:`, `fix:`, `chore:`, `docs:` prefixes. Keep commits small and atomic.
