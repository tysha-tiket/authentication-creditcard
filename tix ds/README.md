# Tiket Design System

A React component library built from the Passport Tiket Design System Figma file
(`RwaA7bpig0BrC9kpFOvjzD`). Mobile-first, with desktop and dashboard density built
into the token layer rather than into separate packages.

## Quick start

```bash
pnpm install
pnpm build              # tokens -> fonts -> ui
pnpm dev                # the design system: style, components and icons, in both themes
pnpm dev:home           # the project index that links to it
pnpm dev:all            # both, so the link between them resolves
```

## The deployed site

`pnpm build:site` puts everything into one `dist/`: the project index at the root, and
the design system in a folder beneath it. Anything added to `apps/` later joins it the
same way.

```
/                    Project index
/design-system/      Kitchen sink
```

The apps stay independent — none imports another, and each still runs on its own dev
server at `/`. Only the site build knows they are one deployment, which is why it passes
`--base` and `--outDir` rather than pinning them in each app's config.

## Linking to a component

Every specimen in the kitchen sink is addressable, so a link is enough to say which one you
mean — "the second navigation type" becomes:

```
/design-system/#components/navigation/top/scrolling
```

Anchors read `category/component/variant/example`, with the trailing segments dropped when
you want the whole thing:

| Link | Points at |
| --- | --- |
| `#components/navigation` | The Navigation component |
| `#components/navigation/top` | The regular top bars |
| `#components/navigation/top/scrolling` | One specimen |
| `#components/navigation/top-transparent/searchbox` | Figma's `09 Transparant Searchbox`, over a hero |
| `#components/button/group/sticky-with-home-indicator` | A pinned button group above the home indicator |
| `#components/button/slide` | The slide-to-confirm button |

The first segment is the category, which is how a cold load knows to open that tab before it
scrolls. Hovering a heading reveals a `#` that links to it and copies the absolute URL, and
the "Every link on this tab" list at the top of the page has all of them.

The path is assembled from the nesting rather than written out, by `Section`, `Variant` and
`Example` in `apps/kitchen-sink/src/anchors.tsx` — each contributes one segment, derived
from its label unless it passes an explicit `slug`. Prose labels get a `slug` so the link
stays short and survives a reword.

## Using it in an app

```bash
pnpm add @tiket-ds/ui @tiket-ds/tokens @tiket-ds/fonts
```

```tsx
import "@tiket-ds/fonts/fonts.css";
import "@tiket-ds/ui/styles.css";
import { TiketProvider, Button, TextField } from "@tiket-ds/ui";

export function App() {
  return (
    <TiketProvider theme="light" platform="mobile">
      <TextField label="Full name" />
      <Button variant="primary" size="large">
        Continue
      </Button>
    </TiketProvider>
  );
}
```

`TiketProvider` sets `data-theme` and `data-platform` on its wrapper, which is what
selects the light/dark token set and the density layer. `platform` is `mobile`,
`desktop` or `dashboard`; it changes touch targets and control heights, never colors
or type.

## Packages

| Package | Contents |
|---|---|
| `@tiket-ds/tokens` | Typed token objects plus the generated `tokens.css` custom properties |
| `@tiket-ds/fonts` | Odyssey woff2 files and `@font-face`, normalized to one family with weights 400/600/700/800 |
| `@tiket-ds/ui` | The components, their CSS, and the Code Connect mappings |
| `apps/home` | Not published. The project index; depends on no other workspace package |
| `apps/kitchen-sink` | Not published. Visual reference and the place changes get verified |

## What's built

Text, Icon, Button, ButtonGroup, Badge, Chip, Label, Toggle, Radio, TextField,
Dropdown, SearchBox, SegmentedControl, Accordion, Tabs, Snackbar, Tooltip.

`docs/COMPONENT-INVENTORY.md` has the full table including what isn't built yet
(text area, quantity editor, slider, banner, bottom sheet, top navigation, search
forms) with the Figma node IDs needed to pick each one up.

## Docs

- `GOALS.md` — scope, the multi-platform strategy, definition of done
- `AGENTS.md` — how to work in the repo
- `docs/DESIGN-SYSTEM.md` — extracted color, type, spacing, radius and elevation spec
- `docs/COMPONENT-INVENTORY.md` — every Figma component set and its build status

## Contributing

`pnpm verify` before finishing: it builds, typechecks (including the Code Connect
files), lints, and runs the token guardrail that rejects hardcoded colors and font
families in component CSS. Add a `pnpm changeset` for anything that changes a
package's public API or rendered output.
