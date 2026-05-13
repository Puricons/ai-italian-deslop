import type { Diagnostic } from "../types.js";

export function applyFixes(text: string, diagnostics: Diagnostic[]): string {
  const fixable = diagnostics
    .filter((d) => d.fix !== undefined)
    .sort((a, b) => b.fix!.start - a.fix!.start);

  let result = text;
  for (const diag of fixable) {
    const { start, end, replacement } = diag.fix!;
    result = result.slice(0, start) + replacement + result.slice(end);
  }
  return result;
}
