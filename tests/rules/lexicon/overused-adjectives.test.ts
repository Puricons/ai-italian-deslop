import { describe, it, expect } from "vitest";
import { overusedAdjectivesRule } from "../../../src/rules/lexicon/overused-adjectives.js";
import { macaronicAnglicismsRule } from "../../../src/rules/lexicon/macaronic-anglicisms.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("overused-adjectives", () => {
  it("non scatta con un solo uso di 'cruciale'", () => {
    const d = overusedAdjectivesRule.check("Questo è un punto cruciale.", ctx);
    expect(d).toHaveLength(0);
  });

  it("scatta quando 'cruciale' supera la soglia", () => {
    const text = "Un punto cruciale. Un altro aspetto cruciale. Ancora cruciale.";
    const d = overusedAdjectivesRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("scatta quando 'resiliente' supera la soglia", () => {
    const text = "Un team resiliente. Un'organizzazione resiliente. Davvero resiliente.";
    const d = overusedAdjectivesRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });
});

describe("macaronic-anglicisms", () => {
  it("rileva 'approcciare'", () => {
    const d = macaronicAnglicismsRule.check("Dobbiamo approcciare il problema.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].suggestion).toContain("affrontare");
  });

  it("rileva 'deliverable'", () => {
    const d = macaronicAnglicismsRule.check("Il deliverable è pronto.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("rileva 'stakeholder'", () => {
    const d = macaronicAnglicismsRule.check("Gli stakeholder sono stati informati.", ctx);
    expect(d.length).toBeGreaterThan(0);
    expect(d[0].suggestion).toContain("portatore di interesse");
  });

  it("rileva 'best practice'", () => {
    const d = macaronicAnglicismsRule.check("Seguiamo le best practice del settore.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });
});
