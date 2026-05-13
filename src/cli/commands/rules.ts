import chalk from "chalk";
import { ALL_RULES, getRuleById } from "../../rules/index.js";
import type { Category } from "../../types.js";

export function runRules(id?: string, category?: string): void {
  if (id) {
    const rule = getRuleById(id);
    if (!rule) {
      console.error(chalk.red(`Regola non trovata: ${id}`));
      process.exit(1);
    }
    console.log(`\n${chalk.bold(rule.meta.id)}`);
    console.log(`  Categoria: ${rule.meta.category}`);
    console.log(`  Severità default: ${rule.meta.severity}`);
    console.log(`  Auto-fix: ${rule.meta.fixable ? "sì" : "no"}`);
    console.log(`  Descrizione: ${rule.meta.description}`);
    return;
  }

  const rules = category
    ? ALL_RULES.filter((r) => r.meta.category === (category as Category))
    : ALL_RULES;

  const byCategory = rules.reduce<Record<string, typeof ALL_RULES>>((acc, r) => {
    (acc[r.meta.category] ??= []).push(r);
    return acc;
  }, {});

  for (const [cat, catRules] of Object.entries(byCategory)) {
    console.log(`\n${chalk.bold.underline(cat)}`);
    for (const r of catRules) {
      const fix = r.meta.fixable ? chalk.green("✔ fix") : chalk.gray("  —  ");
      const sev = r.meta.severity === "error" ? chalk.red("error  ") : chalk.yellow("warning");
      console.log(`  ${sev}  ${fix}  ${r.meta.id.split("/")[1].padEnd(30)}  ${r.meta.description}`);
    }
  }
}
