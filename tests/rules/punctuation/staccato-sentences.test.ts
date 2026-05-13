import { describe, it, expect } from "vitest";
import { staccatoSentencesRule } from "../../../src/rules/punctuation/staccato-sentences.js";
import { suspenseEllipsisRule } from "../../../src/rules/punctuation/suspense-ellipsis.js";

const ctx = { config: { rules: {}, ignore: [] } };

describe("staccato-sentences", () => {
  it("rileva tre frasi brevi consecutive", () => {
    const text = "Non è solo questo. È di più. È tutto.";
    const d = staccatoSentencesRule.check(text, ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non scatta su testo narrativo normale", () => {
    const text = "La mattina si svegliò presto. Guardò fuori dalla finestra e vide che stava piovendo. Decise di restare a casa e leggere un libro.";
    const d = staccatoSentencesRule.check(text, ctx);
    expect(d).toHaveLength(0);
  });
});

describe("suspense-ellipsis", () => {
  it("rileva '...' per suspense in prosa", () => {
    const d = suspenseEllipsisRule.check("Non ci crederai mai... era già lì.", ctx);
    expect(d.length).toBeGreaterThan(0);
  });

  it("non rileva '...' tra virgolette doppie", () => {
    const d = suspenseEllipsisRule.check('Disse: "Aspetta..."', ctx);
    expect(d).toHaveLength(0);
  });
});
