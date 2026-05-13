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
    // Rimuovi contenuto tra virgolette doppie per evitare falsi positivi su dialogo
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
