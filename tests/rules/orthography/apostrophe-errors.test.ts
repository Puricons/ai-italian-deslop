import { describe, it, expect } from "vitest";
import { apostropheErrorsRule } from "../../../src/rules/orthography/apostrophe-errors.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("apostrophe-errors", () => {
  it("rileva 'pò' sbagliato", () => {
    const d = apostropheErrorsRule.check("Un pò di tempo.", ctx);
    expect(d.some((x) => x.fix?.replacement === "po'")).toBe(true);
  });

  it("non rileva 'po'' corretto", () => {
    const d = apostropheErrorsRule.check("Un po' di tempo.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva 'un'altro' sbagliato (maschile)", () => {
    const d = apostropheErrorsRule.check("È un'altro problema.", ctx);
    expect(d.some((x) => x.fix?.replacement === "un altro")).toBe(true);
  });

  it("non rileva 'un'altra' (femminile è corretto con apostrofo)", () => {
    const d = apostropheErrorsRule.check("È un'altra storia.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva 'qual'è' sbagliato", () => {
    const d = apostropheErrorsRule.check("Qual'è il problema?", ctx);
    expect(d.some((x) => x.fix?.replacement === "qual è")).toBe(true);
  });
});
