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
