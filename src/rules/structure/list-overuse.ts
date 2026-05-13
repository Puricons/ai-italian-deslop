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
