import type { Diagnostic } from "../../types.js";

export function formatGithub(filePath: string, diagnostics: Diagnostic[]): string {
  return diagnostics
    .map((d) => {
      const level = d.severity === "error" ? "error" : "warning";
      return `::${level} file=${filePath},line=${d.line},col=${d.col},title=${d.rule}::${d.message}`;
    })
    .join("\n");
}
