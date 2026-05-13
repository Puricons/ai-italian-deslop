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
    description: "Aggettivi inflazionati oltre soglia",
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
