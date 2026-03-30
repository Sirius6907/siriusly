import { describe, expect, it } from "vitest";
import {
  applyUiBranding,
  getWorktreeUiBranding,
  isWorktreeUiBrandingEnabled,
  renderFaviconLinks,
  renderRuntimeBrandingMeta,
} from "../ui-branding.js";

const TEMPLATE = `<!doctype html>
<head>
    <!-- SIRIUSLY_RUNTIME_BRANDING_START -->
    <!-- SIRIUSLY_RUNTIME_BRANDING_END -->
    <!-- SIRIUSLY_FAVICON_START -->
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <!-- SIRIUSLY_FAVICON_END -->
</head>`;

describe("ui branding", () => {
  it("detects worktree mode from SIRIUSLY_IN_WORKTREE", () => {
    expect(isWorktreeUiBrandingEnabled({ SIRIUSLY_IN_WORKTREE: "true" })).toBe(true);
    expect(isWorktreeUiBrandingEnabled({ SIRIUSLY_IN_WORKTREE: "1" })).toBe(true);
    expect(isWorktreeUiBrandingEnabled({ SIRIUSLY_IN_WORKTREE: "false" })).toBe(false);
  });

  it("resolves name, color, and text color for worktree branding", () => {
    const branding = getWorktreeUiBranding({
      SIRIUSLY_IN_WORKTREE: "true",
      SIRIUSLY_WORKTREE_NAME: "sirius-eco-system-pr-432",
      SIRIUSLY_WORKTREE_COLOR: "#4f86f7",
    });

    expect(branding.enabled).toBe(true);
    expect(branding.name).toBe("sirius-eco-system-pr-432");
    expect(branding.color).toBe("#4f86f7");
    expect(branding.textColor).toMatch(/^#[0-9a-f]{6}$/);
    expect(branding.faviconHref).toContain("data:image/svg+xml,");
  });

  it("renders a dynamic worktree favicon when enabled", () => {
    const links = renderFaviconLinks(
      getWorktreeUiBranding({
        SIRIUSLY_IN_WORKTREE: "true",
        SIRIUSLY_WORKTREE_NAME: "sirius-eco-system-pr-432",
        SIRIUSLY_WORKTREE_COLOR: "#4f86f7",
      }),
    );
    expect(links).toContain("data:image/svg+xml,");
    expect(links).toContain('rel="shortcut icon"');
  });

  it("renders runtime branding metadata for the ui", () => {
    const meta = renderRuntimeBrandingMeta(
      getWorktreeUiBranding({
        SIRIUSLY_IN_WORKTREE: "true",
        SIRIUSLY_WORKTREE_NAME: "sirius-eco-system-pr-432",
        SIRIUSLY_WORKTREE_COLOR: "#4f86f7",
      }),
    );
    expect(meta).toContain('name="sirius-eco-system-worktree-name"');
    expect(meta).toContain('content="sirius-eco-system-pr-432"');
    expect(meta).toContain('name="sirius-eco-system-worktree-color"');
  });

  it("rewrites the favicon and runtime branding blocks for worktree instances only", () => {
    const branded = applyUiBranding(TEMPLATE, {
      SIRIUSLY_IN_WORKTREE: "true",
      SIRIUSLY_WORKTREE_NAME: "sirius-eco-system-pr-432",
      SIRIUSLY_WORKTREE_COLOR: "#4f86f7",
    });
    expect(branded).toContain("data:image/svg+xml,");
    expect(branded).toContain('name="sirius-eco-system-worktree-name"');
    expect(branded).not.toContain('href="/favicon.svg"');

    const defaultHtml = applyUiBranding(TEMPLATE, {});
    expect(defaultHtml).toContain('href="/favicon.svg"');
    expect(defaultHtml).not.toContain('name="sirius-eco-system-worktree-name"');
  });
});
