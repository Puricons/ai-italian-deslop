import { describe, it, expect } from "vitest";
import { segmentText } from "../../../src/engine/parser/markdown.js";

describe("segmentText", () => {
  it("testo semplice è un unico segmento non-code", () => {
    const segs = segmentText("Ciao mondo");
    expect(segs).toHaveLength(1);
    expect(segs[0].isCode).toBe(false);
    expect(segs[0].text).toBe("Ciao mondo");
  });

  it("fenced code block viene marcato come codice", () => {
    const input = "Prima riga\n```\ncodice qui\n```\nDopo";
    const segs = segmentText(input);
    const code = segs.filter((s) => s.isCode);
    const prose = segs.filter((s) => !s.isCode);
    expect(code.length).toBeGreaterThan(0);
    expect(code[0].text).toContain("codice qui");
    expect(prose.some((s) => s.text.includes("Prima riga"))).toBe(true);
    expect(prose.some((s) => s.text.includes("Dopo"))).toBe(true);
  });

  it("inline code viene marcato come codice", () => {
    const input = "Usa `perche` senza accento";
    const segs = segmentText(input);
    const code = segs.filter((s) => s.isCode);
    expect(code.some((s) => s.text.includes("perche"))).toBe(true);
  });

  it("frontmatter YAML è codice", () => {
    const input = "---\ntitle: Test\n---\nTesto normale";
    const segs = segmentText(input);
    const prose = segs.filter((s) => !s.isCode);
    expect(prose.some((s) => s.text.includes("Testo normale"))).toBe(true);
    const front = segs.filter((s) => s.isCode);
    expect(front.some((s) => s.text.includes("title:"))).toBe(true);
  });

  it("start offset è corretto", () => {
    const input = "Abc\n```\ncode\n```\nDef";
    const segs = segmentText(input);
    for (const seg of segs) {
      expect(input.slice(seg.start, seg.start + seg.text.length)).toBe(seg.text);
    }
  });
});
