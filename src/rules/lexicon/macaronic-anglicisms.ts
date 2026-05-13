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
      const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${escaped}\\b`, "gi");
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
