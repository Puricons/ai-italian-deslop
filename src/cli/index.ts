#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { runCheck } from "./commands/check.js";
import { runFix } from "./commands/fix.js";
import { runInit } from "./commands/init.js";
import { runRules } from "./commands/rules.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "../../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

const program = new Command();

program
  .name("ideslop")
  .description("AI Italian deslopification — keep your Italian text human")
  .version(pkg.version);

program
  .command("check [files...]")
  .description("Analizza file per slop AI in italiano")
  .option("--fix", "Applica fix sicuri automaticamente", false)
  .option("--format <format>", "Formato output: human|json|github", "human")
  .option("--severity <level>", "Mostra solo: error|warning", "warning")
  .action(async (files: string[], options) => {
    const patterns = files.length > 0 ? files : ["**/*.md"];
    const code = await runCheck(patterns, {
      fix: options.fix as boolean,
      format: options.format as "human" | "json" | "github",
      severity: options.severity as "error" | "warning",
    });
    process.exit(code);
  });

program
  .command("fix [files...]")
  .description("Applica fix sicuri in-place")
  .option("--dry-run", "Mostra diff senza modificare", false)
  .option("--no-backup", "Non creare file .bak")
  .action(async (files: string[], options) => {
    const patterns = files.length > 0 ? files : ["**/*.md"];
    await runFix(patterns, {
      dryRun: options.dryRun as boolean,
      backup: options.backup as boolean,
    });
  });

program
  .command("init")
  .description("Inietta regole anti-slop nei file config degli agent AI")
  .option("--agent <agent>", "Target: claude|codex|gemini|cursor|all", "all")
  .option("--dry-run", "Mostra cosa verrebbe scritto senza modificare", false)
  .action(async (options) => {
    await runInit({
      agent: options.agent as string,
      dryRun: options.dryRun as boolean,
    });
  });

program
  .command("rules [id]")
  .description("Elenca le regole disponibili")
  .option("--category <cat>", "Filtra per categoria")
  .action((id?: string, options?: { category?: string }) => {
    runRules(id, options?.category);
  });

program.parse();
