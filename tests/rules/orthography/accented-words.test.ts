import { describe, it, expect } from "vitest";
import { accentedWordsRule } from "../../../src/rules/orthography/accented-words.js";
import type { LintContext } from "../../../src/types.js";

const ctx: LintContext = { config: { rules: {}, ignore: [] } };

describe("accented-words", () => {
  it("rileva 'perche' senza accento", () => {
    const d = accentedWordsRule.check("Lo faccio perche voglio.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].fix?.replacement).toBe("perché");
  });

  it("rileva 'cosi' senza accento", () => {
    const d = accentedWordsRule.check("Era cosi facile.", ctx);
    expect(d.some((x) => x.fix?.replacement === "così")).toBe(true);
  });

  it("non rileva 'perché' già corretto", () => {
    const d = accentedWordsRule.check("Lo faccio perché voglio.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva 'piu' senza accento", () => {
    const d = accentedWordsRule.check("Voglio piu tempo.", ctx);
    expect(d.some((x) => x.fix?.replacement === "più")).toBe(true);
  });

  it("rileva 'e' isolata che dovrebbe essere 'è'", () => {
    const d = accentedWordsRule.check("Questo e un test.", ctx);
    expect(d.some((x) => x.rule === "orthography/accented-words")).toBe(true);
  });

  it("non rileva 'e' in 'e poi' (congiunzione valida)", () => {
    const d = accentedWordsRule.check("Mangia e poi dorme.", ctx);
    expect(d).toHaveLength(0);
  });
});
