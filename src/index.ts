export { lint } from "./engine/lint.js";
export { applyFixes } from "./engine/fix.js";
export { loadConfig, defaultConfig } from "./engine/config.js";
export { ALL_RULES, getRuleById } from "./rules/index.js";
export type { Diagnostic, Rule, LintConfig, RuleMeta, Severity, Category } from "./types.js";
