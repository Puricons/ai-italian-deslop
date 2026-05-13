// tests/engine/lint.test.ts — stub iniziale, espanso nei task successivi
import { describe, it, expect } from "vitest";
import type { Diagnostic, Rule, LintConfig } from "../../src/types.js";

describe("types", () => {
  it("Diagnostic ha tutti i campi attesi", () => {
    const d: Diagnostic = {
      rule: "orthography/accented-words",
      severity: "error",
      line: 1,
      col: 5,
      length: 6,
      message: "Accento mancante",
    };
    expect(d.rule).toBe("orthography/accented-words");
  });
});
