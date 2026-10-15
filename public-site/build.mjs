/**
 * Builds the public prototype site into `public/`: the project index at the root and
 * every prototype in a folder beneath it.
 *
 * Unlike `tix ds/scripts/build-site.mjs`, this one also reaches prototypes that live
 * at the workspace root (next to `tix ds/`), and it runs each app's own Vite
 * directly instead of going through pnpm, which isn't on PATH on this machine.
 *
 * `path` must match the `path` of the same project in
 * `tix ds/apps/home/src/projects.ts` — a card links to the folder its app builds into.
 * Every page is behind the shared password in `middleware.js`.
 */

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(here, "..");
const outRoot = join(here, "public");

/** In build order. The index goes first because it owns the root of `public/`. */
const SITE = [
  { app: "tix ds/apps/home", path: "" },
  { app: "tix ds/apps/kitchen-sink", path: "design-system" },
  { app: "tix ds/apps/example-prototype", path: "example-prototype" },
  { app: "tix ds/apps/unified-card-token", path: "unified-card-token" },
];

rmSync(outRoot, { recursive: true, force: true });

for (const { app, path } of SITE) {
  const cwd = join(workspace, app);
  execFileSync(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "build",
      `--base=/${path}${path ? "/" : ""}`,
      `--outDir=${join(outRoot, path)}`,
      // Without this Vite stops to ask, because the directory is outside the app root.
      "--emptyOutDir",
      "--logLevel=warn",
    ],
    { cwd, stdio: "inherit" },
  );
}

// The sign-in page (rendered by middleware.js) loads these before anyone has signed in.
const fontsOut = join(outRoot, "auth", "fonts");
mkdirSync(fontsOut, { recursive: true });
for (const weight of ["Regular", "SemiBold"]) {
  const file = `TiketOdysseyText-${weight}.woff2`;
  cpSync(join(workspace, "tix ds/packages/fonts/dist", file), join(fontsOut, file));
}

process.stdout.write(`\nSite built into ${outRoot}\n`);
for (const { path } of SITE) process.stdout.write(`  /${path}${path ? "/" : ""}\n`);
