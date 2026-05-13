import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const staccatoSentencesRule: Rule = {
  meta: {
    id: "punctuation/staccato-sentences",
    category: "punctuation",
    severity: "warning",
    fixable: false,
    description: "3+ frasi brevi consecutive (≤8 parole): pattern AI cinematografico",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const sentenceRe = /[^.!?]+[.!?]/g;
    const sentences: Array<{ text: string; index: number }> = [];
    let m: RegExpExecArray | null;
    while ((m = sentenceRe.exec(text)) !== null) {
      sentences.push({ text: m[0].trim(), index: m.index });
    }

    const diagnostics: Diagnostic[] = [];
    let streak = 0;
    let streakStart = -1;

    for (let i = 0; i < sentences.length; i++) {
      const words = sentences[i].text.split(/\s+/).filter(Boolean).length;
      if (words <= 8) {
        if (streak === 0) streakStart = sentences[i].index;
        streak++;
        if (streak >= 3) {
          const { line, col } = getLineCol(text, streakStart);
          diagnostics.push({
            rule: "punctuation/staccato-sentences",
            severity: "warning",
            line, col,
            length: sentences[i].index + sentences[i].text.length - streakStart,
            message: `${streak} frasi brevi consecutive: pattern AI cinematografico ("Non è solo questo. È di più.")`,
          });
          break;
        }
      } else {
        streak = 0;
        streakStart = -1;
      }
    }

    return diagnostics;
  },
};
