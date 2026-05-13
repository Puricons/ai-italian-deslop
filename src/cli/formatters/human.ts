import chalk from "chalk";
import type { Diagnostic } from "../../types.js";

export function formatHuman(filePath: string, diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) return "";
  const lines: string[] = [chalk.underline(filePath)];

  for (const d of diagnostics) {
    const loc = chalk.gray(`  ${d.line}:${d.col}`);
    const sev = d.severity === "error" ? chalk.red("error  ") : chalk.yellow("warning");
    const msg = d.message;
    const rule = chalk.gray(d.rule);
    lines.push(`${loc}  ${sev}  ${msg}  ${rule}`);
  }

  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;
  const parts: string[] = [];
  if (errors > 0) parts.push(chalk.red(`${errors} error${errors > 1 ? "i" : "e"}`));
  if (warnings > 0) parts.push(chalk.yellow(`${warnings} warning${warnings > 1 ? "s" : ""}`));
  lines.push("\n" + parts.join(", "));

  return lines.join("\n");
}
