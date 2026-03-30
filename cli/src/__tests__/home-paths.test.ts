import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  describeLocalInstancePaths,
  expandHomePrefix,
  resolveSiriusEcoSystemHomeDir,
  resolveSiriusEcoSystemInstanceId,
} from "../config/home.js";

const ORIGINAL_ENV = { ...process.env };

describe("home path resolution", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("defaults to ~/.siriusEcoSystem and default instance", () => {
    delete process.env.SIRIUSLY_HOME;
    delete process.env.SIRIUSLY_INSTANCE_ID;

    const paths = describeLocalInstancePaths();
    expect(paths.homeDir).toBe(path.resolve(os.homedir(), ".siriusEcoSystem"));
    expect(paths.instanceId).toBe("default");
    expect(paths.configPath).toBe(path.resolve(os.homedir(), ".siriusEcoSystem", "instances", "default", "config.json"));
  });

  it("supports SIRIUSLY_HOME and explicit instance ids", () => {
    process.env.SIRIUSLY_HOME = "~/sirius-eco-system-home";

    const home = resolveSiriusEcoSystemHomeDir();
    expect(home).toBe(path.resolve(os.homedir(), "sirius-eco-system-home"));
    expect(resolveSiriusEcoSystemInstanceId("dev_1")).toBe("dev_1");
  });

  it("rejects invalid instance ids", () => {
    expect(() => resolveSiriusEcoSystemInstanceId("bad/id")).toThrow(/Invalid instance id/);
  });

  it("expands ~ prefixes", () => {
    expect(expandHomePrefix("~")).toBe(os.homedir());
    expect(expandHomePrefix("~/x/y")).toBe(path.resolve(os.homedir(), "x/y"));
  });
});
