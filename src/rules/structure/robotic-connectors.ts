import type { Rule, Diagnostic, LintContext } from "../../types.js";

const CONNECTORS = ["innanzitutto", "in primo luogo", "inoltre", "in secondo luogo", "infine", "in conclusione"];

export const roboticConnectorsRule: Rule = {
  meta: {
    id: "structure/robotic-connectors",
    category: "structure",
    severity: "warning",
    fixable: false,
    description: "Struttura robotica: innanzitutto/inoltre/infine come unico scheletro",
  },

  check(text: string, _ctx: LintContext): Diagnostic[] {
    const found = CONNECTORS.filter((c) =>
      new RegExp(`\\b${c}\\b`, "i").test(text)
    );
    if (found.length < 3) return [];

    const firstMatch = text.search(new RegExp(`\\b${found[0]}\\b`, "i"));
    const before = text.slice(0, firstMatch);
    const lines = before.split("\n");
    return [{
      rule: "structure/robotic-connectors",
      severity: "warning",
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
      length: found[0].length,
      message: `Schema AI: "${found.join(" → ")}" come unica struttura del testo`,
    }];
  },
};
