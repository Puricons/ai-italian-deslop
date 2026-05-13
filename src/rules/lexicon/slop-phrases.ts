import type { Rule, Diagnostic, LintContext } from "../../types.js";
import slopPhrasesData from "./data/slop-phrases.json" assert { type: "json" };

const SLOP_PHRASES: string[] = slopPhrasesData as string[];

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

function buildRegex(phrases: string[]): RegExp {
  const escaped = phrases
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(${escaped.join("|")})`, "gi");
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
