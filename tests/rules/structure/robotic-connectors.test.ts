import { describe, it, expect } from "vitest";
import { roboticConnectorsRule } from "../../../src/rules/structure/robotic-connectors.js";
import { parallelClicheRule } from "../../../src/rules/structure/parallel-cliche.js";
import { listOveruseRule } from "../../../src/rules/structure/list-overuse.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("robotic-connectors", () => {
  it("rileva schema innanzitutto/inoltre/infine", () => {
    const text = "Innanzitutto, questo è il primo punto.\n\nInoltre, aggiungiamo che.\n\nInfine, concludiamo.";
    const d = roboticConnectorsRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su testo senza lo schema", () => {
    const text = "Il gatto mangiò. Il cane dormiva. La sera arrivò presto.";
    const d = roboticConnectorsRule.check(text, ctx);
    expect(d).toHaveLength(0);
  });
});

describe("parallel-cliche", () => {
  it("rileva costruzione parallela meccanica", () => {
    const text = "Non è solo un tool. È una filosofia. È un approccio.";
    const d = parallelClicheRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });
});

describe("list-overuse", () => {
  it("rileva documento con troppi bullet points", () => {
    const text = "Intro.\n\n- Punto uno\n- Punto due\n- Punto tre\n- Punto quattro\n- Punto cinque\n\nFine.";
    const d = listOveruseRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su documento misto", () => {
    const text = "Molto testo narrativo qui che continua per diverse righe e parole. Poi un elenco:\n\n- Punto\n\nAltra prosa.";
    const d = listOveruseRule.check(text, ctx);
    expect(d).toHaveLength(0);
  });
});
