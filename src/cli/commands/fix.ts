import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import { lint } from "../../engine/lint.js";
import { applyFixes } from "../../engine/fix.js";
import { loadConfig } from "../../engine/config.js";
import { ALL_RULES } from "../../rules/index.js";

export interface FixOptions {
  dryRun: boolean;
  backup: boolean;
}

export async function runFix(patterns: string[], options: FixOptions): Promise<void> {
  const cwd = process.cwd();
  const config = await loadConfig(cwd);

  const files: string[] = [];
  for (const pattern of patterns) {
    const matched = await glob(pattern, { cwd, nodir: true });
    files.push(...matched.map((f) => resolve(cwd, f)));
  }

  for (const filePath of files) {
    const original = readFileSync(filePath, "utf8");
    const diagnostics = lint(original, ALL_RULES, config, filePath);
    const fixable = diagnostics.filter((d) => d.fix !== undefined && d.severity === "error");

    if (fixable.length === 0) continue;

    const fixed = applyFixes(original, fixable);

    if (options.dryRun) {
      console.log(`\n--- ${filePath} (dry-run: ${fixable.length} fix)`);
      const origLines = original.split("\n");
      const fixedLines = fixed.split("\n");
      for (let i = 0; i < Math.max(origLines.length, fixedLines.length); i++) {
        if (origLines[i] !== fixedLines[i]) {
          console.log(`  - ${origLines[i] ?? ""}`);
          console.log(`  + ${fixedLines[i] ?? ""}`);
        }
      }
    } else {
      if (options.backup) {
        writeFileSync(filePath + ".bak", original, "utf8");
      }
      writeFileSync(filePath, fixed, "utf8");
      console.log(`✔ ${filePath} — ${fixable.length} fix applicati`);
    }
  }
}
