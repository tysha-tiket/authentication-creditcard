# Working in this repo

Read `GOALS.md` first. It defines what belongs here and what doesn't.

## Layout

```
packages/tokens      Figma values -> TypeScript objects -> tokens.css custom properties
packages/fonts       Odyssey TTFs -> woff2 + @font-face
packages/ui          The components. Depends on tokens and fonts.
apps/home            The project index. Lists every prototype below.
apps/kitchen-sink    Style / Components / Icons, both themes, all platforms
tds library/         The raw drop: `tds icon/` SVGs (committed), `tds font/` TTFs (not)
docs/                Extracted design spec and the component status table
scripts/             Guardrails run by `pnpm verify`, plus the site build
```

Dependencies point one way: `ui` -> `tokens`/`fonts`. Nothing depends on an app, and no
app imports another — including `home`, which reaches the others by URL. `pnpm build:site`
is the only thing that knows they belong to one deployment.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | The kitchen sink on :5273 — the design system is the only thing to run |
| `pnpm dev:kitchen-sink` | The same thing, spelled out |
| `pnpm dev:home` | Project index on :5275 |
| `pnpm dev:all` | Both at once, which is what makes the link between them work |
| `pnpm build` | Builds all packages |
| `pnpm build:site` | The whole deployable site into `dist/` — what Vercel runs |
| `pnpm verify` | build + typecheck + lint + token guardrail — run before you finish |
| `pnpm tokens:build` | Regenerates `tokens.css` after editing token sources |
| `pnpm fonts:build` | Re-converts TTFs to woff2 |
| `pnpm changeset` | Records a version bump; required for any change to a package's public API |

## Rules

**Never hardcode a design value in a component.** No hex, no `rgba()`, no font
family, in `packages/ui/src/styles/*.css`. `scripts/check-tokens.mjs` fails the build
on these. Raw values belong in `packages/tokens/src/primitives.ts` and nowhere else.

**Don't invent values that Figma didn't give you.** If a spacing, radius or color
isn't in `docs/DESIGN-SYSTEM.md`, go read the node in Figma (the inventory has the
node IDs) rather than eyeballing a screenshot. If Figma's label disagrees with what
it renders, follow the render and write the discrepancy down in the design system doc.

**Style with tokens and data attributes, not variant class strings.** Components set
`data-variant`, `data-size`, `data-state`; CSS selects on them. This keeps the class
API stable and makes the CSS readable next to the Figma variant table.

**Every icon comes from `tds library/tds icon`.** No exceptions, and nothing drawn by
hand — not a `clip-path` polygon, not a CSS triangle, not path data eyeballed from a
screenshot. A component that draws its own glyph (the dropdown and accordion chevrons)
transcribes it into `packages/ui/src/icons/`: `d` copied verbatim from the named file,
the exported `fill` swapped for `currentColor` so `--tds-icon-*` still drives the colour.
A component that takes an icon as a prop gets passed the real file. If the drop has no
icon for what you need, that is a finding to raise, not a licence to draw one.

**Every new component needs its Code Connect mapping.** `Foo.tsx` gets
`Foo.figma.tsx` next to it, mapping the Figma variant property names *exactly* as
Figma spells them, including the numeric prefixes like `"01 Enabled"`. Without it,
the next design-to-code request regenerates a component that already exists.

**Update `docs/COMPONENT-INVENTORY.md` in the same change.** A component that is
built but still says `todo` will get built again.

## Adding a component

1. Find its row in `docs/COMPONENT-INVENTORY.md` for the node ID and variant list.
2. `get_design_context` on that node. Cross-check every value against
   `docs/DESIGN-SYSTEM.md`; a value with no token is a finding to record, not a
   reason to inline a hex.
3. Build it in `packages/ui/src/components/`, styles in
   `packages/ui/src/styles/<group>.css`, export from `src/index.ts`.
4. Add it to the kitchen sink with every variant visible.
5. Look at it: both themes, all three platforms, keyboard only.
6. Add `<Name>.figma.tsx`, flip the inventory row to `done`, `pnpm changeset`.
7. `pnpm verify`.

## Adding a prototype to the index

A prototype is a normal app in `apps/` that knows nothing about the index. Two files
connect it:

1. `apps/home/src/projects.ts` — the card: title, description, the folder it's served
   from, its dev port, and the directory whose git history dates the entry.
2. `scripts/build-site.mjs` — the same folder name again, next to the pnpm filter that
   builds it. These two have to agree; when they don't, the card 404s on click.

Then give the app a back link to `HOME_HREF` so a visitor isn't stranded, and make sure
anything it loads from `public/` goes through `import.meta.env.BASE_URL` — a
leading-slash `src` works on the app's own dev server and breaks once it's a folder of
the deployed site.

## Deploying

Vercel builds from the **joy-proto repo root** (`vercel.json` + `scripts/build-site.mjs`).
Root Directory in the project settings must be empty (`.`), not this folder.

This project lives at `projects/tix ds/` and is composed into
`/design-system/` on the deployed site. The JOY vault landing page owns `/`.

The font build is the part most likely to bite. Odyssey's TTFs are never committed, so
CI has none of them and `fonts:build` ships a system-font fallback rather than failing —
see `packages/fonts/README.md` before "fixing" a deployment that renders in the wrong
typeface. Locally they're read from `tds library/tds font/`.

## Figma access

File key `RwaA7bpig0BrC9kpFOvjzD`. The MCP server needs auth; if a call returns an
auth error, run `mcp_auth` for the Figma server and retry.

This export ships no variable collections — the tokens were read off the
documentation frames on the canvas. So `get_variable_defs` will come back thin; trust
`docs/DESIGN-SYSTEM.md` and the node geometry instead.
