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
    // Cerca 3+ frasi consecutive molto brevi con "È" o "Non è"
    const sentences = text.split(/(?<=[.!?])\s+/);
    const diagnostics: Diagnostic[] = [];
    let streak: string[] = [];
    let streakStart = 0;
    let pos = 0;

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      const isParallel = /^(Non\s+)?(è|È|e'|E')\s/i.test(trimmed) && trimmed.split(/\s+/).length <= 10;
      if (isParallel) {
        if (streak.length === 0) streakStart = pos;
        streak.push(trimmed);
      } else {
        if (streak.length >= 3) {
          const before = text.slice(0, streakStart);
          const lines = before.split("\n");
          diagnostics.push({
            rule: "structure/parallel-cliche",
            severity: "warning",
            line: lines.length,
            col: lines[lines.length - 1].length + 1,
            length: streak.join(" ").length,
            message: 'Costruzione parallela meccanica ("Non è X. È Y. È Z."): pattern AI',
          });
        }
        streak = [];
      }
      pos += sentence.length + 1;
    }

    // Check at end
    if (streak.length >= 3) {
      const before = text.slice(0, streakStart);
      const lines = before.split("\n");
      diagnostics.push({
        rule: "structure/parallel-cliche",
        severity: "warning",
        line: lines.length,
        col: lines[lines.length - 1].length + 1,
        length: streak.join(" ").length,
        message: 'Costruzione parallela meccanica ("Non è X. È Y. È Z."): pattern AI',
      });
    }

    return diagnostics;
  },
};
