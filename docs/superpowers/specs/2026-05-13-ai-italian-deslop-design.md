# ai-italian-deslop — Design Spec

**Date:** 2026-05-13  
**Status:** Approved  
**Author:** Lorenzo Puricelli

---

## Obiettivo

`ai-italian-deslop` è un linter CLI + libreria TypeScript che rileva e corregge i pattern di degrado linguistico ("slop") tipici dei testi in italiano generati da AI: accenti sbagliati, punteggiatura cinematografica, lessico formulaico, strutture sintattiche robotiche.

Il progetto è distribuito come pacchetto npm open source (MIT) con l'obiettivo di qualificarsi per il programma [Claude for Open Source](https://claude.com/contact-sales/claude-for-oss) dimostrando utilità reale alla comunità dev italiana.

---

## Identità

| Campo | Valore |
|---|---|
| Nome pacchetto npm | `ai-italian-deslop` |
| Binary alias | `ideslop` |
| Repo GitHub | `ai-italian-deslop` |
| Tagline (EN) | *AI Italian deslopification — keep your Italian text human.* |
| Linguaggio | TypeScript, target Node ≥ 20 |
| Licenza | MIT |

---

## Architettura

Il progetto è diviso in tre layer indipendenti e testabili.

```
src/
├── cli/              # Parsing argomenti, output formattato, comandi
├── engine/           # Caricamento config, parsing testo, esecuzione rules
└── rules/
    ├── orthography/  # Accenti, apostrofi, doppie
    ├── punctuation/  # Em-dash, frasi-singhiozzo, ellissi
    ├── lexicon/      # Parole-spia, frasi formulaiche (+ file JSON dizionari)
    └── structure/    # Connettori robotici, parallelismi meccanici
```

### Interfaccia Rule

Ogni regola esporta un oggetto conforme a questa interfaccia:

```typescript
interface Rule {
  meta: {
    id: string;           // es. "orthography/acute-grave-confusion"
    category: Category;
    severity: "error" | "warning";
    fixable: boolean;
    docsUrl: string;
  };
  check(text: string, ctx: LintContext): Diagnostic[];
  fix?(text: string, diagnostic: Diagnostic): string;
}
```

### Modello diagnostico

```typescript
interface Diagnostic {
  rule: string;
  severity: "error" | "warning";
  line: number;
  col: number;
  length: number;
  message: string;
  suggestion?: string;
  fix?: TextEdit;
}
```

### Configurazione

File opzionale `.italiandesloprc.json` nella root del progetto:

```json
{
  "rules": {
    "orthography/acute-grave-confusion": "error",
    "structure/robotic-connectors": "off",
    "lexicon/slop-phrases": "warning"
  },
  "ignore": ["node_modules", "*.generated.md"],
  "lexicon": {
    "custom-slop-phrases": ["a mio avviso", "come già detto"]
  }
}
```

### Parser markdown-aware

Il testo viene segmentato prima dell'analisi. I seguenti blocchi sono esclusi dall'analisi per evitare falsi positivi:

- Blocchi di codice (fenced ` ``` ` e indentati)
- Codice inline (backtick)
- URL e destinazioni di link
- Frontmatter YAML

---

## Catalogo Regole v1

### Categoria: `orthography` (deterministiche, fix sicuro)

| ID | Problema rilevato | Esempio | Fix |
|---|---|---|---|
| `acute-grave-confusion` | Accenti acuti/gravi omessi o sbagliati | `perche` → `perché`, `e` ambiguo → suggerisce `è` nel contesto | Sostituzione automatica |
| `accented-vowels-missing` | Vocale finale accentata sostituita da vocale semplice | `cosi` → `così`, `piu` → `più`, `gia` → `già` | Sostituzione automatica |
| `apostrophe-po` | `pò` (sbagliato) invece di `po'` | `un pò` → `un po'` | Sostituzione automatica |
| `un-altro-apostrophe` | `un'altro` invece di `un altro` | `un'altro` → `un altro` | Sostituzione automatica |
| `ne-accento` | `ne` usato come `né` (congiunzione) | rilevazione contestuale | Suggerimento |
| `si-accento` | `si` usato come `sì` (affermazione) | rilevazione contestuale | Suggerimento |
| `da-accento` | `da` usato come `dà` (verbo dare) | rilevazione contestuale | Suggerimento |
| `straight-apostrophe` | Apostrofo dritto `'` invece di tipografico `'` | in testi .md non-code | Sostituzione automatica |

### Categoria: `punctuation` (deterministiche)

| ID | Problema | Severità default | Fix |
|---|---|---|---|
| `no-double-hyphen` | `--` usato come punteggiatura | error | Rimuovi o sostituisci con `,` / `.` |
| `no-em-dash` | `—` usato in prosa italiana AI | warning | Suggerisci alternativa |
| `staccato-sentences` | 3+ frasi consecutive di ≤ 8 parole separate da `.` | warning | Nessun auto-fix (semantico) |
| `suspense-ellipsis` | `...` usato per effetto pathos fuori da citazioni/dialoghi | warning | Sostituzione con `.` |
| `comma-abuse` | Virgola prima di congiunzione in lista non-enumerativa | warning | Suggerimento |

**Nota em-dash**: `--` è sempre `error`; `—` è `warning` perché ha usi legittimi in tipografia italiana (dialogo, inciso formale). Il default è conservativo.

### Categoria: `lexicon` (deterministiche, dizionari JSON editabili)

Dizionari in `src/rules/lexicon/data/`:

**`slop-phrases.json`** — lista nera di frasi AI formulaiche (~80 voci nella v1):

- `vale la pena notare`, `è importante sottolineare`, `in sintesi`, `in conclusione`
- `tuffiamoci nel mondo di`, `approfondiamo insieme`, `esploriamo`
- `non si tratta solo di X, ma di Y` (pattern)
- `come accennato in precedenza`, `come già detto`, `come vedremo`
- `merita di essere menzionato`, `non possiamo non citare`
- `alla luce di quanto detto`, `in ultima analisi`
- `è fondamentale capire che`, `è cruciale`, `è imprescindibile`
- `navigare tra`, `abbracciare il concetto di`
- (e ~60 altre, corpus raccolto da output reali di vari LLM)

**`overused-adjectives.json`** — aggettivi con soglia di ripetizione (errore se > N volte per 1000 parole):

`cruciale`, `fondamentale`, `imprescindibile`, `innovativo`, `rivoluzionario`, `straordinario`, `unico`

**`macaronic-anglicisms.json`** — calchi e anglicismi da segnalare con suggerimento italiano:

`approcciare` → `affrontare`, `deliverable` → `risultato`, `leveraging` → `sfruttando`, `implementare` (overuse) → varia

Tutti i file JSON sono editabili direttamente: i contributor non-dev possono aprire PR sui dizionari senza scrivere TypeScript.

### Categoria: `structure` (euristiche, solo warning, no auto-fix)

| ID | Pattern rilevato | Heuristica |
|---|---|---|
| `robotic-connectors` | `innanzitutto`/`inoltre`/`infine` come unica struttura in ≥ 3 paragrafi consecutivi | pattern di sequenza |
| `parallel-cliche` | "Non è X. È Y. È Z." — 3+ frasi parallele brevi con stessa struttura | regex strutturale |
| `false-aphorism` | "Non è solo X, è molto di più." senza contenuto aggiuntivo | pattern semantico approssimato |
| `list-overuse` | > 60% del documento è liste puntate | ratio strutturale |

La severità di tutta la categoria `structure` è `warning` di default e può essere disattivata con `"structure/*": "off"` in config. I falsi positivi sono accettati: meglio segnalare troppo che bloccare testo corretto.

---

## CLI — Comandi e UX

### `check`

```bash
ideslop check README.md
ideslop check "docs/**/*.md"
ideslop check --fix README.md           # applica fix sicuri
ideslop check --format=json README.md   # output JSON per CI
ideslop check --format=github README.md # GitHub Actions annotations
ideslop check --severity=error README.md # solo errori, ignora warning
```

Output umano (default):

```
README.md
  12:4  error    Accento mancante: "perche" → "perché"  orthography/accented-vowels-missing
  24:1  error    Doppio trattino "--" come punteggiatura  punctuation/no-double-hyphen
  31:1  warning  Frase spia AI: "vale la pena notare"  lexicon/slop-phrases
  45:1  warning  3 frasi consecutive molto brevi  punctuation/staccato-sentences

4 problemi (2 errori, 2 warning)
```

**Exit codes**: `0` = nessun errore (warning ok), `1` = almeno un errore, `2` = errore di configurazione.

### `fix`

```bash
ideslop fix README.md          # fix in-place con backup .bak
ideslop fix --no-backup README.md
ideslop fix --dry-run README.md  # mostra diff senza applicare
```

Solo fix marcati `fixable: true` e `severity: "error"` vengono applicati senza `--force`. I warning richiedono `--force` per il fix automatico.

### `init`

```bash
ideslop init                     # rileva file di config agent presenti
ideslop init --agent claude      # mira solo CLAUDE.md
ideslop init --agent codex       # AGENTS.md
ideslop init --agent gemini      # GEMINI.md
ideslop init --agent cursor      # .cursorrules
ideslop init --agent all         # tutti i file rilevati
```

Il comando inietta un blocco **idempotente** nel file di config dell'agent:

```markdown
<!-- ai-italian-deslop:start -->
## Regole linguistiche italiano — ai-italian-deslop

- Usa sempre accenti corretti: `perché`, `così`, `più`, `già`, `è`, `né`, `sì`, `dà`, `po'`.
- Non usare `--` come punteggiatura. Non usare `—` in prosa normale.
- Non usare frasi telegrafiche consecutive per suspense drammatica.
- Evita frasi formulaiche AI: "vale la pena notare", "tuffiamoci", "approfondiamo", "è fondamentale capire che", "non si tratta solo di X ma di Y", "in sintesi", "in conclusione", "alla luce di quanto detto".
- Non usare "innanzitutto / inoltre / infine" come unica struttura di paragrafo.
- Evita aggettivi ripetitivi: "cruciale", "fondamentale", "imprescindibile", "innovativo", "rivoluzionario".
- Scrivi frasi complete, non aforismi finti. Evita costruzioni parallele meccaniche.
- Preferisci italiano diretto: "affrontare" invece di "approcciare", "risultato" invece di "deliverable".
<!-- ai-italian-deslop:end -->
```

Se il blocco esiste già, `init` lo sovrascrive (idempotente). Aggiunge `--dry-run` per preview.

### `rules`

```bash
ideslop rules                            # elenco tutte le regole
ideslop rules --category=orthography     # filtra per categoria
ideslop rules orthography/apostrophe-po  # docs singola regola
```

---

## API Libreria

```typescript
import { lint, fix, loadConfig } from "ai-italian-deslop";

const config = await loadConfig(".");           // cerca .italiandesloprc.json
const diagnostics = lint(text, { config });
const fixed = fix(text, diagnostics, { safe: true }); // solo fix sicuri
```

Esporta anche i tipi: `Diagnostic`, `Rule`, `LintConfig`, `Category`.

---

## Integrazioni v1

### Pre-commit (husky / lefthook)

```yaml
# lefthook.yml
pre-commit:
  commands:
    italian-deslop:
      glob: "*.md"
      run: ideslop check --fix {staged_files}
```

### GitHub Action

```yaml
- uses: ai-italian-deslop/action@v1
  with:
    files: "**/*.md"
    format: github
```

Pubblicata come action separata nel repo (`action.yml` + `dist/`), basata sul pacchetto npm.

### Claude Code hook

Snippet da copiare in `.claude/settings.json`:

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

---

## Qualità OSS

| Aspetto | Standard v1 |
|---|---|
| Test framework | Vitest |
| Coverage target | ≥ 85% engine, 100% regole deterministiche |
| Corpus di test | Campioni reali di output AI italiano (100+ esempi per categoria) |
| CI | GitHub Actions: lint + typecheck + test + build, Node 20/22, ubuntu + macos |
| Docs | README EN+IT, docs per ogni rule con esempi prima/dopo, CONTRIBUTING.md |
| Release | Changesets + semantic versioning, auto-publish npm via tag |
| Governance | MAINTAINERS.md, SECURITY.md, issue/PR templates, CODE_OF_CONDUCT.md |
| Demo | Playground statico su GitHub Pages (textarea → diagnostiche live) |

---

## Fuori Scope v1

- VS Code extension (roadmap v2)
- Riscrittura via LLM delle regole sfumate (roadmap v2)
- Input PDF/HTML/DOCX (roadmap v2)
- Internazionalizzazione: il tool è italiano-only by design
- Web UI complessa: solo playground statico

---

## Struttura Directory Target

```
ai-italian-deslop/
├── src/
│   ├── cli/
│   │   ├── index.ts
│   │   ├── commands/
│   │   │   ├── check.ts
│   │   │   ├── fix.ts
│   │   │   ├── init.ts
│   │   │   └── rules.ts
│   │   └── formatters/
│   │       ├── human.ts
│   │       ├── json.ts
│   │       └── github.ts
│   ├── engine/
│   │   ├── index.ts
│   │   ├── lint.ts
│   │   ├── fix.ts
│   │   ├── config.ts
│   │   └── parser/
│   │       ├── markdown.ts
│   │       └── segments.ts
│   └── rules/
│       ├── index.ts
│       ├── types.ts
│       ├── orthography/
│       ├── punctuation/
│       ├── lexicon/
│       │   └── data/
│       │       ├── slop-phrases.json
│       │       ├── overused-adjectives.json
│       │       └── macaronic-anglicisms.json
│       └── structure/
├── tests/
│   ├── engine/
│   ├── rules/
│   │   ├── orthography/
│   │   ├── punctuation/
│   │   ├── lexicon/
│   │   └── structure/
│   └── corpus/           # esempi AI slop reali vs italiano umano
├── docs/
│   └── rules/            # docs per ogni regola (auto-generate + manual)
├── action.yml            # GitHub Action
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .italiandesloprc.json # config di esempio
├── CHANGELOG.md
├── CONTRIBUTING.md
├── MAINTAINERS.md
├── SECURITY.md
└── README.md
```
