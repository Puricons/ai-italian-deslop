# ai-italian-deslop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `ai-italian-deslop`, un linter CLI TypeScript che rileva e corregge lo "slop" AI in italiano: accenti sbagliati, punteggiatura AI, frasi formulaiche e strutture sintattiche robotiche.

**Architecture:** Motore a regole ESLint-style con regole pluggabili in quattro categorie (orthography, punctuation, lexicon, structure). Un parser markdown-aware segmenta il testo prima dell'analisi escludendo blocchi di codice. CLI costruita su commander con formatter human/json/github e comando `init` per iniettare regole nei file di config degli agent AI.

**Tech Stack:** TypeScript 5, Node ≥ 20, commander 12 (CLI), chalk 5 (colori), glob 11 (file matching), tsup 8 (build), vitest 2 (test)

---

## File Map

```
ai-italian-deslop/
├── src/
│   ├── types.ts                         # Tutte le interfacce condivise
│   ├── index.ts                         # Entry point libreria pubblica
│   ├── engine/
│   │   ├── lint.ts                      # Funzione lint() principale
│   │   ├── fix.ts                       # Funzione fix() principale
│   │   ├── config.ts                    # Caricamento .italiandesloprc.json
│   │   └── parser/
│   │       └── markdown.ts             # Segmentatore markdown-aware
│   ├── rules/
│   │   ├── index.ts                     # Registry di tutte le regole
│   │   ├── orthography/
│   │   │   ├── accented-words.ts       # perche→perché, cosi→così, ecc.
│   │   │   └── apostrophe-errors.ts    # pò→po', un'altro→un altro
│   │   ├── punctuation/
│   │   │   ├── no-double-hyphen.ts     # -- come punteggiatura
│   │   │   ├── no-em-dash.ts           # — in prosa normale
│   │   │   ├── staccato-sentences.ts   # Frasi-singhiozzo consecutive
│   │   │   └── suspense-ellipsis.ts    # ... per pathos
│   │   ├── lexicon/
│   │   │   ├── slop-phrases.ts         # Frasi AI formulaiche
│   │   │   ├── overused-adjectives.ts  # cruciale/fondamentale oltre soglia
│   │   │   ├── macaronic-anglicisms.ts # approcciare→affrontare ecc.
│   │   │   └── data/
│   │   │       ├── slop-phrases.json
│   │   │       ├── overused-adjectives.json
│   │   │       └── macaronic-anglicisms.json
│   │   └── structure/
│   │       ├── robotic-connectors.ts   # innanzitutto/inoltre/infine loop
│   │       ├── parallel-cliche.ts      # "Non è X. È Y. È Z."
│   │       └── list-overuse.ts         # >60% del doc è liste puntate
│   └── cli/
│       ├── index.ts                     # Entry CLI (commander)
│       ├── commands/
│       │   ├── check.ts
│       │   ├── fix.ts
│       │   ├── init.ts
│       │   └── rules.ts
│       └── formatters/
│           ├── human.ts
│           ├── json.ts
│           └── github.ts
└── tests/
    ├── engine/
    │   ├── lint.test.ts
    │   ├── fix.test.ts
    │   ├── config.test.ts
    │   └── parser/markdown.test.ts
    └── rules/
        ├── orthography/
        │   ├── accented-words.test.ts
        │   └── apostrophe-errors.test.ts
        ├── punctuation/
        │   ├── no-double-hyphen.test.ts
        │   ├── staccato-sentences.test.ts
        │   └── suspense-ellipsis.test.ts
        ├── lexicon/
        │   ├── slop-phrases.test.ts
        │   └── overused-adjectives.test.ts
        └── structure/
            ├── robotic-connectors.test.ts
            └── parallel-cliche.test.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.italiandesloprc.json` (config di esempio)

- [ ] **Step 1: Init git e directory**

```bash
cd /Users/lorenzo/ai-italian-deslop
git init
mkdir -p src/engine/parser src/rules/orthography src/rules/punctuation src/rules/lexicon/data src/rules/structure src/cli/commands src/cli/formatters tests/engine/parser tests/rules/orthography tests/rules/punctuation tests/rules/lexicon tests/rules/structure
```

- [ ] **Step 2: Crea package.json**

```json
{
  "name": "ai-italian-deslop",
  "version": "0.1.0",
  "description": "AI Italian deslopification — keep your Italian text human",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "ai-italian-deslop": "./dist/cli/index.js",
    "ideslop": "./dist/cli/index.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": ["italian", "linter", "ai", "slop", "text-quality", "nlp"],
  "license": "MIT",
  "engines": { "node": ">=20" },
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^12.0.0",
    "glob": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 3: Crea tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Crea vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["src/cli/**", "tests/**"],
    },
  },
});
```

- [ ] **Step 5: Crea tsup.config.ts**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "cli/index": "src/cli/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  shims: true,
});
```

- [ ] **Step 6: Crea .gitignore**

```
node_modules/
dist/
coverage/
*.bak
.DS_Store
```

- [ ] **Step 7: Crea .italiandesloprc.json (esempio)**

```json
{
  "rules": {
    "orthography/accented-words": "error",
    "orthography/apostrophe-errors": "error",
    "punctuation/no-double-hyphen": "error",
    "punctuation/no-em-dash": "warning",
    "punctuation/staccato-sentences": "warning",
    "punctuation/suspense-ellipsis": "warning",
    "lexicon/slop-phrases": "error",
    "lexicon/overused-adjectives": "warning",
    "lexicon/macaronic-anglicisms": "warning",
    "structure/robotic-connectors": "warning",
    "structure/parallel-cliche": "warning",
    "structure/list-overuse": "warning"
  },
  "ignore": ["node_modules", "dist", "*.generated.md"],
  "lexicon": {
    "custom-slop-phrases": []
  }
}
```

- [ ] **Step 8: Installa dipendenze**

```bash
npm install
```

Expected: `node_modules/` creata, nessun errore.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "chore: project scaffold — TypeScript, vitest, tsup, commander"
```

---

## Task 2: Tipi condivisi

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Scrivi il test per i tipi (compilazione)**

```typescript
// tests/engine/lint.test.ts — stub iniziale, espanso nei task successivi
import { describe, it, expect } from "vitest";
import type { Diagnostic, Rule, LintConfig } from "../../src/types.js";

describe("types", () => {
  it("Diagnostic ha tutti i campi attesi", () => {
    const d: Diagnostic = {
      rule: "orthography/accented-words",
      severity: "error",
      line: 1,
      col: 5,
      length: 6,
      message: "Accento mancante",
    };
    expect(d.rule).toBe("orthography/accented-words");
  });
});
```

- [ ] **Step 2: Verifica che il test fallisca (types.ts non esiste)**

```bash
npm test -- tests/engine/lint.test.ts
```

Expected: errore di import.

- [ ] **Step 3: Crea src/types.ts**

```typescript
export type Severity = "error" | "warning" | "off";
export type Category = "orthography" | "punctuation" | "lexicon" | "structure";

export interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

export interface Diagnostic {
  rule: string;
  severity: "error" | "warning";
  line: number;
  col: number;
  length: number;
  message: string;
  suggestion?: string;
  fix?: TextEdit;
}

export interface RuleMeta {
  id: string;
  category: Category;
  severity: "error" | "warning";
  fixable: boolean;
  description: string;
  docsUrl?: string;
}

export interface LintContext {
  config: LintConfig;
  filePath?: string;
}

export interface Rule {
  meta: RuleMeta;
  check(text: string, ctx: LintContext): Diagnostic[];
  fix?(text: string, diagnostic: Diagnostic): string;
}

export interface LintConfig {
  rules: Record<string, Severity>;
  ignore: string[];
  lexicon?: {
    "custom-slop-phrases"?: string[];
  };
}

export interface Segment {
  text: string;
  start: number;
  isCode: boolean;
}
```

- [ ] **Step 4: Verifica che il test passi**

```bash
npm test -- tests/engine/lint.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts tests/engine/lint.test.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: Markdown Parser

**Files:**
- Create: `src/engine/parser/markdown.ts`
- Create: `tests/engine/parser/markdown.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// tests/engine/parser/markdown.test.ts
import { describe, it, expect } from "vitest";
import { segmentText } from "../../../src/engine/parser/markdown.js";

describe("segmentText", () => {
  it("testo semplice è un unico segmento non-code", () => {
    const segs = segmentText("Ciao mondo");
    expect(segs).toHaveLength(1);
    expect(segs[0].isCode).toBe(false);
    expect(segs[0].text).toBe("Ciao mondo");
  });

  it("fenced code block viene marcato come codice", () => {
    const input = "Prima riga\n```\ncodice qui\n```\nDopo";
    const segs = segmentText(input);
    const code = segs.filter((s) => s.isCode);
    const prose = segs.filter((s) => !s.isCode);
    expect(code.length).toBeGreaterThan(0);
    expect(code[0].text).toContain("codice qui");
    expect(prose.some((s) => s.text.includes("Prima riga"))).toBe(true);
    expect(prose.some((s) => s.text.includes("Dopo"))).toBe(true);
  });

  it("inline code viene marcato come codice", () => {
    const input = "Usa `perche` senza accento";
    const segs = segmentText(input);
    const code = segs.filter((s) => s.isCode);
    expect(code.some((s) => s.text.includes("perche"))).toBe(true);
  });

  it("frontmatter YAML è codice", () => {
    const input = "---\ntitle: Test\n---\nTesto normale";
    const segs = segmentText(input);
    const prose = segs.filter((s) => !s.isCode);
    expect(prose.some((s) => s.text.includes("Testo normale"))).toBe(true);
    const front = segs.filter((s) => s.isCode);
    expect(front.some((s) => s.text.includes("title:"))).toBe(true);
  });

  it("start offset è corretto", () => {
    const input = "Abc\n```\ncode\n```\nDef";
    const segs = segmentText(input);
    for (const seg of segs) {
      expect(input.slice(seg.start, seg.start + seg.text.length)).toBe(seg.text);
    }
  });
});
```

- [ ] **Step 2: Verifica che i test falliscano**

```bash
npm test -- tests/engine/parser/markdown.test.ts
```

Expected: errore import.

- [ ] **Step 3: Implementa src/engine/parser/markdown.ts**

```typescript
import type { Segment } from "../../types.js";

export function segmentText(text: string): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;

  // Frontmatter YAML (solo se inizia il file con ---)
  if (text.startsWith("---\n") || text.startsWith("---\r\n")) {
    const end = text.indexOf("\n---", 4);
    if (end !== -1) {
      const fmEnd = end + 4;
      segments.push({ text: text.slice(0, fmEnd), start: 0, isCode: true });
      pos = fmEnd;
    }
  }

  while (pos < text.length) {
    // Fenced code block: ``` o ~~~
    const fenceMatch = /^(`{3,}|~{3,})[^\n]*\n/m.exec(text.slice(pos));
    if (fenceMatch && text.slice(pos).indexOf("\n" + fenceMatch[1].slice(0, 3)) !== -1) {
      const fenceStart = pos + fenceMatch.index;
      const fenceChar = fenceMatch[1].slice(0, 3);
      const closeIdx = text.indexOf("\n" + fenceChar, fenceStart + fenceMatch[0].length);
      if (closeIdx !== -1) {
        // Testo prima del fence
        if (fenceStart > pos) {
          pushProseWithInlineCode(text.slice(pos, fenceStart), pos, segments);
        }
        const blockEnd = closeIdx + fenceChar.length + 1;
        segments.push({
          text: text.slice(fenceStart, blockEnd),
          start: fenceStart,
          isCode: true,
        });
        pos = blockEnd;
        continue;
      }
    }
    // Nessun fence trovato: tutto il resto è prosa (con inline code gestito)
    pushProseWithInlineCode(text.slice(pos), pos, segments);
    break;
  }

  return segments;
}

function pushProseWithInlineCode(text: string, offset: number, segments: Segment[]): void {
  // Divide la stringa in segmenti alternando prosa e `inline code`
  const re = /`[^`\n]+`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ text: text.slice(last, m.index), start: offset + last, isCode: false });
    }
    segments.push({ text: m[0], start: offset + m.index, isCode: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), start: offset + last, isCode: false });
  }
}
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/engine/parser/markdown.test.ts
```

Expected: PASS (5 test).

- [ ] **Step 5: Commit**

```bash
git add src/engine/parser/markdown.ts tests/engine/parser/markdown.test.ts
git commit -m "feat: markdown-aware text segmenter"
```

---

## Task 4: Config Loader

**Files:**
- Create: `src/engine/config.ts`
- Modify: `tests/engine/lint.test.ts`

- [ ] **Step 1: Scrivi il test**

```typescript
// tests/engine/config.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { loadConfig, defaultConfig } from "../../src/engine/config.js";
import { join } from "path";

const TMP = "/tmp/ideslop-test-config";

beforeEach(() => { mkdirSync(TMP, { recursive: true }); });
afterEach(() => { rmSync(TMP, { recursive: true, force: true }); });

describe("loadConfig", () => {
  it("restituisce defaultConfig se nessun file trovato", async () => {
    const cfg = await loadConfig(TMP);
    expect(cfg.ignore).toEqual(defaultConfig.ignore);
  });

  it("carica .italiandesloprc.json e fa merge con defaults", async () => {
    writeFileSync(
      join(TMP, ".italiandesloprc.json"),
      JSON.stringify({ rules: { "structure/list-overuse": "off" } })
    );
    const cfg = await loadConfig(TMP);
    expect(cfg.rules["structure/list-overuse"]).toBe("off");
    expect(cfg.rules["orthography/accented-words"]).toBe("error");
  });
});
```

- [ ] **Step 2: Verifica che fallisca**

```bash
npm test -- tests/engine/config.test.ts
```

Expected: errore import.

- [ ] **Step 3: Implementa src/engine/config.ts**

```typescript
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { LintConfig, Severity } from "../types.js";

export const defaultConfig: LintConfig = {
  rules: {
    "orthography/accented-words": "error",
    "orthography/apostrophe-errors": "error",
    "punctuation/no-double-hyphen": "error",
    "punctuation/no-em-dash": "warning",
    "punctuation/staccato-sentences": "warning",
    "punctuation/suspense-ellipsis": "warning",
    "lexicon/slop-phrases": "error",
    "lexicon/overused-adjectives": "warning",
    "lexicon/macaronic-anglicisms": "warning",
    "structure/robotic-connectors": "warning",
    "structure/parallel-cliche": "warning",
    "structure/list-overuse": "warning",
  },
  ignore: ["node_modules", "dist", "*.generated.md"],
};

export async function loadConfig(cwd: string): Promise<LintConfig> {
  const configPath = join(cwd, ".italiandesloprc.json");
  if (!existsSync(configPath)) return { ...defaultConfig };

  const raw = JSON.parse(readFileSync(configPath, "utf8")) as Partial<LintConfig>;
  return {
    rules: { ...defaultConfig.rules, ...(raw.rules ?? {}) },
    ignore: raw.ignore ?? defaultConfig.ignore,
    lexicon: raw.lexicon ?? {},
  };
}

export function effectiveSeverity(
  ruleId: string,
  config: LintConfig
): "error" | "warning" | "off" {
  return (config.rules[ruleId] ?? "off") as Severity;
}
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/engine/config.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/config.ts tests/engine/config.test.ts
git commit -m "feat: config loader with defaults and merge"
```

---

## Task 5: Lint Engine

**Files:**
- Create: `src/engine/lint.ts`
- Modify: `tests/engine/lint.test.ts`

- [ ] **Step 1: Scrivi il test**

```typescript
// tests/engine/lint.test.ts (aggiorna il file con stub creato in Task 2)
import { describe, it, expect } from "vitest";
import type { Diagnostic, Rule, LintConfig } from "../../src/types.js";
import { lint } from "../../src/engine/lint.js";

const mockConfig: LintConfig = {
  rules: { "test/mock-rule": "error" },
  ignore: [],
};

const mockRule: Rule = {
  meta: {
    id: "test/mock-rule",
    category: "orthography",
    severity: "error",
    fixable: false,
    description: "Test rule",
  },
  check(text, _ctx): Diagnostic[] {
    if (text.includes("TRIGGER")) {
      return [{
        rule: "test/mock-rule",
        severity: "error",
        line: 1,
        col: 1,
        length: 7,
        message: "Triggered",
      }];
    }
    return [];
  },
};

describe("lint", () => {
  it("restituisce array vuoto se nessuna regola scatta", () => {
    const diags = lint("Testo pulito.", [mockRule], mockConfig);
    expect(diags).toHaveLength(0);
  });

  it("restituisce diagnostiche quando la regola scatta", () => {
    const diags = lint("Testo TRIGGER qui.", [mockRule], mockConfig);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe("test/mock-rule");
  });

  it("non esegue la regola se è 'off' in config", () => {
    const cfg: LintConfig = { rules: { "test/mock-rule": "off" }, ignore: [] };
    const diags = lint("TRIGGER", [mockRule], cfg);
    expect(diags).toHaveLength(0);
  });

  it("non analizza blocchi di codice", () => {
    const text = "```\nTRIGGER\n```";
    const diags = lint(text, [mockRule], mockConfig);
    expect(diags).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Verifica che i test falliscano**

```bash
npm test -- tests/engine/lint.test.ts
```

Expected: errore import `lint`.

- [ ] **Step 3: Implementa src/engine/lint.ts**

```typescript
import type { Diagnostic, Rule, LintConfig } from "../types.js";
import { segmentText } from "./parser/markdown.js";
import { effectiveSeverity } from "./config.js";

export function lint(
  text: string,
  rules: Rule[],
  config: LintConfig,
  filePath?: string
): Diagnostic[] {
  const segments = segmentText(text);
  const proseSegments = segments.filter((s) => !s.isCode);
  const diagnostics: Diagnostic[] = [];
  const ctx = { config, filePath };

  for (const rule of rules) {
    const severity = effectiveSeverity(rule.meta.id, config);
    if (severity === "off") continue;

    for (const seg of proseSegments) {
      const segDiags = rule.check(seg.text, ctx);
      for (const d of segDiags) {
        // Aggiusta le coordinate relative al segmento all'offset assoluto nel testo
        diagnostics.push({
          ...d,
          severity: severity === "error" ? "error" : "warning",
          ...absolutePosition(text, seg.start, d.line, d.col),
        });
      }
    }
  }

  return diagnostics.sort((a, b) => a.line - b.line || a.col - b.col);
}

function absolutePosition(
  fullText: string,
  segStart: number,
  relLine: number,
  relCol: number
): { line: number; col: number } {
  const prefix = fullText.slice(0, segStart);
  const baseLines = prefix.split("\n").length;
  const lastNewline = prefix.lastIndexOf("\n");
  const baseCol = segStart - lastNewline - 1;

  if (relLine === 1) {
    return { line: baseLines, col: baseCol + relCol };
  }
  return { line: baseLines + relLine - 1, col: relCol };
}
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/engine/lint.test.ts
```

Expected: PASS (4 test).

- [ ] **Step 5: Commit**

```bash
git add src/engine/lint.ts tests/engine/lint.test.ts
git commit -m "feat: lint engine with markdown-aware rule execution"
```

---

## Task 6: Fix Engine

**Files:**
- Create: `src/engine/fix.ts`
- Create: `tests/engine/fix.test.ts`

- [ ] **Step 1: Scrivi il test**

```typescript
// tests/engine/fix.test.ts
import { describe, it, expect } from "vitest";
import type { Diagnostic } from "../../src/types.js";
import { applyFixes } from "../../src/engine/fix.js";

describe("applyFixes", () => {
  it("applica un fix semplice", () => {
    const text = "Scrivi perche vuoi.";
    const diags: Diagnostic[] = [{
      rule: "orthography/accented-words",
      severity: "error",
      line: 1, col: 8, length: 6,
      message: "perche → perché",
      fix: { start: 7, end: 13, replacement: "perché" },
    }];
    const result = applyFixes(text, diags);
    expect(result).toBe("Scrivi perché vuoi.");
  });

  it("applica fix multipli in ordine corretto (dal fondo al fronte)", () => {
    const text = "perche e cosi";
    const diags: Diagnostic[] = [
      {
        rule: "r1", severity: "error", line: 1, col: 1, length: 6,
        message: "", fix: { start: 0, end: 6, replacement: "perché" },
      },
      {
        rule: "r2", severity: "error", line: 1, col: 10, length: 4,
        message: "", fix: { start: 9, end: 13, replacement: "così" },
      },
    ];
    const result = applyFixes(text, diags);
    expect(result).toBe("perché e così");
  });

  it("salta diagnostiche senza fix", () => {
    const text = "Testo invariato";
    const diags: Diagnostic[] = [{
      rule: "r", severity: "warning", line: 1, col: 1, length: 5, message: "test",
    }];
    expect(applyFixes(text, diags)).toBe(text);
  });
});
```

- [ ] **Step 2: Verifica fallimento**

```bash
npm test -- tests/engine/fix.test.ts
```

- [ ] **Step 3: Implementa src/engine/fix.ts**

```typescript
import type { Diagnostic } from "../types.js";

export function applyFixes(text: string, diagnostics: Diagnostic[]): string {
  const fixable = diagnostics
    .filter((d) => d.fix !== undefined)
    .sort((a, b) => b.fix!.start - a.fix!.start); // dal fondo per non invalidare offset

  let result = text;
  for (const diag of fixable) {
    const { start, end, replacement } = diag.fix!;
    result = result.slice(0, start) + replacement + result.slice(end);
  }
  return result;
}
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/engine/fix.test.ts
```

Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add src/engine/fix.ts tests/engine/fix.test.ts
git commit -m "feat: fix engine — applies TextEdits from fondo a fronte"
```

---

## Task 7: Regole Ortografia — Parole sempre accentate

**Files:**
- Create: `src/rules/orthography/accented-words.ts`
- Create: `tests/rules/orthography/accented-words.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// tests/rules/orthography/accented-words.test.ts
import { describe, it, expect } from "vitest";
import { accentedWordsRule } from "../../../src/rules/orthography/accented-words.js";
import type { LintContext } from "../../../src/types.js";

const ctx: LintContext = { config: { rules: {}, ignore: [] } };

describe("accented-words", () => {
  it("rileva 'perche' senza accento", () => {
    const d = accentedWordsRule.check("Lo faccio perche voglio.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].fix?.replacement).toBe("perché");
  });

  it("rileva 'cosi' senza accento", () => {
    const d = accentedWordsRule.check("Era cosi facile.", ctx);
    expect(d.some((x) => x.fix?.replacement === "così")).toBe(true);
  });

  it("non rileva 'perché' già corretto", () => {
    const d = accentedWordsRule.check("Lo faccio perché voglio.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva 'piu' senza accento", () => {
    const d = accentedWordsRule.check("Voglio piu tempo.", ctx);
    expect(d.some((x) => x.fix?.replacement === "più")).toBe(true);
  });

  it("rileva 'e' isolata che dovrebbe essere 'è'", () => {
    const d = accentedWordsRule.check("Questo e un test.", ctx);
    expect(d.some((x) => x.rule === "orthography/accented-words")).toBe(true);
  });

  it("non rileva 'e' in 'e poi' (congiunzione valida)", () => {
    const d = accentedWordsRule.check("Mangia e poi dorme.", ctx);
    expect(d).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Verifica fallimento**

```bash
npm test -- tests/rules/orthography/accented-words.test.ts
```

- [ ] **Step 3: Implementa src/rules/orthography/accented-words.ts**

```typescript
import type { Rule, Diagnostic, LintContext } from "../../types.js";

// Parole che in italiano richiedono sempre l'accento in quella forma
const ALWAYS_ACCENTED: Array<{ wrong: RegExp; right: string }> = [
  { wrong: /\bperche\b/gi, right: "perché" },
  { wrong: /\bperche'\b/gi, right: "perché" },
  { wrong: /\bcosi\b/gi, right: "così" },
  { wrong: /\bpiu\b/gi, right: "più" },
  { wrong: /\bgia\b/gi, right: "già" },
  { wrong: /\bpero\b/gi, right: "però" },
  { wrong: /\bcioe\b/gi, right: "cioè" },
  { wrong: /\bcioe'\b/gi, right: "cioè" },
  { wrong: /\bpuo\b/gi, right: "può" },
  { wrong: /\bpuo'\b/gi, right: "può" },
  { wrong: /\bpoche'\b/gi, right: "poiché" },
  { wrong: /\bpoiche\b/gi, right: "poiché" },
  { wrong: /\baffinche\b/gi, right: "affinché" },
  { wrong: /\bfinche\b/gi, right: "finché" },
  { wrong: /\bbenche\b/gi, right: "benché" },
  { wrong: /\bsebben\b/gi, right: "sebbene" }, // non accento ma ortografia
  { wrong: /\bcafe\b/gi, right: "caffè" },
  { wrong: /\bvirtu\b/gi, right: "virtù" },
  { wrong: /\bcitta\b/gi, right: "città" },
  { wrong: /\buniversita\b/gi, right: "università" },
  { wrong: /\battivita\b/gi, right: "attività" },
  { wrong: /\bqualita\b/gi, right: "qualità" },
  { wrong: /\bpossibilita\b/gi, right: "possibilità" },
  { wrong: /\bcapacita\b/gi, right: "capacità" },
];

// 'e' isolata prima di articolo/aggettivo → probabilmente 'è'
// Pattern: "e un", "e il", "e la", "e lo", "e una", "e l'"
const E_SOLO_PATTERN = /\be (un[ao]?|il|la|lo|l'|questo|questa|tutto|tutta|sempre|solo|anche|già)\b/gi;

function getLineCol(text: string, index: number): { line: number; col: number } {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const accentedWordsRule: Rule = {
  meta: {
    id: "orthography/accented-words",
    category: "orthography",
    severity: "error",
    fixable: true,
    description: "Parole italiane che richiedono sempre l'accento",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const { wrong, right } of ALWAYS_ACCENTED) {
      wrong.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = wrong.exec(text)) !== null) {
        const { line, col } = getLineCol(text, m.index);
        diagnostics.push({
          rule: "orthography/accented-words",
          severity: "error",
          line, col,
          length: m[0].length,
          message: `Accento mancante: "${m[0]}" → "${right}"`,
          suggestion: right,
          fix: { start: m.index, end: m.index + m[0].length, replacement: right },
        });
      }
    }

    // 'e' isolata
    E_SOLO_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = E_SOLO_PATTERN.exec(text)) !== null) {
      const { line, col } = getLineCol(text, m.index);
      diagnostics.push({
        rule: "orthography/accented-words",
        severity: "error",
        line, col: col,
        length: 1,
        message: `"e" isolata: probabilmente "è" (verbo essere)`,
        suggestion: "è",
        fix: { start: m.index, end: m.index + 1, replacement: "è" },
      });
    }

    return diagnostics;
  },
};
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/rules/orthography/accented-words.test.ts
```

Expected: PASS (6 test).

- [ ] **Step 5: Commit**

```bash
git add src/rules/orthography/accented-words.ts tests/rules/orthography/accented-words.test.ts
git commit -m "feat: orthography/accented-words rule"
```

---

## Task 8: Regole Ortografia — Errori di apostrofo

**Files:**
- Create: `src/rules/orthography/apostrophe-errors.ts`
- Create: `tests/rules/orthography/apostrophe-errors.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// tests/rules/orthography/apostrophe-errors.test.ts
import { describe, it, expect } from "vitest";
import { apostropheErrorsRule } from "../../../src/rules/orthography/apostrophe-errors.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("apostrophe-errors", () => {
  it("rileva 'pò' sbagliato", () => {
    const d = apostropheErrorsRule.check("Un pò di tempo.", ctx);
    expect(d.some((x) => x.fix?.replacement === "po'")).toBe(true);
  });

  it("non rileva 'po'' corretto", () => {
    const d = apostropheErrorsRule.check("Un po' di tempo.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva 'un'altro' sbagliato (maschile)", () => {
    const d = apostropheErrorsRule.check("È un'altro problema.", ctx);
    expect(d.some((x) => x.fix?.replacement === "un altro")).toBe(true);
  });

  it("non rileva 'un'altra' (femminile è corretto con apostrofo)", () => {
    const d = apostropheErrorsRule.check("È un'altra storia.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva 'qual'è' sbagliato", () => {
    const d = apostropheErrorsRule.check("Qual'è il problema?", ctx);
    expect(d.some((x) => x.fix?.replacement === "qual è")).toBe(true);
  });
});
```

- [ ] **Step 2: Verifica fallimento**

```bash
npm test -- tests/rules/orthography/apostrophe-errors.test.ts
```

- [ ] **Step 3: Implementa src/rules/orthography/apostrophe-errors.ts**

```typescript
import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number): { line: number; col: number } {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

const PATTERNS: Array<{ wrong: RegExp; right: string; message: string }> = [
  {
    wrong: /\bpò\b/g,
    right: "po'",
    message: '"pò" non esiste in italiano: usa "po\'"',
  },
  {
    wrong: /\bun'altro\b/gi,
    right: "un altro",
    message: '"un\'altro" sbagliato: il maschile non elide → "un altro"',
  },
  {
    wrong: /\bqual'è\b/gi,
    right: "qual è",
    message: '"qual\'è" scorretto: "qual è" non vuole apostrofo',
  },
  {
    wrong: /\btal'è\b/gi,
    right: "tal è",
    message: '"tal\'è" scorretto: usa "tal è"',
  },
];

export const apostropheErrorsRule: Rule = {
  meta: {
    id: "orthography/apostrophe-errors",
    category: "orthography",
    severity: "error",
    fixable: true,
    description: "Errori di apostrofo tipici dell'AI italiano",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const { wrong, right, message } of PATTERNS) {
      wrong.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = wrong.exec(text)) !== null) {
        const { line, col } = getLineCol(text, m.index);
        diagnostics.push({
          rule: "orthography/apostrophe-errors",
          severity: "error",
          line, col,
          length: m[0].length,
          message,
          suggestion: right,
          fix: { start: m.index, end: m.index + m[0].length, replacement: right },
        });
      }
    }
    return diagnostics;
  },
};
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/rules/orthography/apostrophe-errors.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/rules/orthography/apostrophe-errors.ts tests/rules/orthography/apostrophe-errors.test.ts
git commit -m "feat: orthography/apostrophe-errors rule (pò, un'altro, qual'è)"
```

---

## Task 9: Regole Punteggiatura — Em-dash e doppio trattino

**Files:**
- Create: `src/rules/punctuation/no-double-hyphen.ts`
- Create: `src/rules/punctuation/no-em-dash.ts`
- Create: `tests/rules/punctuation/no-double-hyphen.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// tests/rules/punctuation/no-double-hyphen.test.ts
import { describe, it, expect } from "vitest";
import { noDoubleHyphenRule } from "../../../src/rules/punctuation/no-double-hyphen.js";
import { noEmDashRule } from "../../../src/rules/punctuation/no-em-dash.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("no-double-hyphen", () => {
  it("rileva '--' come punteggiatura", () => {
    const d = noDoubleHyphenRule.check("Era bello -- forse troppo.", ctx);
    expect(d).toHaveLength(1);
    expect(d[0].severity).toBe("error");
  });

  it("non rileva '--' in contesto tecnico (argomenti CLI)", () => {
    // I blocchi code sono già esclusi dal parser; qui testiamo solo la regola su prosa
    const d = noDoubleHyphenRule.check("Testo normale senza doppiotrattino.", ctx);
    expect(d).toHaveLength(0);
  });

  it("suggerisce sostituzione", () => {
    const d = noDoubleHyphenRule.check("Era bello -- molto.", ctx);
    expect(d[0].message).toContain("--");
  });
});

describe("no-em-dash", () => {
  it("rileva em-dash '—' come warning", () => {
    const d = noEmDashRule.check("Era bello — molto.", ctx);
    expect(d).toHaveLength(1);
    expect(d[0].severity).toBe("warning");
  });
});
```

- [ ] **Step 2: Verifica fallimento**

```bash
npm test -- tests/rules/punctuation/no-double-hyphen.test.ts
```

- [ ] **Step 3: Implementa no-double-hyphen.ts**

```typescript
// src/rules/punctuation/no-double-hyphen.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const noDoubleHyphenRule: Rule = {
  meta: {
    id: "punctuation/no-double-hyphen",
    category: "punctuation",
    severity: "error",
    fixable: false,
    description: 'Doppio trattino "--" usato come punteggiatura',
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const re = /\s--\s/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const { line, col } = getLineCol(text, m.index);
      diagnostics.push({
        rule: "punctuation/no-double-hyphen",
        severity: "error",
        line, col: col + 1,
        length: 2,
        message: '"--" come punteggiatura è slop AI: usa una virgola, un punto o una parentesi',
        suggestion: ",",
      });
    }
    return diagnostics;
  },
};
```

- [ ] **Step 4: Implementa no-em-dash.ts**

```typescript
// src/rules/punctuation/no-em-dash.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const noEmDashRule: Rule = {
  meta: {
    id: "punctuation/no-em-dash",
    category: "punctuation",
    severity: "warning",
    fixable: false,
    description: 'Em-dash "—" in prosa italiana: segnale tipico di AI',
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const re = /—/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const { line, col } = getLineCol(text, m.index);
      diagnostics.push({
        rule: "punctuation/no-em-dash",
        severity: "warning",
        line, col,
        length: 1,
        message: '"—" (em-dash) è raro in italiano standard: valuta virgola o parentesi',
      });
    }
    return diagnostics;
  },
};
```

- [ ] **Step 5: Verifica che i test passino**

```bash
npm test -- tests/rules/punctuation/no-double-hyphen.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/rules/punctuation/no-double-hyphen.ts src/rules/punctuation/no-em-dash.ts tests/rules/punctuation/no-double-hyphen.test.ts
git commit -m "feat: punctuation rules — no-double-hyphen (error), no-em-dash (warning)"
```

---

## Task 10: Regole Punteggiatura — Frasi-singhiozzo ed ellissi

**Files:**
- Create: `src/rules/punctuation/staccato-sentences.ts`
- Create: `src/rules/punctuation/suspense-ellipsis.ts`
- Create: `tests/rules/punctuation/staccato-sentences.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// tests/rules/punctuation/staccato-sentences.test.ts
import { describe, it, expect } from "vitest";
import { staccatoSentencesRule } from "../../../src/rules/punctuation/staccato-sentences.js";
import { suspenseEllipsisRule } from "../../../src/rules/punctuation/suspense-ellipsis.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("staccato-sentences", () => {
  it("rileva tre frasi brevi consecutive", () => {
    const text = "Non è solo questo. È di più. È tutto.";
    const d = staccatoSentencesRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su testo narrativo normale", () => {
    const text = "La mattina si svegliò presto. Guardò fuori dalla finestra e vide che stava piovendo. Decise di restare a casa e leggere un libro.";
    const d = staccatoSentencesRule.check(text, ctx);
    expect(d).toHaveLength(0);
  });
});

describe("suspense-ellipsis", () => {
  it("rileva '...' per suspense in prosa", () => {
    const d = suspenseEllipsisRule.check("Non ci crederai mai... era già lì.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non rileva '…' in dialogo o citazione (tra virgolette)", () => {
    const d = suspenseEllipsisRule.check('Disse: "Aspetta..."', ctx);
    expect(d).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Verifica fallimento**

```bash
npm test -- tests/rules/punctuation/staccato-sentences.test.ts
```

- [ ] **Step 3: Implementa staccato-sentences.ts**

```typescript
// src/rules/punctuation/staccato-sentences.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const staccatoSentencesRule: Rule = {
  meta: {
    id: "punctuation/staccato-sentences",
    category: "punctuation",
    severity: "warning",
    fixable: false,
    description: "3+ frasi brevi consecutive (≤8 parole): pattern AI cinematografico",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    // Divide in frasi su punto/punto esclamativo/punto interrogativo
    const sentenceRe = /[^.!?]+[.!?]/g;
    const sentences: Array<{ text: string; index: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = sentenceRe.exec(text)) !== null) {
      sentences.push({ text: m[0].trim(), index: m.index });
    }

    const diagnostics: Diagnostic[] = [];
    let streak = 0;
    let streakStart = -1;

    for (let i = 0; i < sentences.length; i++) {
      const words = sentences[i].text.split(/\s+/).filter(Boolean).length;
      if (words <= 8) {
        if (streak === 0) streakStart = sentences[i].index;
        streak++;
        if (streak >= 3) {
          const { line, col } = getLineCol(text, streakStart);
          diagnostics.push({
            rule: "punctuation/staccato-sentences",
            severity: "warning",
            line, col,
            length: sentences[i].index + sentences[i].text.length - streakStart,
            message: `${streak} frasi brevi consecutive: pattern AI cinematografico ("Non è solo questo. È di più.")`,
          });
          break;
        }
      } else {
        streak = 0;
        streakStart = -1;
      }
    }

    return diagnostics;
  },
};
```

- [ ] **Step 4: Implementa suspense-ellipsis.ts**

```typescript
// src/rules/punctuation/suspense-ellipsis.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const suspenseEllipsisRule: Rule = {
  meta: {
    id: "punctuation/suspense-ellipsis",
    category: "punctuation",
    severity: "warning",
    fixable: true,
    description: '"..." usato per effetto drammatico fuori da dialogo/citazione',
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    // Rimuovi temporaneamente contenuto tra virgolette per evitare falsi positivi
    const stripped = text.replace(/"[^"]*"/g, (m) => " ".repeat(m.length));
    const re = /\.{3}|…/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(stripped)) !== null) {
      const { line, col } = getLineCol(text, m.index);
      diagnostics.push({
        rule: "punctuation/suspense-ellipsis",
        severity: "warning",
        line, col,
        length: m[0].length,
        message: '"..." per suspense è slop AI: usa un punto fermo',
        suggestion: ".",
        fix: { start: m.index, end: m.index + m[0].length, replacement: "." },
      });
    }
    return diagnostics;
  },
};
```

- [ ] **Step 5: Verifica che i test passino**

```bash
npm test -- tests/rules/punctuation/staccato-sentences.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/rules/punctuation/staccato-sentences.ts src/rules/punctuation/suspense-ellipsis.ts tests/rules/punctuation/staccato-sentences.test.ts
git commit -m "feat: punctuation rules — staccato-sentences, suspense-ellipsis"
```

---

## Task 11: Dati Lessico — slop-phrases.json e regola

**Files:**
- Create: `src/rules/lexicon/data/slop-phrases.json`
- Create: `src/rules/lexicon/slop-phrases.ts`
- Create: `tests/rules/lexicon/slop-phrases.test.ts`

- [ ] **Step 1: Crea src/rules/lexicon/data/slop-phrases.json**

```json
[
  "vale la pena notare",
  "è importante sottolineare",
  "è doveroso precisare",
  "è fondamentale capire che",
  "è cruciale comprendere",
  "non possiamo non citare",
  "merita di essere menzionato",
  "merita attenzione",
  "in sintesi",
  "in conclusione",
  "in ultima analisi",
  "alla luce di quanto detto",
  "alla luce di ciò",
  "alla luce di quanto emerso",
  "come accennato in precedenza",
  "come già detto",
  "come già anticipato",
  "come vedremo",
  "come si può notare",
  "come emerge chiaramente",
  "tuffiamoci nel mondo di",
  "tuffiamoci in",
  "approfondiamo insieme",
  "approfondiamo il tema",
  "esploriamo insieme",
  "navighiamo attraverso",
  "immergiamoci in",
  "scopriamo insieme",
  "non si tratta solo di",
  "non è solo una questione di",
  "ma è molto di più",
  "è qualcosa di più profondo",
  "abbracciare il concetto di",
  "navigare tra le sfide",
  "portare valore aggiunto",
  "creare valore",
  "fare la differenza",
  "a livello olistico",
  "in modo olistico",
  "in modo sinergico",
  "in modo proattivo",
  "nel panorama attuale",
  "nel contesto odierno",
  "nel mondo moderno",
  "nell'era digitale",
  "nell'odierno contesto",
  "tenendo a mente tutto ciò",
  "fatte queste premesse",
  "detto questo",
  "tutto sommato",
  "in buona sostanza",
  "per dirla in breve",
  "senza girarci intorno",
  "andando al nocciolo della questione",
  "il quadro che emerge",
  "il filo conduttore",
  "emerge chiaramente",
  "è indubbio che",
  "non v'è dubbio che",
  "è sotto gli occhi di tutti",
  "è opportuno ricordare",
  "è bene sottolineare",
  "vale la pena soffermarsi su",
  "a questo punto",
  "a tal proposito",
  "in questo contesto",
  "come dicevamo",
  "riprendendo il filo",
  "strettamente correlato a questo",
  "in ultima istanza",
  "ad ogni modo",
  "in definitiva",
  "che ci piaccia o no",
  "volenti o nolenti",
  "è innegabile che",
  "non possiamo ignorare il fatto che",
  "è fuor di dubbio",
  "risulta evidente che",
  "appare chiaro che",
  "non si può fare a meno di notare"
]
```

- [ ] **Step 2: Scrivi il test**

```typescript
// tests/rules/lexicon/slop-phrases.test.ts
import { describe, it, expect } from "vitest";
import { slopPhrasesRule } from "../../../src/rules/lexicon/slop-phrases.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("slop-phrases", () => {
  it("rileva 'vale la pena notare'", () => {
    const d = slopPhrasesRule.check("Vale la pena notare che questo è un test.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].rule).toBe("lexicon/slop-phrases");
  });

  it("rileva 'in sintesi'", () => {
    const d = slopPhrasesRule.check("In sintesi, il risultato è positivo.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su testo pulito", () => {
    const d = slopPhrasesRule.check("Il gatto mangiò il topo. Era contento.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva frasi case-insensitive", () => {
    const d = slopPhrasesRule.check("È IMPORTANTE SOTTOLINEARE che...", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("include frasi custom dalla config", () => {
    const cfg = {
      config: {
        rules: {},
        ignore: [],
        lexicon: { "custom-slop-phrases": ["parola maledetta"] },
      },
    };
    const d = slopPhrasesRule.check("Questa è una parola maledetta nel testo.", cfg);
    expect(d.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Verifica fallimento**

```bash
npm test -- tests/rules/lexicon/slop-phrases.test.ts
```

- [ ] **Step 4: Implementa src/rules/lexicon/slop-phrases.ts**

```typescript
import type { Rule, Diagnostic, LintContext } from "../../types.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const SLOP_PHRASES: string[] = require("./data/slop-phrases.json");

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

function buildRegex(phrases: string[]): RegExp {
  const escaped = phrases
    .sort((a, b) => b.length - a.length) // più lungo prima per evitare match parziali
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
}

export const slopPhrasesRule: Rule = {
  meta: {
    id: "lexicon/slop-phrases",
    category: "lexicon",
    severity: "error",
    fixable: false,
    description: "Frasi formulaiche tipiche dell'AI in italiano",
  },

  check(text: string, ctx: LintContext): Diagnostic[] {
    const custom = ctx.config.lexicon?.["custom-slop-phrases"] ?? [];
    const allPhrases = [...SLOP_PHRASES, ...custom];
    const re = buildRegex(allPhrases);
    const diagnostics: Diagnostic[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const { line, col } = getLineCol(text, m.index);
      diagnostics.push({
        rule: "lexicon/slop-phrases",
        severity: "error",
        line, col,
        length: m[0].length,
        message: `Frase AI formulaica: "${m[0].toLowerCase()}"`,
      });
    }
    return diagnostics;
  },
};
```

- [ ] **Step 5: Verifica che i test passino**

```bash
npm test -- tests/rules/lexicon/slop-phrases.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/rules/lexicon/data/slop-phrases.json src/rules/lexicon/slop-phrases.ts tests/rules/lexicon/slop-phrases.test.ts
git commit -m "feat: lexicon/slop-phrases rule with 75+ Italian AI phrases"
```

---

## Task 12: Dati Lessico — Aggettivi overused e anglicismi

**Files:**
- Create: `src/rules/lexicon/data/overused-adjectives.json`
- Create: `src/rules/lexicon/data/macaronic-anglicisms.json`
- Create: `src/rules/lexicon/overused-adjectives.ts`
- Create: `src/rules/lexicon/macaronic-anglicisms.ts`
- Create: `tests/rules/lexicon/overused-adjectives.test.ts`

- [ ] **Step 1: Crea i file di dati**

`src/rules/lexicon/data/overused-adjectives.json`:
```json
{
  "threshold": 2,
  "adjectives": [
    "cruciale", "fondamentale", "imprescindibile", "innovativo",
    "rivoluzionario", "straordinario", "eccezionale", "unico",
    "irrinunciabile", "imperdibile", "paradigmatico", "sinergico",
    "olistico", "proattivo", "disruptivo", "trasformativo"
  ]
}
```

`src/rules/lexicon/data/macaronic-anglicisms.json`:
```json
[
  { "wrong": "approcciare", "right": "affrontare" },
  { "wrong": "approccio", "right": "approccio (ok se termine tecnico, altrimenti: metodo, modo)" },
  { "wrong": "deliverable", "right": "risultato atteso, prodotto" },
  { "wrong": "leveraging", "right": "sfruttando, usando" },
  { "wrong": "leverage", "right": "sfruttare, usare" },
  { "wrong": "stakeholder", "right": "parti interessate, interlocutori (se non è termine tecnico)" },
  { "wrong": "mindset", "right": "mentalità, atteggiamento" },
  { "wrong": "roadmap", "right": "piano, tabella di marcia (se non è termine tecnico)" },
  { "wrong": "brainstorming", "right": "brainstorming (accettabile come prestito)" },
  { "wrong": "workflow", "right": "flusso di lavoro, processo" },
  { "wrong": "framework", "right": "framework (accettabile in contesto tecnico)" },
  { "wrong": "best practice", "right": "buona prassi, pratica ottimale" },
  { "wrong": "pain point", "right": "punto critico, problema" },
  { "wrong": "game changer", "right": "svolta, cambiamento significativo" },
  { "wrong": "win-win", "right": "vantaggioso per entrambi, reciprocamente vantaggioso" }
]
```

- [ ] **Step 2: Scrivi il test**

```typescript
// tests/rules/lexicon/overused-adjectives.test.ts
import { describe, it, expect } from "vitest";
import { overusedAdjectivesRule } from "../../../src/rules/lexicon/overused-adjectives.js";
import { macaronicAnglicismsRule } from "../../../src/rules/lexicon/macaronic-anglicisms.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("overused-adjectives", () => {
  it("non scatta con un solo uso di 'cruciale'", () => {
    const d = overusedAdjectivesRule.check("Questo è un punto cruciale.", ctx);
    expect(d).toHaveLength(0);
  });

  it("scatta quando 'cruciale' supera la soglia", () => {
    const text = "Un punto cruciale. Un altro aspetto cruciale. Ancora cruciale.";
    const d = overusedAdjectivesRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });
});

describe("macaronic-anglicisms", () => {
  it("rileva 'approcciare'", () => {
    const d = macaronicAnglicismsRule.check("Dobbiamo approcciare il problema.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].suggestion).toContain("affrontare");
  });

  it("rileva 'deliverable'", () => {
    const d = macaronicAnglicismsRule.check("Il deliverable è pronto.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Verifica fallimento**

```bash
npm test -- tests/rules/lexicon/overused-adjectives.test.ts
```

- [ ] **Step 4: Implementa overused-adjectives.ts**

```typescript
// src/rules/lexicon/overused-adjectives.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const DATA: { threshold: number; adjectives: string[] } = require("./data/overused-adjectives.json");

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const overusedAdjectivesRule: Rule = {
  meta: {
    id: "lexicon/overused-adjectives",
    category: "lexicon",
    severity: "warning",
    fixable: false,
    description: "Aggettivi inflazionati oltre soglia per 1000 parole",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const wordCount = text.split(/\s+/).length;
    const maxAllowed = Math.max(DATA.threshold, Math.floor((wordCount / 1000) * DATA.threshold));

    for (const adj of DATA.adjectives) {
      const re = new RegExp(`\\b${adj}\\b`, "gi");
      const matches: number[] = [];
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) matches.push(m.index);

      if (matches.length > maxAllowed) {
        const { line, col } = getLineCol(text, matches[maxAllowed]);
        diagnostics.push({
          rule: "lexicon/overused-adjectives",
          severity: "warning",
          line, col,
          length: adj.length,
          message: `"${adj}" usato ${matches.length} volte: aggettivo inflazionato dall'AI`,
        });
      }
    }
    return diagnostics;
  },
};
```

- [ ] **Step 5: Implementa macaronic-anglicisms.ts**

```typescript
// src/rules/lexicon/macaronic-anglicisms.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ANGLICISMS: Array<{ wrong: string; right: string }> = require("./data/macaronic-anglicisms.json");

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const macaronicAnglicismsRule: Rule = {
  meta: {
    id: "lexicon/macaronic-anglicisms",
    category: "lexicon",
    severity: "warning",
    fixable: false,
    description: "Calchi e anglicismi maccheronici in italiano",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    for (const { wrong, right } of ANGLICISMS) {
      const re = new RegExp(`\\b${wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const { line, col } = getLineCol(text, m.index);
        diagnostics.push({
          rule: "lexicon/macaronic-anglicisms",
          severity: "warning",
          line, col,
          length: m[0].length,
          message: `Anglicismo: "${m[0]}" → considera: ${right}`,
          suggestion: right,
        });
      }
    }
    return diagnostics;
  },
};
```

- [ ] **Step 6: Verifica che i test passino**

```bash
npm test -- tests/rules/lexicon/overused-adjectives.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add src/rules/lexicon/ tests/rules/lexicon/overused-adjectives.test.ts
git commit -m "feat: lexicon rules — overused-adjectives, macaronic-anglicisms"
```

---

## Task 13: Regole Struttura

**Files:**
- Create: `src/rules/structure/robotic-connectors.ts`
- Create: `src/rules/structure/parallel-cliche.ts`
- Create: `src/rules/structure/list-overuse.ts`
- Create: `tests/rules/structure/robotic-connectors.test.ts`

- [ ] **Step 1: Scrivi i test**

```typescript
// tests/rules/structure/robotic-connectors.test.ts
import { describe, it, expect } from "vitest";
import { roboticConnectorsRule } from "../../../src/rules/structure/robotic-connectors.js";
import { parallelClicheRule } from "../../../src/rules/structure/parallel-cliche.js";
import { listOveruseRule } from "../../../src/rules/structure/list-overuse.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("robotic-connectors", () => {
  it("rileva schema innanzitutto/inoltre/infine", () => {
    const text = "Innanzitutto, questo è il primo punto.\n\nInoltre, aggiungiamo che.\n\nInfine, concludiamo.";
    const d = roboticConnectorsRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su testo senza lo schema", () => {
    const text = "Il gatto mangiò. Il cane dormiva. La sera arrivò presto.";
    const d = roboticConnectorsRule.check(text, ctx);
    expect(d).toHaveLength(0);
  });
});

describe("parallel-cliche", () => {
  it("rileva costruzione parallela meccanica", () => {
    const text = "Non è solo un tool. È una filosofia. È un approccio.";
    const d = parallelClicheRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });
});

describe("list-overuse", () => {
  it("rileva documento con troppi bullet points", () => {
    const text = "Intro.\n\n- Punto uno\n- Punto due\n- Punto tre\n- Punto quattro\n- Punto cinque\n\nFine.";
    const d = listOveruseRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su documento misto", () => {
    const text = "Molto testo narrativo qui che continua per diverse righe e parole. Poi un elenco:\n\n- Punto\n\nAltra prosa.";
    const d = listOveruseRule.check(text, ctx);
    expect(d).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Verifica fallimento**

```bash
npm test -- tests/rules/structure/robotic-connectors.test.ts
```

- [ ] **Step 3: Implementa i tre file**

```typescript
// src/rules/structure/robotic-connectors.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

const CONNECTORS = ["innanzitutto", "in primo luogo", "inoltre", "in secondo luogo", "infine", "in conclusione"];

export const roboticConnectorsRule: Rule = {
  meta: {
    id: "structure/robotic-connectors",
    category: "structure",
    severity: "warning",
    fixable: false,
    description: "Struttura robotica: innanzitutto/inoltre/infine come unico scheletro",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const found = CONNECTORS.filter((c) =>
      new RegExp(`\\b${c}\\b`, "i").test(text)
    );
    if (found.length < 3) return [];

    const before = text.slice(0, text.search(new RegExp(`\\b${found[0]}\\b`, "i")));
    const lines = before.split("\n");
    return [{
      rule: "structure/robotic-connectors",
      severity: "warning",
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
      length: found[0].length,
      message: `Schema AI: "${found.join(" → ")}" come unica struttura del testo`,
    }];
  },
};
```

```typescript
// src/rules/structure/parallel-cliche.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

export const parallelClicheRule: Rule = {
  meta: {
    id: "structure/parallel-cliche",
    category: "structure",
    severity: "warning",
    fixable: false,
    description: 'Costruzione parallela AI: "Non è X. È Y. È Z."',
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    // Cerca 3+ frasi consecutive che iniziano con "È " o "Non è "
    const re = /(\b(Non\s+)?[ÈE][\''']?\s+\w[^.!?]*[.!?]\s*){3,}/gi;
    const diagnostics: Diagnostic[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const before = text.slice(0, m.index);
      const lines = before.split("\n");
      diagnostics.push({
        rule: "structure/parallel-cliche",
        severity: "warning",
        line: lines.length,
        col: lines[lines.length - 1].length + 1,
        length: m[0].length,
        message: 'Costruzione parallela meccanica ("Non è solo X. È Y. È Z."): pattern AI',
      });
    }
    return diagnostics;
  },
};
```

```typescript
// src/rules/structure/list-overuse.ts
import type { Rule, Diagnostic, LintContext } from "../../types.js";

export const listOveruseRule: Rule = {
  meta: {
    id: "structure/list-overuse",
    category: "structure",
    severity: "warning",
    fixable: false,
    description: "Documento con >60% di contenuto in liste puntate",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const lines = text.split("\n");
    const bulletLines = lines.filter((l) => /^\s*[-*+]\s/.test(l) || /^\s*\d+\.\s/.test(l));
    const contentLines = lines.filter((l) => l.trim().length > 0);
    if (contentLines.length < 5) return [];
    const ratio = bulletLines.length / contentLines.length;
    if (ratio < 0.6) return [];
    return [{
      rule: "structure/list-overuse",
      severity: "warning",
      line: 1, col: 1, length: 0,
      message: `${Math.round(ratio * 100)}% del contenuto è in liste: preferisci prosa narrativa`,
    }];
  },
};
```

- [ ] **Step 4: Verifica che i test passino**

```bash
npm test -- tests/rules/structure/robotic-connectors.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/rules/structure/ tests/rules/structure/
git commit -m "feat: structure rules — robotic-connectors, parallel-cliche, list-overuse"
```

---

## Task 14: Rule Registry e Library Entry Point

**Files:**
- Create: `src/rules/index.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Crea src/rules/index.ts**

```typescript
// src/rules/index.ts
import type { Rule } from "../types.js";
import { accentedWordsRule } from "./orthography/accented-words.js";
import { apostropheErrorsRule } from "./orthography/apostrophe-errors.js";
import { noDoubleHyphenRule } from "./punctuation/no-double-hyphen.js";
import { noEmDashRule } from "./punctuation/no-em-dash.js";
import { staccatoSentencesRule } from "./punctuation/staccato-sentences.js";
import { suspenseEllipsisRule } from "./punctuation/suspense-ellipsis.js";
import { slopPhrasesRule } from "./lexicon/slop-phrases.js";
import { overusedAdjectivesRule } from "./lexicon/overused-adjectives.js";
import { macaronicAnglicismsRule } from "./lexicon/macaronic-anglicisms.js";
import { roboticConnectorsRule } from "./structure/robotic-connectors.js";
import { parallelClicheRule } from "./structure/parallel-cliche.js";
import { listOveruseRule } from "./structure/list-overuse.js";

export const ALL_RULES: Rule[] = [
  accentedWordsRule,
  apostropheErrorsRule,
  noDoubleHyphenRule,
  noEmDashRule,
  staccatoSentencesRule,
  suspenseEllipsisRule,
  slopPhrasesRule,
  overusedAdjectivesRule,
  macaronicAnglicismsRule,
  roboticConnectorsRule,
  parallelClicheRule,
  listOveruseRule,
];

export function getRuleById(id: string): Rule | undefined {
  return ALL_RULES.find((r) => r.meta.id === id);
}
```

- [ ] **Step 2: Crea src/index.ts (API pubblica)**

```typescript
// src/index.ts
export { lint } from "./engine/lint.js";
export { applyFixes } from "./engine/fix.js";
export { loadConfig, defaultConfig } from "./engine/config.js";
export { ALL_RULES, getRuleById } from "./rules/index.js";
export type { Diagnostic, Rule, LintConfig, RuleMeta, Severity, Category } from "./types.js";
```

- [ ] **Step 3: Verifica compilazione TypeScript**

```bash
npm run lint
```

Expected: nessun errore TypeScript.

- [ ] **Step 4: Esegui tutti i test**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/rules/index.ts src/index.ts
git commit -m "feat: rule registry and public library API"
```

---

## Task 15: CLI — Entry Point e Comando `check`

**Files:**
- Create: `src/cli/formatters/human.ts`
- Create: `src/cli/commands/check.ts`
- Create: `src/cli/index.ts`

- [ ] **Step 1: Crea src/cli/formatters/human.ts**

```typescript
// src/cli/formatters/human.ts
import chalk from "chalk";
import type { Diagnostic } from "../../types.js";

export function formatHuman(filePath: string, diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) return "";
  const lines: string[] = [chalk.underline(filePath)];

  for (const d of diagnostics) {
    const loc = chalk.gray(`  ${d.line}:${d.col}`);
    const sev = d.severity === "error" ? chalk.red("error  ") : chalk.yellow("warning");
    const msg = d.message;
    const rule = chalk.gray(d.rule);
    lines.push(`${loc}  ${sev}  ${msg}  ${rule}`);
  }

  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;
  const parts: string[] = [];
  if (errors > 0) parts.push(chalk.red(`${errors} error${errors > 1 ? "i" : "e"}`));
  if (warnings > 0) parts.push(chalk.yellow(`${warnings} warning${warnings > 1 ? "s" : ""}`));
  lines.push("\n" + parts.join(", "));

  return lines.join("\n");
}
```

- [ ] **Step 2: Crea src/cli/commands/check.ts**

```typescript
// src/cli/commands/check.ts
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import { glob } from "glob";
import type { Command } from "commander";
import { lint } from "../../engine/lint.js";
import { loadConfig } from "../../engine/config.js";
import { ALL_RULES } from "../../rules/index.js";
import { formatHuman } from "../formatters/human.js";
import { formatJson } from "../formatters/json.js";
import { formatGithub } from "../formatters/github.js";
import type { Diagnostic } from "../../types.js";

interface CheckOptions {
  fix: boolean;
  format: "human" | "json" | "github";
  severity: "error" | "warning";
}

export async function runCheck(
  patterns: string[],
  options: CheckOptions
): Promise<number> {
  const cwd = process.cwd();
  const config = await loadConfig(cwd);

  const files: string[] = [];
  for (const pattern of patterns) {
    const matched = await glob(pattern, { cwd, nodir: true });
    files.push(...matched.map((f) => resolve(cwd, f)));
  }

  if (files.length === 0) {
    console.error("Nessun file trovato per il pattern specificato.");
    return 2;
  }

  let totalErrors = 0;
  const allResults: Array<{ file: string; diagnostics: Diagnostic[] }> = [];

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    let diagnostics = lint(text, ALL_RULES, config, filePath);

    if (options.severity === "error") {
      diagnostics = diagnostics.filter((d) => d.severity === "error");
    }

    if (diagnostics.length > 0) {
      allResults.push({ file: filePath, diagnostics });
      totalErrors += diagnostics.filter((d) => d.severity === "error").length;
    }
  }

  if (options.format === "json") {
    console.log(formatJson(allResults));
  } else if (options.format === "github") {
    for (const { file, diagnostics } of allResults) {
      console.log(formatGithub(file, diagnostics));
    }
  } else {
    for (const { file, diagnostics } of allResults) {
      const output = formatHuman(file, diagnostics);
      if (output) console.log(output);
    }
  }

  return totalErrors > 0 ? 1 : 0;
}
```

- [ ] **Step 3: Crea src/cli/index.ts**

```typescript
#!/usr/bin/env node
// src/cli/index.ts
import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { runCheck } from "./commands/check.js";
import { runFix } from "./commands/fix.js";
import { runInit } from "./commands/init.js";
import { runRules } from "./commands/rules.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Percorso al package.json nella root del pacchetto distribuito
const pkgPath = join(__dirname, "../../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

const program = new Command();

program
  .name("ideslop")
  .description("AI Italian deslopification — keep your Italian text human")
  .version(pkg.version);

program
  .command("check [files...]")
  .description("Analizza file per slop AI in italiano")
  .option("--fix", "Applica fix sicuri automaticamente", false)
  .option("--format <format>", "Formato output: human|json|github", "human")
  .option("--severity <level>", "Mostra solo: error|warning", "warning")
  .action(async (files: string[], options) => {
    const patterns = files.length > 0 ? files : ["**/*.md"];
    const code = await runCheck(patterns, options as Parameters<typeof runCheck>[1]);
    process.exit(code);
  });

program
  .command("fix [files...]")
  .description("Applica fix sicuri in-place")
  .option("--dry-run", "Mostra diff senza modificare", false)
  .option("--no-backup", "Non creare file .bak")
  .action(async (files: string[], options) => {
    const patterns = files.length > 0 ? files : ["**/*.md"];
    await runFix(patterns, options as Parameters<typeof runFix>[1]);
  });

program
  .command("init")
  .description("Inietta regole anti-slop nei file config degli agent AI")
  .option("--agent <agent>", "Target: claude|codex|gemini|cursor|all", "all")
  .option("--dry-run", "Mostra cosa verrebbe scritto senza modificare", false)
  .action(async (options) => {
    await runInit(options as Parameters<typeof runInit>[0]);
  });

program
  .command("rules [id]")
  .description("Elenca le regole disponibili")
  .option("--category <cat>", "Filtra per categoria")
  .action((id?: string, options?: { category?: string }) => {
    runRules(id, options?.category);
  });

program.parse();
```

- [ ] **Step 4: Verifica che TypeScript compili**

```bash
npm run lint
```

Expected: nessun errore (i comandi fix/init/rules non esistono ancora ma li creeremo subito).

- [ ] **Step 5: Commit**

```bash
git add src/cli/formatters/human.ts src/cli/commands/check.ts src/cli/index.ts
git commit -m "feat: CLI entry point and check command"
```

---

## Task 16: CLI Formatter JSON e GitHub

**Files:**
- Create: `src/cli/formatters/json.ts`
- Create: `src/cli/formatters/github.ts`

- [ ] **Step 1: Crea src/cli/formatters/json.ts**

```typescript
// src/cli/formatters/json.ts
import type { Diagnostic } from "../../types.js";

export function formatJson(
  results: Array<{ file: string; diagnostics: Diagnostic[] }>
): string {
  return JSON.stringify(results, null, 2);
}
```

- [ ] **Step 2: Crea src/cli/formatters/github.ts**

```typescript
// src/cli/formatters/github.ts
import type { Diagnostic } from "../../types.js";

export function formatGithub(filePath: string, diagnostics: Diagnostic[]): string {
  return diagnostics
    .map((d) => {
      const level = d.severity === "error" ? "error" : "warning";
      return `::${level} file=${filePath},line=${d.line},col=${d.col},title=${d.rule}::${d.message}`;
    })
    .join("\n");
}
```

- [ ] **Step 3: Commit**

```bash
git add src/cli/formatters/json.ts src/cli/formatters/github.ts
git commit -m "feat: CLI formatters — json, github annotations"
```

---

## Task 17: CLI Comando `fix`

**Files:**
- Create: `src/cli/commands/fix.ts`

- [ ] **Step 1: Crea src/cli/commands/fix.ts**

```typescript
// src/cli/commands/fix.ts
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import { lint } from "../../engine/lint.js";
import { applyFixes } from "../../engine/fix.js";
import { loadConfig } from "../../engine/config.js";
import { ALL_RULES } from "../../rules/index.js";

interface FixOptions {
  dryRun: boolean;
  backup: boolean;
}

export async function runFix(patterns: string[], options: FixOptions): Promise<void> {
  const cwd = process.cwd();
  const config = await loadConfig(cwd);

  const files: string[] = [];
  for (const pattern of patterns) {
    const matched = await glob(pattern, { cwd, nodir: true });
    files.push(...matched.map((f) => resolve(cwd, f)));
  }

  for (const filePath of files) {
    const original = readFileSync(filePath, "utf8");
    const diagnostics = lint(original, ALL_RULES, config, filePath);
    const fixable = diagnostics.filter((d) => d.fix !== undefined && d.severity === "error");

    if (fixable.length === 0) continue;

    const fixed = applyFixes(original, fixable);

    if (options.dryRun) {
      console.log(`\n--- ${filePath} (dry-run: ${fixable.length} fix)`);
      // Mostra diff riga per riga
      const origLines = original.split("\n");
      const fixedLines = fixed.split("\n");
      for (let i = 0; i < Math.max(origLines.length, fixedLines.length); i++) {
        if (origLines[i] !== fixedLines[i]) {
          console.log(`  - ${origLines[i] ?? ""}`);
          console.log(`  + ${fixedLines[i] ?? ""}`);
        }
      }
    } else {
      if (options.backup) {
        writeFileSync(filePath + ".bak", original, "utf8");
      }
      writeFileSync(filePath, fixed, "utf8");
      console.log(`✔ ${filePath} — ${fixable.length} fix applicati`);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/cli/commands/fix.ts
git commit -m "feat: CLI fix command with dry-run and backup"
```

---

## Task 18: CLI Comando `init`

**Files:**
- Create: `src/cli/commands/init.ts`

- [ ] **Step 1: Crea src/cli/commands/init.ts**

```typescript
// src/cli/commands/init.ts
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const BLOCK_START = "<!-- ai-italian-deslop:start -->";
const BLOCK_END = "<!-- ai-italian-deslop:end -->";

const RULES_BLOCK = `${BLOCK_START}
## Regole linguistiche italiano — ai-italian-deslop

- Usa sempre gli accenti corretti: \`perché\`, \`così\`, \`più\`, \`già\`, \`è\`, \`né\`, \`sì\`, \`dà\`, \`po'\`, \`però\`, \`cioè\`, \`può\`.
- Non usare \`--\` come punteggiatura. Evita \`—\` (em-dash) in prosa normale.
- Non scrivere frasi telegrafiche consecutive per creare suspense. ("Non è solo questo. È di più. È tutto." è slop AI.)
- Evita frasi formulaiche AI: "vale la pena notare", "tuffiamoci", "approfondiamo", "è fondamentale capire che", "non si tratta solo di X ma di Y", "in sintesi", "in conclusione", "alla luce di quanto detto", "come già detto", "emerge chiaramente".
- Non usare \`innanzitutto / inoltre / infine\` come unica struttura di paragrafo.
- Evita aggettivi inflazionati: "cruciale", "fondamentale", "imprescindibile", "innovativo", "rivoluzionario".
- Non usare \`...\` per effetto drammatico. Usa il punto fermo.
- Scrivi frasi complete, non aforismi paralleli meccanici.
- Preferisci italiano diretto: "affrontare" invece di "approcciare", "risultato" invece di "deliverable".
${BLOCK_END}`;

const AGENT_FILES: Record<string, string[]> = {
  claude: ["CLAUDE.md"],
  codex: ["AGENTS.md"],
  gemini: ["GEMINI.md"],
  cursor: [".cursorrules", ".cursor/rules"],
};

function upsertBlock(content: string, block: string): string {
  const start = content.indexOf(BLOCK_START);
  const end = content.indexOf(BLOCK_END);
  if (start !== -1 && end !== -1) {
    return content.slice(0, start) + block + content.slice(end + BLOCK_END.length);
  }
  const separator = content.endsWith("\n") ? "\n" : "\n\n";
  return content + separator + block + "\n";
}

interface InitOptions {
  agent: string;
  dryRun: boolean;
}

export async function runInit(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const targets = options.agent === "all"
    ? Object.values(AGENT_FILES).flat()
    : (AGENT_FILES[options.agent] ?? []);

  if (targets.length === 0) {
    console.error(`Agent sconosciuto: ${options.agent}. Usa: claude, codex, gemini, cursor, all`);
    return;
  }

  for (const fileName of targets) {
    const filePath = join(cwd, fileName);
    const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
    const updated = upsertBlock(existing, RULES_BLOCK);

    if (options.dryRun) {
      console.log(`\n--- ${fileName} (dry-run):\n${updated}`);
    } else {
      writeFileSync(filePath, updated, "utf8");
      console.log(`✔ ${fileName} aggiornato con regole anti-slop`);
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/cli/commands/init.ts
git commit -m "feat: CLI init command — inject anti-slop rules into agent config files"
```

---

## Task 19: CLI Comando `rules`

**Files:**
- Create: `src/cli/commands/rules.ts`

- [ ] **Step 1: Crea src/cli/commands/rules.ts**

```typescript
// src/cli/commands/rules.ts
import chalk from "chalk";
import { ALL_RULES, getRuleById } from "../../rules/index.js";
import type { Category } from "../../types.js";

export function runRules(id?: string, category?: string): void {
  if (id) {
    const rule = getRuleById(id);
    if (!rule) {
      console.error(chalk.red(`Regola non trovata: ${id}`));
      process.exit(1);
    }
    console.log(`\n${chalk.bold(rule.meta.id)}`);
    console.log(`  Categoria: ${rule.meta.category}`);
    console.log(`  Severità default: ${rule.meta.severity}`);
    console.log(`  Auto-fix: ${rule.meta.fixable ? "sì" : "no"}`);
    console.log(`  Descrizione: ${rule.meta.description}`);
    return;
  }

  const rules = category
    ? ALL_RULES.filter((r) => r.meta.category === (category as Category))
    : ALL_RULES;

  const byCategory = rules.reduce<Record<string, typeof ALL_RULES>>((acc, r) => {
    (acc[r.meta.category] ??= []).push(r);
    return acc;
  }, {});

  for (const [cat, catRules] of Object.entries(byCategory)) {
    console.log(`\n${chalk.bold.underline(cat)}`);
    for (const r of catRules) {
      const fix = r.meta.fixable ? chalk.green("✔ fix") : chalk.gray("  —  ");
      const sev = r.meta.severity === "error" ? chalk.red("error  ") : chalk.yellow("warning");
      console.log(`  ${sev}  ${fix}  ${r.meta.id.split("/")[1].padEnd(30)}  ${r.meta.description}`);
    }
  }
}
```

- [ ] **Step 2: Verifica compilazione completa**

```bash
npm run lint
```

Expected: nessun errore TypeScript.

- [ ] **Step 3: Esegui tutti i test**

```bash
npm test
```

Expected: tutti i test PASS.

- [ ] **Step 4: Commit**

```bash
git add src/cli/commands/rules.ts
git commit -m "feat: CLI rules command — list and inspect rules"
```

---

## Task 20: Build e Packaging

**Files:**
- Modify: `package.json` (già creato in Task 1, da verificare)
- Create: `tsup.config.ts` (già creato in Task 1)

- [ ] **Step 1: Esegui la build**

```bash
npm run build
```

Expected: `dist/` creata con `index.js`, `index.d.ts`, `cli/index.js`.

- [ ] **Step 2: Testa il binary localmente**

```bash
node dist/cli/index.js --version
node dist/cli/index.js rules
```

Expected: versione stampata + elenco regole.

- [ ] **Step 3: Collega il binary globalmente per test locali**

```bash
npm link
ideslop --version
ideslop rules
```

Expected: funziona.

- [ ] **Step 4: Testa `ideslop check` su un file con slop**

Crea un file di test:

```bash
cat > /tmp/slop-test.md << 'EOF'
# Test

Questo e un test. Vale la pena notare che perche siamo qui.

Era bello -- forse troppo bello. Non e solo questo. E di piu. E tutto.

Innanzitutto, il primo punto. Inoltre, il secondo. Infine, il terzo.
EOF
ideslop check /tmp/slop-test.md
```

Expected: output con errori/warning su accenti, `--`, frasi slop, schema robotico.

- [ ] **Step 5: Testa `ideslop init --dry-run`**

```bash
ideslop init --dry-run --agent claude
```

Expected: stampa il contenuto che verrebbe scritto in CLAUDE.md.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: verify build and binary linking"
```

---

## Task 21: README e GitHub Actions CI

**Files:**
- Create: `README.md`
- Create: `.github/workflows/ci.yml`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`

- [ ] **Step 1: Crea README.md**

```markdown
# ai-italian-deslop

> AI Italian deslopification — keep your Italian text human.

[![npm](https://img.shields.io/npm/v/ai-italian-deslop)](https://npmjs.com/package/ai-italian-deslop)
[![CI](https://github.com/YOUR_USERNAME/ai-italian-deslop/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/ai-italian-deslop/actions)
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
| **Punctuation** | `--` as punctuation, dramatic `...`, staccato sentences |
| **Lexicon** | "vale la pena notare", "tuffiamoci", "in sintesi", "è fondamentale capire che" (75+ phrases) |
| **Structure** | innanzitutto/inoltre/infine skeleton, parallel clichés ("Non è X. È Y."), list overuse |

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

## License

MIT
```

- [ ] **Step 2: Crea .github/workflows/ci.yml**

```bash
mkdir -p .github/workflows
```

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node: [20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm

      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

- [ ] **Step 3: Crea CONTRIBUTING.md**

```markdown
# Contributing to ai-italian-deslop

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/ai-italian-deslop
cd ai-italian-deslop
npm install
npm test
```

## Adding a new slop phrase

Edit `src/rules/lexicon/data/slop-phrases.json` — no TypeScript required.

## Adding a new rule

1. Create `src/rules/<category>/<rule-name>.ts` implementing the `Rule` interface.
2. Add tests in `tests/rules/<category>/<rule-name>.test.ts`.
3. Register it in `src/rules/index.ts`.
4. Run `npm test` — coverage must stay ≥ 85%.

## Commit style

`feat:`, `fix:`, `chore:`, `docs:` prefixes. Keep commits small and atomic.
```

- [ ] **Step 4: Crea SECURITY.md**

```markdown
# Security Policy

To report a vulnerability, open a GitHub issue with the label `security`.
```

- [ ] **Step 5: Crea LICENSE (MIT)**

```
MIT License

Copyright (c) 2026 Lorenzo Puricelli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 6: Commit finale**

```bash
git add README.md .github/ CONTRIBUTING.md SECURITY.md LICENSE
git commit -m "docs: README, CI, CONTRIBUTING, SECURITY, LICENSE"
```

---

## Spec Coverage Check

| Requisito spec | Task che lo implementa |
|---|---|
| TypeScript CLI + libreria npm | Task 1, 14, 20 |
| Architettura ESLint-style con Rule API | Task 2, 5, 14 |
| Parser markdown-aware | Task 3 |
| Config `.italiandesloprc.json` | Task 4 |
| Ortografia: parole accentate | Task 7 |
| Ortografia: apostrofi (pò, un'altro, qual'è) | Task 8 |
| Punteggiatura: --, —, staccato, ellissi | Task 9, 10 |
| Lessico: slop-phrases (75+ voci) | Task 11 |
| Lessico: aggettivi overused | Task 12 |
| Lessico: anglicismi maccheronici | Task 12 |
| Struttura: robotic-connectors | Task 13 |
| Struttura: parallel-cliche | Task 13 |
| Struttura: list-overuse | Task 13 |
| CLI check con formati human/json/github | Task 15, 16 |
| CLI fix con dry-run e backup | Task 17 |
| CLI init (CLAUDE.md, AGENTS.md, GEMINI.md, .cursorrules) | Task 18 |
| CLI rules | Task 19 |
| Build tsup + binary ideslop | Task 20 |
| README + CI GitHub Actions + CONTRIBUTING | Task 21 |
