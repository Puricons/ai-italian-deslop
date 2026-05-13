import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { LintConfig, Severity } from "../types.js";

export const defaultConfig: LintConfig = {
  rules: {
    "orthography/accented-words": "error",
    "orthography/apostrophe-errors": "error",
    "punctuation/no-double-hyphen": "error",
    "punctuation/no-em-dash": "warning",
    "punctuation/staccato-sentences": "warning",
    "punctuation/suspense-ellipsis": "warning",
    "lexicon/slop-phrases": "error",
    "lexicon/overused-adjectives": "warning",
    "lexicon/macaronic-anglicisms": "warning",
    "structure/robotic-connectors": "warning",
    "structure/parallel-cliche": "warning",
    "structure/list-overuse": "warning",
  },
  ignore: ["node_modules", "dist", "*.generated.md"],
};

export async function loadConfig(cwd: string): Promise<LintConfig> {
  const configPath = join(cwd, ".italiandesloprc.json");
  if (!existsSync(configPath)) return { ...defaultConfig };

  const raw = JSON.parse(readFileSync(configPath, "utf8")) as Partial<LintConfig>;
  return {
    rules: { ...defaultConfig.rules, ...(raw.rules ?? {}) },
    ignore: raw.ignore ?? defaultConfig.ignore,
    lexicon: raw.lexicon ?? {},
  };
}

export function effectiveSeverity(
  ruleId: string,
  config: LintConfig
): "error" | "warning" | "off" {
  return (config.rules[ruleId] ?? "off") as Severity;
}
