import { describe, it, expect } from "vitest";
import type { Diagnostic, Rule, LintConfig } from "../../src/types.js";
import { lint } from "../../src/engine/lint.js";

const mockConfig: LintConfig = {
  rules: { "test/mock-rule": "error" },
  ignore: [],
};

const mockRule: Rule = {
  meta: {
    id: "test/mock-rule",
    category: "orthography",
    severity: "error",
    fixable: false,
    description: "Test rule",
  },
  check(text, _ctx): Diagnostic[] {
    if (text.includes("TRIGGER")) {
      return [{
        rule: "test/mock-rule",
        severity: "error",
        line: 1,
        col: 1,
        length: 7,
        message: "Triggered",
      }];
    }
    return [];
  },
};

describe("lint", () => {
  it("restituisce array vuoto se nessuna regola scatta", () => {
    const diags = lint("Testo pulito.", [mockRule], mockConfig);
    expect(diags).toHaveLength(0);
  });

  it("restituisce diagnostiche quando la regola scatta", () => {
    const diags = lint("Testo TRIGGER qui.", [mockRule], mockConfig);
    expect(diags).toHaveLength(1);
    expect(diags[0].rule).toBe("test/mock-rule");
  });

  it("non esegue la regola se è 'off' in config", () => {
    const cfg: LintConfig = { rules: { "test/mock-rule": "off" }, ignore: [] };
    const diags = lint("TRIGGER", [mockRule], cfg);
    expect(diags).toHaveLength(0);
  });

  it("non analizza blocchi di codice", () => {
    const text = "```\nTRIGGER\n```";
    const diags = lint(text, [mockRule], mockConfig);
    expect(diags).toHaveLength(0);
  });
});
