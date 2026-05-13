import { readFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import { lint } from "../../engine/lint.js";
import { applyFixes } from "../../engine/fix.js";
import { loadConfig } from "../../engine/config.js";
import { ALL_RULES } from "../../rules/index.js";
import { formatHuman } from "../formatters/human.js";
import { formatJson } from "../formatters/json.js";
import { formatGithub } from "../formatters/github.js";
import { writeFileSync } from "fs";
import type { Diagnostic } from "../../types.js";

export interface CheckOptions {
  fix: boolean;
  format: "human" | "json" | "github";
  severity: "error" | "warning";
}

export async function runCheck(
  patterns: string[],
  options: CheckOptions
): Promise<number> {
  const cwd = process.cwd();
  const config = await loadConfig(cwd);

  const files: string[] = [];
  for (const pattern of patterns) {
    const matched = await glob(pattern, { cwd, nodir: true });
    files.push(...matched.map((f) => resolve(cwd, f)));
  }

  if (files.length === 0) {
    console.error("Nessun file trovato per il pattern specificato.");
    return 2;
  }

  let totalErrors = 0;
  const allResults: Array<{ file: string; diagnostics: Diagnostic[] }> = [];

  for (const filePath of files) {
    const text = readFileSync(filePath, "utf8");
    let diagnostics = lint(text, ALL_RULES, config, filePath);

    if (options.severity === "error") {
      diagnostics = diagnostics.filter((d) => d.severity === "error");
    }

    if (options.fix) {
      const fixable = diagnostics.filter((d) => d.fix !== undefined && d.severity === "error");
      if (fixable.length > 0) {
        const fixed = applyFixes(text, fixable);
        writeFileSync(filePath, fixed, "utf8");
        diagnostics = lint(fixed, ALL_RULES, config, filePath);
        if (options.severity === "error") {
          diagnostics = diagnostics.filter((d) => d.severity === "error");
        }
      }
    }

    if (diagnostics.length > 0) {
      allResults.push({ file: filePath, diagnostics });
      totalErrors += diagnostics.filter((d) => d.severity === "error").length;
    }
  }

  if (options.format === "json") {
    console.log(formatJson(allResults));
  } else if (options.format === "github") {
    for (const { file, diagnostics } of allResults) {
      const out = formatGithub(file, diagnostics);
      if (out) console.log(out);
    }
  } else {
    for (const { file, diagnostics } of allResults) {
      const output = formatHuman(file, diagnostics);
      if (output) console.log(output);
    }
  }

  return totalErrors > 0 ? 1 : 0;
}
