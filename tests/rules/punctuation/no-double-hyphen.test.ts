import { describe, it, expect } from "vitest";
import { noDoubleHyphenRule } from "../../../src/rules/punctuation/no-double-hyphen.js";
import { noEmDashRule } from "../../../src/rules/punctuation/no-em-dash.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("no-double-hyphen", () => {
  it("rileva '--' come punteggiatura", () => {
    const d = noDoubleHyphenRule.check("Era bello -- forse troppo.", ctx);
    expect(d).toHaveLength(1);
    expect(d[0].severity).toBe("error");
  });

  it("non rileva testo senza doppio trattino", () => {
    const d = noDoubleHyphenRule.check("Testo normale senza doppiotrattino.", ctx);
    expect(d).toHaveLength(0);
  });

  it("suggerisce sostituzione", () => {
    const d = noDoubleHyphenRule.check("Era bello -- molto.", ctx);
    expect(d[0].message).toContain("--");
  });
});

describe("no-em-dash", () => {
  it("rileva em-dash '—' come warning", () => {
    const d = noEmDashRule.check("Era bello — molto.", ctx);
    expect(d).toHaveLength(1);
    expect(d[0].severity).toBe("warning");
  });
});
