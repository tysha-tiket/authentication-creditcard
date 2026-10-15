/**
 * Every prototype in this repo, in the order the index lists them.
 *
 * One entry describes the same project twice over, because a prototype lives in two
 * places: `path` is the folder it builds into on the deployed site, `devPort` is the
 * Vite server it runs on locally. `source` is the directory whose git history dates
 * the entry, so nobody has to hand-maintain a "last updated" string.
 *
 * Read at build time by vite.config.ts as well as by the app, so keep it free of
 * anything that only exists in a browser.
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  /** Folder under the deployed site, and the sub-directory the app builds into. */
  path: string;
  /** Port from the app's own `vite.config.ts`, used only by `pnpm dev`. */
  devPort: number;
  /** Workspace-relative directory whose last commit dates this entry. */
  source: string;
  /** Path under `public/`. Absent means the card falls back to a blank tile. */
  thumbnail?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "design-system",
    title: "Tiket Design System",
    description: "Every token, component and icon in the library, in both themes and all three platforms.",
    path: "design-system",
    devPort: 5273,
    source: "packages",
    thumbnail: "thumbnails/design-system.png",
  },
  {
    id: "example-prototype",
    title: "Example Prototype",
    description: "A tiny starter screen built on the design system. Copy it to start a new prototype.",
    path: "example-prototype",
    devPort: 5276,
    source: "apps/example-prototype",
    thumbnail: "thumbnails/example-prototype.png",
  },
  {
    id: "unified-card-token",
    title: "Unified Card Token with Blibli",
    description: "Re-entry flow for legacy saved cards: at checkout and from the saved payment methods page.",
    path: "unified-card-token",
    devPort: 5277,
    source: "apps/unified-card-token",
  },
];
