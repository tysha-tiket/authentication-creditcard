# Passport Tiket Design System — Extracted Reference

Everything below was read out of the Figma file
`Passport Tiket Design System  for Claude` (file key `RwaA7bpig0BrC9kpFOvjzD`,
page `Foundation & Components`, exported 2026-08-01) via the Figma MCP.

This document is the human-readable record of that extraction. The machine-readable
version lives in `packages/tokens/src/`. If the two ever disagree, re-run the
extraction rather than editing either by hand.

## Important: the file has no Figma variables

`figma.variables.getLocalVariableCollectionsAsync()` returns an empty array, and there
are zero local paint / text / effect styles. The `.fig` export stripped them.

Consequence: **the documentation frames on canvas are the source of truth**, not
variables. Tokens were reconstructed by reading the swatch fills, their printed hex
labels, and the component geometry directly. When the original Passport library
becomes available as a real Figma library, the token sync should be pointed at its
variable collections instead — the token names here were chosen to match the labels
printed in the file so that swap stays mechanical.

## Fonts

The design system uses **Tiket Odyssey Text**. The eight TTFs in `tiket design system/`
carry three different `family` name records, so Figma lists them as three families:

| File | Figma family | Figma style | CSS weight / style |
|---|---|---|---|
| `TiketOdysseyText-Regular.ttf` | Tiket Odyssey Text | Regular | 400 normal |
| `TiketOdysseyText-Italic.ttf` | Tiket Odyssey Text | Italic | 400 italic |
| `TiketOdysseyText-SemiBold.ttf` | Tiket Odyssey Text SemiBold | Regular | 600 normal |
| `TiketOdysseyText-SemiBoldItalic.ttf` | Tiket Odyssey Text SemiBold | Italic | 600 italic |
| `TiketOdysseyText-Bold.ttf` | Tiket Odyssey Text | Bold | 700 normal |
| `TiketOdysseyText-BoldItalic.ttf` | Tiket Odyssey Text | Bold Italic | 700 italic |
| `TiketOdysseyText-ExtraBold.ttf` | Tiket Odyssey Text ExtraBold | Regular | 800 normal |
| `TiketOdysseyText-ExtraBoldItalic.ttf` | Tiket Odyssey Text ExtraBold | Italic | 800 italic |

In code all eight collapse into one CSS family, `Tiket Odyssey Text`, differentiated by
`font-weight` and `font-style`. There is no Light (300) or Medium (500) weight — do not
reference one.

Only three weights are actually used by the type ramp: Regular (400), SemiBold (600),
Bold (700). ExtraBold (800) ships but is unused by any documented token.

## Typography

Read from the FONT section table. Line heights are stored as percentages in Figma; the
pixel value in parentheses is what the table documents and what the tokens use.

| Token | Weight | Size | Line height | Documented use |
|---|---|---|---|---|
| Heading 1 | Bold 700 | 56 | 60 (107%) | Banner title |
| Heading 2 | Bold 700 | 38 | 42 (111%) | Oversized screen title, once per page |
| Heading 3 | Bold 700 | 28 | 30 (107%) | Main titles, once per page |
| Body 1 | Regular 400 / Bold 700 | 18 | 24 (133%) | Large button, link, sub heading |
| Body 2 | Regular 400 / Bold 700 | 16 | 22 (138%) | Small button, link, body copy, textfield |
| Body 3 | Regular 400 / Bold 700 | 14 | 20 (143%) | Caption, helper, textfield label |
| Small | SemiBold 600 | 12 | 16 (133%) | Label only |
| Slashprice | SemiBold 600 | 14 | 16 (114%) | Slashed price |
| Extra Small | Regular 400 / Bold 700 | 10 | 14 (140%) | Paragraph |
| Extra Small Print | Regular 400 / Bold 700 | 8 | 12 (150%) | Label only |

Tracking is `0` (normal) on every token.

Tokens whose weight column reads "Bold/Regular" ship as a pair: `body1` and
`body1Bold`, etc. `heading*` are Bold only; `slashprice` is SemiBold only. `small` ships
as a pair too, but an unusual one — see the note below.

### The component frames number the body ramp one step lower

The style names attached to the component nodes disagree with the FONT table above. On
`Forms - 05 Search Form` and `bottom sheet`, Figma reports "Body 1 - Regular/Mobile" at
16/22, "Body 2" at 14/20, "Body 3" at 12/16 and "Heading 3/Mobile" at 18/24 — each one
step below where the table puts that name.

The metrics are what matter and they line up exactly, so components map by size, not by
name: a node styled "Body 1" uses `body2`, "Body 2" uses `body3`, and a sheet title styled
"Heading 3" uses `body1Bold`. The gaps were both in the 12/16 box, which the table only documents as SemiBold (`small`):
its Regular sibling ships as `smallRegular` (a search form's label line, a progress step
title, a bottom nav label) and its Bold sibling as `smallBold` (a pagination cell, a
progress step number).

A third gap turned up in the calendar. The "Today" caption above a date cell is styled
"Small (⚠️ spesific use case)/Mobile" at 10/14 SemiBold — the 10/14 box, which the table
documents in Regular and Bold only. It ships as `extraSmallSemibold`. The warning in the
style's own name suggests Figma knows it is off the ramp.

Worth settling in Figma, because every future component read off a frame has to be
translated the same way.

## Color — primitives

Ten ramps. Each runs 100 (lightest) to 900 (darkest), except Neutral which runs
N0 (white) to N900 (near-black) with an extra N50.

Neutral: N0 `#FFFFFF` · N50 `#F8F9FD` · N100 `#EEF0F7` · N200 `#D8DCE8` · N300 `#C0C3CF` · N400 `#AEB2BE` · N500 `#8C909E` · N600 `#71747D` · N700 `#4D4F56` · N800 `#303135` · N900 `#18191B`

Blue: B100 `#E7F2FF` · B200 `#A3CFFF` · B300 `#5BAAFF` · B400 `#007CFF` · B500 `#0064D2` · B600 `#004FA7` · B700 `#003D81` · B800 `#002A58` · B900 `#001833`

Green: G100 `#E2FBED` · G200 `#A8E5C4` · G300 `#66CC94` · G400 `#3CCC7D` · G500 `#0BAE54` · G600 `#088942` · G700 `#076A33` · G800 `#054A24` · G900 `#022612`

Red: R100 `#FFDFDF` · R200 `#FC9999` · R300 `#FC7474` · R400 `#F15C59` · R500 `#E52424` · R600 `#B81D1D` · R700 `#8C1616` · R800 `#610F0F` · R900 `#380909`

Yellow: Y100 `#FEF8D0` · Y200 `#FEF2A2` · Y300 `#FEEC73` · Y400 `#FEE645` · Y500 `#FEDD00` · Y600 `#E5C700` · Y700 `#AD9700` · Y800 `#6C5E00` · Y900 `#3D3500`

Magenta: M100 `#FCEEF7` · M200 `#F6CBE8` · M300 `#ED96D0` · M400 `#E76FBF` · M500 `#DE3FA9` · M600 `#C0218B` · M700 `#8C1865` · M800 `#460C32` · M900 `#330724`

Orange: O100 `#FFE9D6` · O200 `#FFC799` · O300 `#FFA55C` · O400 `#FF841F` · O500 `#FF7200` · O600 `#E06500` · O700 `#B85300` · O800 `#8F4000` · O900 `#662E00`

Purple: P100 `#EDE6FF` · P200 `#D6C8FB` · P300 `#B29AF7` · P400 `#8A6BF0` · P500 `#6B46E3` · P600 `#5F3FD9` · P700 `#4F31B8` · P800 `#3A258F` · P900 `#24165C`

Turquoise: T100 `#E0F1F5` · T200 `#9FDFED` · T300 `#7CD4E4` · T400 `#30B6C5` · T500 `#10A4AF` · T600 `#148692` · T700 `#174F59` · T800 `#14353C` · T900 `#092227`

Alpha: A80 `#FFFFFF` @ 80% · A60 `#FFFFFF` @ 60% · AW40 `#FFFFFF` @ 40% · AB40 `#18191B` @ 40%

Neutral Dark (the dark-mode neutral ramp, deliberately inverted so `N0` stays "the
page background" and `N900` stays "the strongest text"):
N0 `#0D0E12` · N50 `#16171D` · N100 `#1E2029` · N200 `#2B2F3B` · N300 `#363B49` · N400 `#414858` · N500 `#525B6F` · N600 `#848FA4` · N700 `#C4C9D4` · N800 `#E2E4E9` · N900 `#F5F5F5`

## Color — semantics

Background surfaces carry an explicit dark value in the Figma table; text, icon and
stroke semantics do not, because they resolve through the neutral ramp, which already
flips.

### Background

| Token | Light | Dark | Usage |
|---|---|---|---|
| baseSurface | N0 | `#121212` | Base screen without card, card container |
| sunkenSurface | N50 | `#242628` | Form container, search box |
| backdropSurface | N100 | `#242628` | Base screen with card |
| disabledSurface | N200 | `#242628` | Disabled container |
| highBlue / lowBlue | B400 / B100 | `#001833` | Button or label |
| highGreen / lowGreen | G600 / G100 | `#0A1F0D` | Button or label |
| highRed / lowRed | R500 / R100 | `#350808` | Button or label |
| highYellow / lowYellow | Y500 / Y100 | `#2A2600` | Button or label |
| highMagenta / lowMagenta | M500 / M100 | `#330022` | Button or label |
| highOrange / lowOrange | O500 / O100 | `#331C00` | Button or label |
| highPurple / lowPurple | P500 / P100 | `#1F0D2A` | Button or label |
| highTurquoise / lowTurquoise | T500 / T100 | `#002B2B` | Button or label |
| staticWhite | N0 | N0 | Stays white in dark mode (chip invert, toggle) |
| staticBlack | N900 light ramp | same | Stays black in dark mode (tooltip, snackbar) |
| overlay | AB40 | AB40 | Scrim behind bottom sheet / modal |

### Text

highEmphasis N800 · lowEmphasis N600 · disabled N400 · invert N0 · subtleInvert A80 ·
lightInvert A60 · active B400 · alert R400 · analytic O500 · crossSell P500 ·
positive G600 · price R500 · usp T500 · staticWhite N0 · staticBlack N900

### Icon

highEmphasis N700 · lowEmphasis N400 · disabled N200 · invert N0 · subtleInvert A80 ·
lightInvert A60 · active B400 · alert R400 · analytic O500 · crossSell P500 ·
positive G600 · price R500 · usp T500 · staticWhite N0 · staticBlack N900

Icon high/low emphasis are intentionally one step lighter than the text equivalents
(N700/N400 vs N800/N600) because icon strokes read heavier than text at the same value.

### Stroke

bold N900 · regular N600 · light N400 · disabled N200 · invert N0 · active B400 ·
alert R400 · analytic O500 · crossSell P500 · positive G600 · price R500 · usp T500

## Gradients

All linear. The Figma transform is identity on the swatches, i.e. left-to-right (90deg
in CSS).

| Token | Name | From | To |
|---|---|---|---|
| GB | Blue | `#007BFF` | `#00C1EB` |
| GDB | Dark Blue | `#003D81` | `#30B6C5` |
| GG | Green | `#01CF6C` | `#02CD9C` |
| GL | Light Blue | `#E7F2FF` | `#D9EAFE` |
| GO | Orange | `#E52424` | `#FF7200` |
| GP | Purple | `#FA00B4` | `#7600D2` |
| GR | Red | `#FF4062` | `#FF00B8` |
| GT | Tosca | `#00CC9B` | `#017CFF` |
| GV | Violet | `#18DC9B` | `#6E54EF` |
| GS | Tier Silver | `#47506F` | `#CBD6EC` |
| GGO | Tier Gold | `#614500` | `#EBBF4F` |
| GPL | Tier Platinum | `#0F0F0F` | `#838990` |
| GD | Tier Diamond | `#000208` | `#1258C9` |

## Elevation

Shadow color is always N800 `#303135` at varying alpha.

| Token | Shadow | Usage |
|---|---|---|
| 00 | none | Background / base |
| 01 | `0 2px 8px rgba(48,49,53,0.16)` | Card, snackbar, notification badge |
| 02 | `0 4px 12px rgba(48,49,53,0.20)` | Dropdown menu, raised button, raised card, popover, FAB, modal, dialog |

## Radius

Not documented as its own section — derived from component geometry, and every observed
value fits this scale:

`none` 0 · `xs` 4 (labels) · `sm` 6 (medium/small buttons, segmented control) ·
`md` 8 (large buttons, cards, text fields, tooltips, snackbars, accordions) ·
`lg` 12 (badges) · `xl` 16 (description chips) · `full` 999 (pills, general chips, search box, radio, toggle)

## Spacing

Also derived from component geometry. Observed values: 2, 4, 6, 8, 10, 12, 13, 16, 20,
24. The scale ships as `0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48`; the 13px vertical
padding on large buttons is expressed as a component constant rather than a scale step,
because it exists only to make a 48px-tall button with a 22px line box.

## Motion

Durations and curves are not variables in the file either — they come from the prototype
interactions on the mobile screens, which is the only place the library writes motion
down. `motion.duration` and `motion.easing` carry the general scale; the hero is the one
composite move that is specified end to end, so it ships as its own token group,
`heroMotion`, and gets a live specimen in the kitchen sink (Style › Hero).

### Hero — settle

Read off the Trains landing screen's interaction (`417:20145`, After delay → Smart
animate): **after 100ms, 1000ms, Ease in and out, scale 1.25 → 1**. Ease in and out is
Figma's symmetric curve, `cubic-bezier(0.42, 0, 0.58, 1)`, which the token scale did not
have — `inOut` is the tighter `cubic-bezier(0.65, 0, 0.35, 1)` — so it ships as
`easing.symmetric` and the 1000ms as `duration.hero`.

Three things about it are load-bearing, and all three are easy to lose:

- The move belongs to the **art**, not to the hero. The title, the tabs and the search
  card hold still while the photograph settles behind them.
- It replays on **every change of art**, not just on arrival: switching tabs on a screen
  whose tabs each bring their own photograph re-runs it. Replaying it where the art did
  not change reads as a glitch.
- The 100ms delay is what makes it a settle rather than a zoom. The frame is already
  painted when the art starts moving.

### Hero — stretch

The pull-down at the top of the scroller, which has no Figma interaction because Figma
cannot prototype overscroll. It is a native platform behaviour the hero borrows:
**up to 96px of pull at 60% of finger travel, tapering to nothing at the cap, zooming the
art to 1.12× over that distance and released over 360ms on `easing.decelerate`**.

- The art scales from its **top edge**, so the top stays pinned and only the bottom edge
  travels — the photograph grows into the space instead of a gap opening above it.
- 1.12× is where the art grows by the distance the page travels, on the 800px hero these
  screens draw: the picture keeps up with the finger. Higher and the photograph gains on
  the gesture, which reads as leaning into it; nearer 1× and the page slides over a picture
  that has barely moved. It is stated as a scale rather than a fraction of the hero's
  height so the number means the same amount of zoom at any size.
- Everything over the art travels the same distance the bottom edge does. With that off
  the hero grows behind furniture that has not noticed it moved.
- The gesture itself has **no transition**, so it tracks the finger. The 360ms is for the
  release only.
- The release curve is the one to argue about, and it is why `easing.decelerate` exists.
  `easing.out` is a fine reveal but a poor release: over 96px it spends most of its travel
  in the first third, so the screen leaves the finger faster than the hand did and then
  crawls the last few pixels — which is what "too springy" means. `decelerate` covers the
  distance evenly. The specimen exposes both fields, because the right release depends on
  how far the thing travels.

Both moves respect `prefers-reduced-motion: reduce` by rendering the resting state.

## Icons

Icons appear as instances with the `tds_ic_` prefix — `tds_ic_search`,
`tds_ic_chevron_down`, `tds_ic_oval_cross`, `tds_ic_placeholder`. They are 16px inside
search boxes and 20px inside form fields. The icon library itself is **not** present in
this export as a component page, so icons must be exported per-use from Figma rather
than reconstructed. `packages/ui` therefore ships an `Icon` component that renders
supplied SVG, not a bundled icon set.

## Known discrepancies in the source file

These were found during extraction and are worth fixing in Figma. Code follows the
resolution column.

| Issue | Detail | Resolution in code |
|---|---|---|
| Heading 3 sample vs table | Table documents 28/30; the rendered sample is 24px | Use 28/30 — the table row is internally consistent (107% of 28 = 30) |
| Slashprice line height | Table cell reads "16 (133%)"; the node is 114% | Use 14/16, i.e. 114%. 133% of 14 is 18.6, which contradicts the stated 16 |
| Header row typeface | The FONT table header renders in Nunito Sans | Ignored — it is chrome for the doc table, not a token. Every actual sample uses Tiket Odyssey Text |
| Magenta layer names | Swatches are named `color/Cyan/C###` but labelled M100–M900 | Token name follows the printed label: `magenta` |
| Turquoise layer names | Spelled `color/Turqouise` | Token name is `turquoise` |
| Alpha swatch names | Reuse `color/Turqouise/T800` | Token names follow the printed labels: A80, A60, AW40, AB40 |
| Red primitives | Swatch rectangles are not named `color/Red/*`, so only the printed hex labels exist | Hex values taken from the labels; they are self-consistent with the rest of the ramp |
| Stroke semantics | All stroke swatches have a white fill; the color is on the stroke | Resolved through the printed primitive reference (N900, N600, …) |
| Checkbox | `Control - 01 Selection` has 02 Radio, 03 Toggle, 04 Quantity Editor, 05 Slider — no 01 | Checkbox is absent from this export and is not implemented |
| Body ramp names on component frames | Component nodes name their styles one step below the FONT table (a 16px line is "Body 1") | Map by metrics, not by name. See "The component frames number the body ramp one step lower" above |
| Slider active track | `Initial` draws it edge to edge; `Half` draws it from the left thumb's centre | Centre to centre. The 22px thumb covers the 11px the two readings differ by |
| Slider states | No disabled variant is documented | `Slider` has no `disabled` prop rather than an invented grey |
| Wheel picker row heights | The selected row is drawn 8px shorter than the others | Uniform rows — a wheel can only snap if every row is the same height |
| Quantity editor spent button | The flat button's ring is `icon/low-emphasis`, not `stroke/disabled` | Followed: `--tds-stroke-light`, the same value under a border's name |
| iOS home indicator | Specified as the N800 primitive, which is invisible on a dark sheet | `--tds-text-high-emphasis` — N800 in light theme, and it inverts |
| Label fills reach past the semantic layer | Secondary/Multi Red fills with the `red/r400` primitive, not `background/high-red` (a darker red); Orange fills with `orange/o500`, not `background/high-orange` | Used `--tds-text-alert` and `--tds-text-analytic`, which are those two primitives under semantic names. The background ramp has no token for either value |
| Multi label's trailing chip | Red pairs with `background/low-yellow`, Orange with `background/low-red`, while Green and Blue stay in their own family | Followed per tone. The warm-on-warm pairing looks deliberate but is written down nowhere; undocumented tones get the neutral surface rather than an invented pair |
| Primary Neutral label fill | The only tone whose fill is not bound to a variable | `--tds-bg-sunken-surface`, by inspection |
| Violet labels | Ship as a single gradient variant with no solid fill, unlike the other four tones | `tone="violet"` is gradient-only and ignores `gradient={false}` |
| Ribbon gradient naming | `- 04 Orange` names its property `Color = Solid \| Gradient`; the other four use `Gradient = True \| False` | One `gradient` boolean for all five |
| Progress step connector | An instance of `Divider - Horizontal` with its colour overridden to n400 (and to high-blue once complete) | Drawn in the progress step's own CSS. `Divider`'s colour is the lighter n200, and a component whose colour every instance overrides is not being reused |
| Progress step numbering | A completed step shows a tick, not its own number | Followed: the number is the step's position, and `current` decides which steps have passed |
| Pagination ellipsis | Has a `Type = Inactive` property with no second value | Rendered as text rather than a button — there is no agreed behaviour for pressing it |
| Calendar "Today" caption | Styled "Small (⚠️ spesific use case)/Mobile", 10/14 SemiBold, which the FONT table has in Regular and Bold only | Shipped as `extraSmallSemibold` |
| Calendar range wash | Drawn as `.Calendar - Selection` rectangles placed by hand per row, sized 226 or 320 against a 320 content box, and reaching into the screen margin | Painted by the cells themselves, so it cannot drift from the selection. The margin is filled only on the side the range continues towards, which is what those two widths add up to |
| .Calendar - Hide Price | Renders identically to `.Calendar - No Price` | Both kept as `priceDisplay` values (`"hidden"`, `"none"`): the distinction is a vertical that has prices and has them switched off versus one that has none, which is worth being able to say |
| Calendar day cell height | Fixed at 44px, but 5px padding plus a 20px number plus a 16px price comes to 46 | The 44px stands — it is the minimum target size — and the padding gives way |
| Calendar general price dot | `Show Detail=False, Cheaper=False` is an n400 dot at zero opacity | Hidden rather than removed, so the row keeps its height. The grey dot is never visible, so its colour is moot |
| .Calendar - Month resting fill | The `color/neutral/n50` primitive rather than `background/sunken-surface`, which is the same `#F8F9FD` | Used the semantic token, which follows the theme; the primitive would stay near-white on a dark page |
| Mini Title Scrollig | A second style for the month heading — 14 bold under Elevation/01 — for when it is pinned to the top of a scroll | The heading is `position: sticky` and keeps its 16 bold block styling: CSS can pin it but cannot tell it that it is pinned |
