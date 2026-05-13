import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

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

export interface InitOptions {
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
