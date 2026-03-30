import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCursorSkills,
  syncCursorSkills,
} from "@sirius-eco-system/adapter-cursor-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createSkillDir(root: string, name: string) {
  const skillDir = path.join(root, name);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${name}\n---\n`, "utf8");
  return skillDir;
}

describe("cursor local skill sync", () => {
  const siriusEcoSystemKey = "sirius-eco-system/siriusEcoSystem/siriusEcoSystem";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured SiriusEcoSystem skills and installs them into the Cursor skills home", async () => {
    const home = await makeTempDir("sirius-eco-system-cursor-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        siriusEcoSystemSkillSync: {
          desiredSkills: [siriusEcoSystemKey],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(siriusEcoSystemKey);
    expect(before.entries.find((entry) => entry.key === siriusEcoSystemKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === siriusEcoSystemKey)?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, [siriusEcoSystemKey]);
    expect(after.entries.find((entry) => entry.key === siriusEcoSystemKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "siriusEcoSystem"))).isSymbolicLink()).toBe(true);
  });

  it("recognizes company-library runtime skills supplied outside the bundled SiriusEcoSystem directory", async () => {
    const home = await makeTempDir("sirius-eco-system-cursor-runtime-skills-home-");
    const runtimeSkills = await makeTempDir("sirius-eco-system-cursor-runtime-skills-src-");
    cleanupDirs.add(home);
    cleanupDirs.add(runtimeSkills);

    const siriusEcoSystemDir = await createSkillDir(runtimeSkills, "siriusEcoSystem");
    const asciiHeartDir = await createSkillDir(runtimeSkills, "ascii-heart");

    const ctx = {
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        siriusEcoSystemRuntimeSkills: [
          {
            key: "siriusEcoSystem",
            runtimeName: "siriusEcoSystem",
            source: siriusEcoSystemDir,
            required: true,
            requiredReason: "Bundled SiriusEcoSystem skills are always available for local adapters.",
          },
          {
            key: "ascii-heart",
            runtimeName: "ascii-heart",
            source: asciiHeartDir,
          },
        ],
        siriusEcoSystemSkillSync: {
          desiredSkills: ["ascii-heart"],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx);
    expect(before.warnings).toEqual([]);
    expect(before.desiredSkills).toEqual(["siriusEcoSystem", "ascii-heart"]);
    expect(before.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, ["ascii-heart"]);
    expect(after.warnings).toEqual([]);
    expect(after.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "ascii-heart"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled SiriusEcoSystem skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("sirius-eco-system-cursor-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        siriusEcoSystemSkillSync: {
          desiredSkills: [siriusEcoSystemKey],
        },
      },
    } as const;

    await syncCursorSkills(configuredCtx, [siriusEcoSystemKey]);

    const clearedCtx = {
      ...configuredCtx,
      config: {
        env: {
          HOME: home,
        },
        siriusEcoSystemSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCursorSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(siriusEcoSystemKey);
    expect(after.entries.find((entry) => entry.key === siriusEcoSystemKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "siriusEcoSystem"))).isSymbolicLink()).toBe(true);
  });
});
