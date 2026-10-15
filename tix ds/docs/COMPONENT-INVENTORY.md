# Component Inventory

Every component set found on the `Foundation & Components` page of Figma file
`RwaA7bpig0BrC9kpFOvjzD`, with its variant properties exactly as Figma names them.

Status legend: **done** = built and rendered in the kitchen sink · **partial** = built
but not every variant · **todo** = specs captured, not built · **blocked** = cannot be
built from this export.

Node IDs are stable and can be passed straight to `get_design_context` /
`get_screenshot` when picking up a `todo`.

## Two copies of the library

There is a second file, `vGv44hAfDz2Va6NjhwEycd`, with the same name. It contains
everything the first one does under the same `1:*` node IDs, plus later sections whose
components are published only there — Secondary and Multi labels, both Views, Progress
Step, Pagination, the Bottom App Bar, the whole calendar, and second copies of the top
navigation sets. Rows
below carry whichever ID the component is published under; where both exist, both are
listed, first one first.

Code Connect calls the first file `<TDS>` and the second `<TDS-2>`
(`figma.config.json`). If the two are ever reconciled into one file, the substitution to
keep is whichever one the team publishes from — every mapping is written against an alias
precisely so that is a one-line change.

## Actions

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Buttons - 01 Primary | `1:1662` | Size = Large \| Medium \| Small; State = 01 Enabled \| 02 Pressed \| 03 Loading \| 04 Disabled | `Button variant="primary"` | done |
| Buttons - 02 Secondary | `1:1705` | same | `Button variant="secondary"` | done |
| Buttons - 03 Tertiary | `1:1748` | same | `Button variant="tertiary"` | done |
| Buttons - 04 Invert | `1:1791` | same | `Button variant="invert"` | done |
| Buttons - 05 Alert | `1:1834` | same | `Button variant="alert"` | done |
| Buttons - 06 Group - 01 Full Width | `1:1877`, `408:19510` | Sticky = True \| False; Show Inset; Show Button 1 | `ButtonGroup layout="stacked"` | done |
| Buttons - 06 Group - 02 Side By Side | `1:1888`, `408:19521` | Sticky = True \| False; Show Inset | `ButtonGroup layout="sideBySide"` | done |
| Buttons - 07 Slide | `408:19535` | State = Initial \| Pushed \| On Drag half \| On Drag 96% \| On Drag Full \| Loading \| Complete \| Initial Disabled | `SlideButton` | done |

The button page is `408:19737` in `[SSoT] NFT`, and the alert set is `408:19467` there.

`Buttons - 07 Slide` has eight states and three props. Four of them — `Pushed`,
`On Drag half`, `On Drag 96%`, `On Drag Full` — are frames of one drag, which the component
runs from pointer events; giving a caller a prop to set "96% dragged" would be offering
control over something only a finger decides. `Initial Disabled` is the `disabled`
attribute, as it is on `Button`. What is left is `idle`, `loading` and `complete`.

Every button's `03 Loading` draws the `Loading` face (`1:856`), not a spinner or dots. It is
transcribed in `packages/ui/src/icons/loading.tsx` from `tds library/tds loading` — the icon
drop has no glyph for it, and its `tds_ic_smile` is a different drawing. Figma's frames are
stills, so the animation is not in the file; the code blinks it, which is the smallest thing
a still can be turned into without inventing a motion the design does not describe.

## Selection controls

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Control - 01 Selection - 02 Radio | `1:2755` | State = Unselected \| Selected \| Unselected Disabled \| Selected Disabled \| Error | `Radio` | done |
| Control - 01 Selection - 03 Toggle | `1:2738` | Size = Large \| Small; State = Inactivated \| Activated \| Inactivated Disabled \| Activated Disabled | `Toggle` | done |
| Control - 01 Selection - 04 Quantity Editor - 01 Multi Button | `1:2761` | State = Filled \| Typing \| Minimum \| Maximum | `QuantityEditor` | done |
| Control - 01 Selection - 04 Quantity Editor - 02 Single Button | `1:2795` | Type = Plus \| Minus; Disabled = True \| False | `QuantityStepButton` | done |
| Control - 01 Selection - 05 Slider | `1:2780` | State = Initial \| Half \| Focussed | `Slider` | done |
| Control - 02 Segmented - 01 Squircle - Solid | `1:2804` | Size = Medium \| Small | `SegmentedControl shape="squircle"` | done |
| Control - 02 Segmented - 02 Pill - Solid | `1:2817` | Size = Medium \| Small | `SegmentedControl shape="pill"` | done |
| Checkbox | — | — | — | blocked: absent from this export (the `Control - 01 Selection` group jumps from 02 Radio to 03 Toggle) |

## Forms

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Forms - 01 Textfield | `1:2916` | State = Unfilled \| Filled \| Focused \| Typing \| Unfilled Disabled \| Filled Disabled \| Unfilled Error \| Filled Error | `TextField` | done |
| Forms - 02 Dropdown | `1:2981` | State = Unselected \| Selected \| Unselected Disabled \| Selected Disabled \| Unselected Error | `Dropdown` | done |
| Forms - 03 Text Box | `1:3020` | same 8 states as Textfield | `TextArea` | todo |
| Forms - 05 Search Form - 01 Group | `1:3170` | (instance, not a set) | `SearchForm` ×2 + `Button` | done |
| Forms - 05 Search Form - 02 Reversible - 01 General | `1:3084` | State = Initial \| Filled | `SearchForm swap` + `SearchFormField label` | done |
| Forms - 05 Search Form - 02 Reversible - 02 With Subtitle | `1:3119` | State = Initial \| Filled | `SearchFormField subtitle` | done |
| Forms - 05 Search Form - 03 With Toggle | `1:3146` | State = Inactivated \| Activated | `SearchFormField trailing={<Toggle />}` | done |
| Forms - 05 Search Form - 04 Single | `1:3261` | State = Active \| Disabled | `SearchFormPiece` + `Divider` | done |
| Search Box - Grey | `1:3857` | Size = Small \| Medium; State = Unfilled \| Focused \| Typing \| Filled | `SearchBox` | done |

## Display

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Badges - Indicator | `1:1546` | Variant = Red \| Green \| Grey | `Badge kind="indicator"` | done |
| Badges - Number | `1:1525` | Variant = Red \| Green \| Grey; Gradient = True \| False; Single Digit = True \| False | `Badge kind="number"` | done |
| Badges - Text | `1:1550` | Variant = Red \| Green \| Grey; Gradient = True \| False | `Badge kind="text"` | done |
| Chips - 01 General | `1:2662` | State = Inactive \| Active \| Disabled \| Error | `Chip kind="general"` | done |
| Chips - 03 Description | `1:2641` | State = Inactive \| Active \| Disabled \| Error | `Chip kind="description"` | done |
| Labels - 01 Primary - 01 Neutral … 05 Red | `1:3465` (Red) | Size = Medium \| Small | `Label kind="primary" tone` | done |
| Labels - 02 Secondary - 01 Red | `55549:1323` | Gradient = True \| False; Icon Size = 16px \| 12px | `Label kind="secondary"` | done |
| Labels - 02 Secondary - 02 Green | `55549:1344` | Gradient; Icon Size | `Label tone="green"` | done |
| Labels - 02 Secondary - 03 Blue | `55549:1365` | Gradient; Icon Size | `Label tone="blue"` | done |
| Labels - 02 Secondary - 04 Orange | `55549:1386` | Gradient; Icon Size | `Label tone="orange"` | done |
| Labels - 02 Secondary - 05 Violet | `55549:1304` | Icon Size (gradient only) | `Label tone="violet"` | done |
| Labels - 03 Ribbon - 01 Red … 05 Violet | `1:3450` (Red) | Gradient = True \| False | `Label kind="ribbon"` | done |
| Labels - 04 Multi - 01 Red | `1:3472`, `55549:1407` | Gradient = True \| False | `Label kind="multi"` | done |
| Labels - 04 Multi - 02 Green \| 03 Blue \| 04 Orange | `55549:1426`, `55549:1445`, `55549:1464` | Gradient = True \| False | `Label tone` | done |
| Accordion | `1:1460` | Type = Basic \| Flat \| Outline; State = Initial \| Expand | `Accordion` | done |

Labels are one component per tone in Figma, so the tone is which node you mapped and never
a variant property. The tone sets differ per kind — Primary has Neutral, Green, Blue,
Yellow, Red; Secondary and Ribbon have Red, Green, Blue, Orange, Violet; Multi drops
Violet — and `Label` keeps the full semantic set on top of those, because the colors are
documented in the semantic token table independently of the component.

## Views and progress

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| View - Info | `55549:1204` | (single component) | `View` | done |
| View - Section | `55549:1203` | (single component) | `View variant="section"` | done |
| Progress Step - Horizontal - 01 General | `55549:1790` | State = Initial \| Middle \| End | `ProgressStep` | done |
| Progress Step - Horizontal - 02 Custom | `55549:1823` | (instance, not a set) | `ProgressStep` without the scroller | done |
| Pagination | `55549:1990` | State = First \| Middle \| End Page; Disabled = True \| False | `Pagination` | done |
| Countdown - 01 Unboxed | `1:3437` | Show Hours \| Milisecond; Bold; Color | passed into `Label countdown` | todo |

## Calendar

Eleven sets in the `Symbol` section (`55549:3362`) are one `Calendar`. Every set carries a
`Type` listing selections rather than styles — Unselected, Selecting Date, Range Single
Month, Next Month, Range Multi Month 1st/2nd, and the Selecting Year / Range Multi Year
equivalents — so those values come out of `value`, not out of props. What the sets do vary is
day or month cells and which of the four price treatments the vertical uses, which is
`precision` and `priceDisplay`.

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| .Calendar - No Price | `55549:4075` | Type × 6 | `Calendar` | done |
| .Calendar - Specific Price | `55549:3461` | Type × 6 | `Calendar priceDisplay="specific"` | done |
| .Calendar - Hide Price | `55549:3768` | Type × 6 | `Calendar priceDisplay="hidden"` | done |
| .Calendar - Month No Price | `55549:4382` | Type × 5 | `Calendar precision="month"` | done |
| .Calendar - Month General Price | `55549:4478` | Type × 5 | `Calendar precision="month" priceDisplay="general"` | done |
| .Calendar - Month Specific Price | `55549:4574` | Type × 5 | `Calendar precision="month" priceDisplay="specific"` | done |
| .Calendar - Attributes | `55549:3363` | Types = Day \| Holiday \| Legend Price \| Mini Title Scrollig | `CalendarWeekdays`, `CalendarHolidays`, `CalendarLegend` | done except Mini Title Scrollig, which is the month heading's pinned state and is `position: sticky` here |
| .Calendar - BottomBar | `55549:3388` | Type = Single Trip \| Roundtrip Trip \| Time \| Roundtrip with Duration | `CalendarBottomBar` + `CalendarSummary` | done |

The cell and its parts — `.Calendar - Dates` (`55549:4698`), `.Calendar - Month`
(`55549:4724`), `Number-General` (`55549:4684`), `Number-Past` (`55549:4693`),
`Price-General` (`55549:4670`), `Price-Selected` (`55549:4679`) and `.Calendar - Selection`
(`55549:4717`) — are what `Calendar` draws from `entries`. They are read and implemented but
deliberately unmapped and unexported: a snippet for one of them alone would suggest rendering
a single cell by hand.

## Feedback and overlay

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Snackbar - Black | `1:4094` | (single component) | `Snackbar` | done |
| Tooltips | `1:4140` | Tail = ↑ Up \| ← Left \| → Right \| ↓ Down | `Tooltip` | done |
| Banners - Notification - 01 Blue | `1:1580` | Full Screen Width = True \| False | `Banner` | todo |
| bottom sheet | `1:2627` | Property 1 = Bottom Sheet - Picker \| Bottom Sheet - Searchable Lists | `BottomSheet` | done |

## Structure

Components the other sets instantiate. None of them had a row here until something needed
them, which is why their node IDs were read off the sheet and search form rather than off a
page sweep.

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Divider - Horizontal | `1:2086` | Type = Light | `Divider` | done |
| Divider - Vertical | `1:2109` | Type = Light | `Divider orientation="vertical"` | done |
| Navigation - 03 Bottom Sheet - General | `1:2078` | State = Initial | built into `BottomSheet` (title, link, handle) | done |
| Wheel Picker | `1:2146` | Type = Date | `WheelPicker` | done |
| Lists - 04 Image + Action | `1:2112` | — | `ListItem` | todo: the searchable-list sheet composes rows locally until this exists |
| Inset | `1:1611` | OS = IOS; Gesture = Swipe; Background = White \| Transparent | `Inset`, behind the `homeIndicator` prop on `BottomSheet`, `BottomNav` and `BottomAppBar` | partial: iOS swipe only |

## Navigation

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Tabs - 01 General | `1:4088` | (single component, 12 tab slots) | `Tabs` | done |

All fourteen `Navigation - 01 Top` sets are the same bar with different slots filled, so
they are one `TopBar` with `leading`, `media`, `title`, `subtitle`, `search` and `actions`.
Every set has `State` (or `Type`, or on one of them `Initial`) `= Initial | Scrolling`,
which is the `scrolling` prop. The status bar those frames include is device chrome: it is
a `statusBar` slot rather than something the bar draws, so a screen passes nothing and a
mock-up passes `StatusBar`.

| Figma name | Node | Slots the set fills | Status |
|---|---|---|---|
| 01 Regular - 01 Logo + Images + Icons | `55549:2462` | `leading`, `actions` | done |
| 01 Regular - 02 Back + Title + Icons | `55549:2202` | `leading`, `title`, `actions` | done |
| 01 Regular - 03 Big Title + Icons | `55549:2240` | `title`, `actions` | done |
| 01 Regular - 04 Back + Title + Link | `55549:2225` | `leading`, `title`, `actions` | done |
| 01 Regular - 05 Back + Image + Title + Subtitle + Icons | `55549:2404` | + `media`, `subtitle` | done |
| 01 Regular - 06 Back + Title + Subtitle + Button | `55549:2433` | + `subtitle` | done |
| 01 Regular - 07 Back + Searchbox | `55549:2257` | `leading`, `search` | done |
| 01 Regular - 08 Transparant Icons | `1:3677`, `55549:2288`, NFT `408:18049` | `transparent`, `statusBar`, `leading`, `actions` | done |
| 01 Regular - 09 Transparant Searchbox | `1:3657`, `55549:2268`, NFT `408:18029` | `transparent`, `statusBar`, `search`, `actions` | done |
| 02 Extended - 01 Back + Title + Icons | `1:3698`, `55549:2309` | `variant="extended"` | done |
| 02 Extended - 02 Back + Title + Link | `55549:2331` | `variant="extended"` | done |
| 02 Extended - 03 Back + Searchbox + Icons | `55549:2347` | + `search` | done |
| 02 Extended - 04 Back + Searchbox + Link | `55549:2387` | + `search` | done |
| 02 Extended - 05 Back + Searchbox + Title | `55549:2370` | + `search`, `title` | done |
| Navigation - 02 Bottom - Menu | `55549:2185` | `BottomNav` | done, unmapped: the file has it as an instance, not a published component |
| Navigation - 02 Bottom - Filter | `55549:2193` | — | todo |
| Navigation - 03 Bottom Sheet - Transparent | `55549:2501` | — | todo: `BottomSheet` covers `- General` only |
| Navigation - 04 Bottom App Bar | `55549:2485` | `BottomAppBar` | done |

Both Transparant sets have an Initial state with no surface of its own, where every icon
and the search box carry a white pill and an elevation so they stay legible over the
photograph. That is CSS on `[data-transparent]:not([data-scrolling])` rather than a second
arrangement — scrolling puts the bar back on a surface and the pills go away.

The status bar is its own component, on a node in a different file:

| Figma name | Node | Variant properties | Code | Status |
|---|---|---|---|---|
| Status Bar | `[SSoT] NFT` `408:17562` | Platform = IOS \| Android; Theme = Light \| Dark \| Light No Dynamic Island \| Dark No Dynamic Island; Show Dynamic Island | `StatusBar` | done |

`Theme` folds two things together, so it maps to two props: `invert` for the white glyphs a
photograph needs, `dynamicIsland` for whether the island is drawn. It is not the library's
dark theme — the glyphs follow `--tds-text-high-emphasis` and invert with it as `Inset`
does, and `invert` overrides that with the static white.

Its four OS glyphs are not tiket icons and are not in the drop. They are exported from that
same frame into `tds library/device chrome/` and transcribed into
`packages/ui/src/icons/status-bar.tsx` under the rules `packages/ui/src/icons/index.tsx`
sets: `d` verbatim, the fill swapped for `currentColor`.

## Icons

The `tds_ic_*` instances referenced by components (`tds_ic_search`,
`tds_ic_chevron_down`, `tds_ic_oval_cross`, `tds_ic_placeholder`) come from an icon
library that is **not** in this export. `Icon` is therefore a wrapper that renders SVG
passed to it, and the components that need a specific glyph accept an icon prop rather
than hardcoding one. When the icon library is available, export the set and add it as
`packages/icons`.

## Picking up a `todo`

1. `get_design_context` with `fileKey: RwaA7bpig0BrC9kpFOvjzD` and the node ID above.
2. Cross-check the returned values against `docs/DESIGN-SYSTEM.md` — every color,
   radius and spacing value should already have a token name. If one doesn't, that is
   a finding to record here, not a reason to hardcode a hex.
3. Build in `packages/ui/src/components/`, add it to the kitchen sink, add a
   `.figma.ts` Code Connect mapping, then flip the row above to `done`.
