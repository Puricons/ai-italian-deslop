# ai-italian-deslop

> AI Italian deslopification — keep your Italian text human.

[![npm](https://img.shields.io/npm/v/ai-italian-deslop)](https://npmjs.com/package/ai-italian-deslop)
[![CI](https://github.com/Puricons/ai-italian-deslop/actions/workflows/ci.yml/badge.svg)](https://github.com/Puricons/ai-italian-deslop/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A linter that detects and fixes the hallmarks of AI-generated Italian text: wrong accents, cinematic punctuation, formulaic phrases, and robotic syntax structures.

## Install

```bash
npm install -g ai-italian-deslop
```

## Usage

```bash
# Check files for slop
ideslop check README.md
ideslop check "docs/**/*.md"

# Auto-fix safe issues (accents, double hyphens, ellipsis)
ideslop check --fix README.md

# Fix in-place with backup
ideslop fix README.md

# Inject anti-slop rules into your AI agent config
ideslop init                    # auto-detects CLAUDE.md, AGENTS.md, GEMINI.md, .cursorrules
ideslop init --agent claude     # CLAUDE.md only
ideslop init --dry-run          # preview without modifying

# List available rules
ideslop rules
ideslop rules --category orthography
ideslop rules orthography/accented-words
```

## What it detects

| Category | Examples |
|---|---|
| **Orthography** | `perche` → `perché`, `piu` → `più`, `pò` → `po'`, `un'altro` → `un altro` |
| **Punctuation** | `--` as punctuation, dramatic `...`, staccato sentences ("Non è X. È Y. È tutto.") |
| **Lexicon** | "vale la pena notare", "tuffiamoci", "in sintesi", "è fondamentale capire che" (140+ phrases) |
| **Structure** | innanzitutto/inoltre/infine skeleton, parallel clichés, list overuse |

## Configuration

Create `.italiandesloprc.json` in your project root:

```json
{
  "rules": {
    "structure/list-overuse": "off",
    "lexicon/macaronic-anglicisms": "error"
  },
  "lexicon": {
    "custom-slop-phrases": ["a mio avviso", "come si suol dire"]
  }
}
```

## Adding slop phrases

Edit `node_modules/ai-italian-deslop/dist/rules/lexicon/data/slop-phrases.json` — or better, open a PR to add them to the main list. No TypeScript required, just JSON.

## CI Integration

```yaml
# .github/workflows/lint-italian.yml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with: { node-version: 20 }
- run: npx ai-italian-deslop check "**/*.md" --format github
```

## Pre-commit (lefthook)

```yaml
pre-commit:
  commands:
    italian-deslop:
      glob: "*.md"
      run: ideslop check --fix {staged_files}
```

## Claude Code hook

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "ideslop check --fix $CLAUDE_TOOL_OUTPUT_PATH 2>/dev/null || true"
      }]
    }]
  }
}
```

## License

MIT © Lorenzo Puricelli
