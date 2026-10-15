/**
 * Builds the deployable site: the project index at the root, the design system in a
 * folder beneath it.
 *
 * Each app stays an ordinary, independently runnable Vite build — this script only
 * decides where the output lands and what public path it is served from. That is why
 * `--base` and `--outDir` are passed here instead of being pinned in each app's own
 * config: on its own dev server an app is still mounted at `/`, and only the composed
 * site nests it.
 *
 * The `path` values below are the other half of `apps/home/src/projects.ts` — a card
 * there links to the folder an app builds into here. Change one and change the other;
 * the mismatch shows up as a 404 on the first click.
 */

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = join(workspaceRoot, "dist");

/** In build order. The index goes first because it owns the root of `dist/`. */
const SITE = [
  { filter: "@tiket-ds/home", path: "" },
  { filter: "@tiket-ds/kitchen-sink", path: "design-system" },
  { filter: "@tiket-ds/example-prototype", path: "example-prototype" },
  { filter: "@tiket-ds/unified-card-token", path: "unified-card-token" },
];

function run(args) {
  execFileSync("pnpm", args, { cwd: workspaceRoot, stdio: "inherit" });
}

rmSync(outRoot, { recursive: true, force: true });

// The apps import built CSS from tokens, fonts and ui rather than their sources.
run(["-r", "--filter", "./packages/**", "build"]);

for (const { filter, path } of SITE) {
  run([
    "--filter",
    filter,
    "exec",
    "vite",
    "build",
    `--base=/${path}${path ? "/" : ""}`,
    `--outDir=${join(outRoot, path)}`,
    // Without this Vite stops to ask, because the directory is outside the app root.
    "--emptyOutDir",
  ]);
}

process.stdout.write(`\nSite built into ${outRoot}\n`);
for (const { path } of SITE) {
  process.stdout.write(`  /${path}${path ? "/" : ""}\n`);
}
