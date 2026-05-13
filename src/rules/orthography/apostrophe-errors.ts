import type { Rule, Diagnostic, LintContext } from "../../types.js";

function getLineCol(text: string, index: number): { line: number; col: number } {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

// Helper to check if a character is a word boundary (non-letter)
function isWordBoundary(char: string | undefined): boolean {
  if (!char) return true;
  return !/[a-zA-ZàáâäæãåāăąçćĉċčďđèéêëēĕėęěĝğġģĥħìíîïĩīĭįıĵķĸĹĻľŀłńņňŉŊòóôöõøōŏőœŕŗřśŝşšţťŧũūŭůűųŵŷźżžſƀǀǁǂǃǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǶǷǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ]+/.test(char);
}

const PATTERNS: Array<{ wrong: string; right: string; message: string }> = [
  {
    wrong: "pò",
    right: "po'",
    message: '"pò" non esiste in italiano: usa "po\'"',
  },
  {
    wrong: "un'altro",
    right: "un altro",
    message: '"un\'altro" sbagliato: il maschile non elide → "un altro"',
  },
  {
    wrong: "qual'è",
    right: "qual è",
    message: '"qual\'è" scorretto: "qual è" non vuole apostrofo',
  },
  {
    wrong: "tal'è",
    right: "tal è",
    message: '"tal\'è" scorretto: usa "tal è"',
  },
];

export const apostropheErrorsRule: Rule = {
  meta: {
    id: "orthography/apostrophe-errors",
    category: "orthography",
    severity: "error",
    fixable: true,
    description: "Errori di apostrofo tipici dell'AI italiano",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const textLower = text.toLowerCase();

    for (const { wrong, right, message } of PATTERNS) {
      const wrongLower = wrong.toLowerCase();
      let index = 0;

      while ((index = textLower.indexOf(wrongLower, index)) !== -1) {
        // Check word boundaries
        const before = text[index - 1];
        const after = text[index + wrong.length];

        if (isWordBoundary(before) && isWordBoundary(after)) {
          const { line, col } = getLineCol(text, index);
          // Preserve the original case from the text
          const originalWord = text.slice(index, index + wrong.length);
          diagnostics.push({
            rule: "orthography/apostrophe-errors",
            severity: "error",
            line, col,
            length: wrong.length,
            message,
            suggestion: right,
            fix: { start: index, end: index + wrong.length, replacement: right },
          });
        }
        index += 1;
      }
    }
    return diagnostics;
  },
};
