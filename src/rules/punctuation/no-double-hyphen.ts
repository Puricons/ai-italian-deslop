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
