import { describe, it, expect } from "vitest";
import type { Diagnostic } from "../../src/types.js";
import { applyFixes } from "../../src/engine/fix.js";

describe("applyFixes", () => {
  it("applica un fix semplice", () => {
    const text = "Scrivi perche vuoi.";
    const diags: Diagnostic[] = [{
      rule: "orthography/accented-words",
      severity: "error",
      line: 1, col: 8, length: 6,
      message: "perche → perché",
      fix: { start: 7, end: 13, replacement: "perché" },
    }];
    const result = applyFixes(text, diags);
    expect(result).toBe("Scrivi perché vuoi.");
  });

  it("applica fix multipli in ordine corretto (dal fondo al fronte)", () => {
    const text = "perche e cosi";
    const diags: Diagnostic[] = [
      {
        rule: "r1", severity: "error", line: 1, col: 1, length: 6,
        message: "", fix: { start: 0, end: 6, replacement: "perché" },
      },
      {
        rule: "r2", severity: "error", line: 1, col: 10, length: 4,
        message: "", fix: { start: 9, end: 13, replacement: "così" },
      },
    ];
    const result = applyFixes(text, diags);
    expect(result).toBe("perché e così");
  });

  it("salta diagnostiche senza fix", () => {
    const text = "Testo invariato";
    const diags: Diagnostic[] = [{
      rule: "r", severity: "warning", line: 1, col: 1, length: 5, message: "test",
    }];
    expect(applyFixes(text, diags)).toBe(text);
  });
});
