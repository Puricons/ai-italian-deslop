import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { loadConfig, defaultConfig } from "../../src/engine/config.js";
import { join } from "path";

const TMP = "/tmp/ideslop-test-config";

beforeEach(() => { mkdirSync(TMP, { recursive: true }); });
afterEach(() => { rmSync(TMP, { recursive: true, force: true }); });

describe("loadConfig", () => {
  it("restituisce defaultConfig se nessun file trovato", async () => {
    const cfg = await loadConfig(TMP);
    expect(cfg.ignore).toEqual(defaultConfig.ignore);
  });

  it("carica .italiandesloprc.json e fa merge con defaults", async () => {
    writeFileSync(
      join(TMP, ".italiandesloprc.json"),
      JSON.stringify({ rules: { "structure/list-overuse": "off" } })
    );
    const cfg = await loadConfig(TMP);
    expect(cfg.rules["structure/list-overuse"]).toBe("off");
    expect(cfg.rules["orthography/accented-words"]).toBe("error");
  });
});
