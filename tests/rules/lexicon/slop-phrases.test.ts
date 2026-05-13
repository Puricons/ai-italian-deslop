import { describe, it, expect } from "vitest";
import { slopPhrasesRule } from "../../../src/rules/lexicon/slop-phrases.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("slop-phrases", () => {
  it("rileva 'vale la pena notare'", () => {
    const d = slopPhrasesRule.check("Vale la pena notare che questo è un test.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].rule).toBe("lexicon/slop-phrases");
  });

  it("rileva 'in sintesi'", () => {
    const d = slopPhrasesRule.check("In sintesi, il risultato è positivo.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su testo pulito", () => {
    const d = slopPhrasesRule.check("Il gatto mangiò il topo. Era contento.", ctx);
    expect(d).toHaveLength(0);
  });

  it("rileva frasi case-insensitive", () => {
    const d = slopPhrasesRule.check("È IMPORTANTE SOTTOLINEARE che...", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("include frasi custom dalla config", () => {
    const cfg = {
      config: {
        rules: {},
        ignore: [],
        lexicon: { "custom-slop-phrases": ["parola maledetta"] },
      },
    };
    const d = slopPhrasesRule.check("Questa è una parola maledetta nel testo.", cfg);
    expect(d.length).toBeGreaterThan(0);
  });
});
