import type { Rule, Diagnostic, LintContext } from "../../types.js";

const ALWAYS_ACCENTED: Array<{ wrong: RegExp; right: string }> = [
  { wrong: /\bperche\b/gi, right: "perché" },
  { wrong: /\bperche'\b/gi, right: "perché" },
  { wrong: /\bcosi\b/gi, right: "così" },
  { wrong: /\bpiu\b/gi, right: "più" },
  { wrong: /\bgia\b/gi, right: "già" },
  { wrong: /\bpero\b/gi, right: "però" },
  { wrong: /\bcioe\b/gi, right: "cioè" },
  { wrong: /\bcioe'\b/gi, right: "cioè" },
  { wrong: /\bpuo\b/gi, right: "può" },
  { wrong: /\bpuo'\b/gi, right: "può" },
  { wrong: /\bpoiche\b/gi, right: "poiché" },
  { wrong: /\baffinche\b/gi, right: "affinché" },
  { wrong: /\bfinche\b/gi, right: "finché" },
  { wrong: /\bbenche\b/gi, right: "benché" },
  { wrong: /\bvirtu\b/gi, right: "virtù" },
  { wrong: /\bcitta\b/gi, right: "città" },
  { wrong: /\buniversita\b/gi, right: "università" },
  { wrong: /\battivita\b/gi, right: "attività" },
  { wrong: /\bqualita\b/gi, right: "qualità" },
  { wrong: /\bpossibilita\b/gi, right: "possibilità" },
  { wrong: /\bcapacita\b/gi, right: "capacità" },
];

// 'e' isolata prima di articolo/pronome → probabilmente 'è'
const E_SOLO_PATTERN = /\be (un[ao]?|il|la|lo|l'|questo|questa|tutto|tutta|sempre|solo|anche|già)\b/gi;

function getLineCol(text: string, index: number): { line: number; col: number } {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

export const accentedWordsRule: Rule = {
  meta: {
    id: "orthography/accented-words",
    category: "orthography",
    severity: "error",
    fixable: true,
    description: "Parole italiane che richiedono sempre l'accento",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const { wrong, right } of ALWAYS_ACCENTED) {
      wrong.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = wrong.exec(text)) !== null) {
        const { line, col } = getLineCol(text, m.index);
        diagnostics.push({
          rule: "orthography/accented-words",
          severity: "error",
          line, col,
          length: m[0].length,
          message: `Accento mancante: "${m[0]}" → "${right}"`,
          suggestion: right,
          fix: { start: m.index, end: m.index + m[0].length, replacement: right },
        });
      }
    }

    E_SOLO_PATTERN.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = E_SOLO_PATTERN.exec(text)) !== null) {
      const { line, col } = getLineCol(text, m.index);
      diagnostics.push({
        rule: "orthography/accented-words",
        severity: "error",
        line, col,
        length: 1,
        message: `"e" isolata: probabilmente "è" (verbo essere)`,
        suggestion: "è",
        fix: { start: m.index, end: m.index + 1, replacement: "è" },
      });
    }

    return diagnostics;
  },
};
