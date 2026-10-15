import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { PROJECTS } from "./src/projects.js";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * When a project last changed, read out of git so the index can't quietly go stale.
 *
 * Vercel clones shallowly, so a directory whose last commit predates the fetched
 * history comes back empty; build time is a less precise answer than the real commit
 * date but a truer one than a blank or a hardcoded string.
 */
function lastCommitted(source: string): string {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", source], {
      cwd: workspaceRoot,
      encoding: "utf8",
    }).trim();
    if (iso) return iso;
  } catch {
    // No git at all — a tarball export, or a build outside a checkout.
  }
  return new Date().toISOString();
}

export default defineConfig({
  plugins: [react()],
  server: { port: 5275 },
  define: {
    __PROJECT_UPDATED__: JSON.stringify(
      Object.fromEntries(PROJECTS.map((project) => [project.id, lastCommitted(project.source)])),
    ),
  },
});
