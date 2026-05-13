import type { Diagnostic, Rule, LintConfig } from "../types.js";
import { segmentText } from "./parser/markdown.js";
import { effectiveSeverity } from "./config.js";

export function lint(
  text: string,
  rules: Rule[],
  config: LintConfig,
  filePath?: string
): Diagnostic[] {
  const segments = segmentText(text);
  const proseSegments = segments.filter((s) => !s.isCode);
  const diagnostics: Diagnostic[] = [];
  const ctx = { config, filePath };

  for (const rule of rules) {
    const severity = effectiveSeverity(rule.meta.id, config);
    if (severity === "off") continue;

    for (const seg of proseSegments) {
      const segDiags = rule.check(seg.text, ctx);
      for (const d of segDiags) {
        diagnostics.push({
          ...d,
          severity: severity === "error" ? "error" : "warning",
          ...absolutePosition(text, seg.start, d.line, d.col),
        });
      }
    }
  }

  return diagnostics.sort((a, b) => a.line - b.line || a.col - b.col);
}

function absolutePosition(
  fullText: string,
  segStart: number,
  relLine: number,
  relCol: number
): { line: number; col: number } {
  const prefix = fullText.slice(0, segStart);
  const baseLines = prefix.split("\n").length;
  const lastNewline = prefix.lastIndexOf("\n");
  const baseCol = segStart - lastNewline - 1;

  if (relLine === 1) {
    return { line: baseLines, col: baseCol + relCol };
  }
  return { line: baseLines + relLine - 1, col: relCol };
}
