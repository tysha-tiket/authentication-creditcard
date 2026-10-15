# Prototype starter kit: setup guide

This kit gives you a private website for code prototypes built on the **Tiket Design
System**. It has:

- **A homepage** that lists your prototypes as cards.
- **The design system's own gallery** (`/design-system/`): every token, component and icon.
- **An example prototype** (`/example-prototype/`): a tiny screen to copy for new work.
- **One shared password** in front of everything, with a playful password page. The mascot
  follows your typing and puts on sunglasses when you show the password.

It's hosted free on Vercel at an address like `https://yourname-design.vercel.app`.

> **For Claude:** this file is your instructions. Work through the steps in order. The person
> you're helping may not be technical, so explain each step in plain words and run the
> commands yourself where you can. A few steps can only be done by the person: logging in to
> Vercel and choosing the password. **Never** ask for, see, type or store their password or
> Vercel credentials. Start the right script or command in a terminal and let them type. Check
> each result before moving on (open the page, look at the output), and tell them honestly if
> something failed.

---

## What's in the folder

```
SETUP.md                 this guide
CLAUDE.md                makes Claude read this guide automatically in this folder
.claude/launch.json      preview servers for the Claude desktop app
tix ds/                  the design system workspace (pnpm monorepo)
  packages/tokens        colours, type, spacing, radius, elevation → tokens.css (--tds-*)
  packages/fonts         Tiket Odyssey Text (licensed Tiket typeface: internal use only)
  packages/ui            the React components (@tiket-ds/ui)
  apps/home              the homepage (project index)           dev port 5275
  apps/kitchen-sink      the design system gallery               dev port 5273
  apps/example-prototype the starter prototype                   dev port 5276
  tds library/           raw icon, font and loader drop
  docs/                  design spec and component inventory
  AGENTS.md, GOALS.md    rules for working inside the design system: read before changing it
public-site/             builds everything into one site and deploys it to Vercel
  build.mjs              which apps go into the site, and at which URL path
  middleware.js          the password gate and the password page (runs on Vercel)
  set-password.sh        choose or change the password (also deploys)
  README.md              how the site and password work, plus a "what to do if…" list
  alternatives/          an unused Google sign-in version (company accounts only)
```

## What the person needs

- A Mac with **Node.js 22 or newer**. Check with `node -v`. If it's missing, ask them to install
  the LTS version from https://nodejs.org (it's a normal installer).
- A free **Vercel account** (https://vercel.com/signup, e.g. "Continue with GitHub" or email).
  They create it themselves.
- About 30 minutes.

`pnpm` doesn't need to be installed: every command below uses `npx -y pnpm@11.13.1`.

---

## Step 1: Install and build the design system

```bash
cd "tix ds"
npx -y pnpm@11.13.1 install
npx -y pnpm@11.13.1 build
```

`install` downloads the libraries (about 250 MB, a minute or two). `build` builds tokens, fonts
and components. Both should end without errors. Optionally run
`npx -y pnpm@11.13.1 exec tsc --build`, which should print nothing.

## Step 2: Personalise

Ask the person what name to show (e.g. "Budi"). Replace **"My tiket project"** with
**"Budi’s tiket project"** (keep the curly apostrophe ’) in:

1. `tix ds/apps/home/src/App.tsx` (the homepage heading)
2. `tix ds/apps/home/index.html` (`<title>` and `application-name`)
3. `public-site/middleware.js` (`<title>Private — My tiket project</title>` in `page()`)

A profile picture is optional: put a square `avatar.jpg` in `tix ds/apps/home/public/` and
uncomment the `<img className="home__avatar" …>` line in `App.tsx`.

## Step 3: Look at it locally

Start the three dev servers. In the Claude desktop app, use the `home`, `design-system` and
`example-prototype` launch configs. In a terminal:

```bash
cd "tix ds"
npx -y pnpm@11.13.1 dev:all
```

Then:

- **Homepage:** http://localhost:5275
- **Design system:** http://localhost:5273
- **Example:** http://localhost:5276

Homepage cards link to the other dev servers, so they only work while those servers run.
There's no password locally, because the password gate only runs on Vercel.

To preview the exact site that will be uploaded:

```bash
cd public-site
npm run build
npm run preview    # http://localhost:5280
```

## Step 4: Put it online (Vercel)

**4a. Log in.** The person runs this themselves, because it opens a browser login:

```bash
npx vercel login
```

Check with `npx vercel whoami` (prints their username).

**4b. Create and link the project.** Pick a project name, e.g. `budi-tiket-prototype`:

```bash
cd public-site
npx vercel project add budi-tiket-prototype
npx vercel link --yes --project budi-tiket-prototype
```

This creates `public-site/.vercel/`, the link. Keep it, and never share or commit it.

**4c. Set the password. This also publishes the site.** The person types the password, not
Claude. Start the script in a terminal (in the desktop app, use `run_in_terminal`) and let them
type:

```bash
cd public-site
./set-password.sh
```

It asks for the password twice (hidden), saves only a fingerprint to Vercel, builds
everything, and deploys. Suggest at least 10 characters that are easy to say, e.g.
`orange-kite-runway-42`. Wait for "Done".

Deploying before a password exists is safe: the site stays locked and shows "This site isn't
set up yet". It never shows the prototypes.

**4d. Get a nice address** (optional, free). Vercel gives `budi-tiket-prototype.vercel.app`. For
a custom `*.vercel.app` name:

```bash
cd public-site
npx vercel domains add budidesign.vercel.app budi-tiket-prototype
printf 'https://budidesign.vercel.app' | npx vercel env add SITE_ORIGIN production --force --no-sensitive
npm run deploy
```

`SITE_ORIGIN` makes every other address of the project redirect to the nice one.

**4e. Verify.** Check that:

- Opening the address in a private window shows the password page.
- `curl -s -o /dev/null -w '%{http_code}' https://<address>/design-system/` prints `303`, a
  redirect to the password page.
- After the person enters the password, the homepage, the design system and the example open.

## Step 5: Daily use

- **Publish changes:** `cd public-site && npm run deploy`. The password stays.
- **Change or reset the password:** `./set-password.sh`. Everyone is signed out. A forgotten
  password can't be recovered, only reset.
- **Visitors stay signed in for 7 days** on each browser.
- `public-site/README.md` has the full "what to do if…" list: forgotten password, new
  computer, logged out of Vercel, going public, and more.

## Step 6: Add a new prototype

1. **Copy the example.** Copy `tix ds/apps/example-prototype` to `tix ds/apps/<new-name>`
   (lowercase, dashes), without `node_modules`.
2. **Rename it** in the new folder:
   - `package.json`: `"name": "@tiket-ds/<new-name>"` (in two places, including `build:deps`).
   - `vite.config.ts`: the next free port (5277, 5278, …).
   - `index.html`: the `<title>`.
3. **Register it:**
   - `tix ds/tsconfig.json`: add `{ "path": "./apps/<new-name>" }`.
   - `tix ds/apps/home/src/projects.ts`: add a card with `id`, `title`, `description`,
     `path: "<new-name>"`, `devPort`, `source: "apps/<new-name>"`, and `thumbnail`.
   - `public-site/build.mjs`: add `{ app: "tix ds/apps/<new-name>", path: "<new-name>" }` to
     `SITE`.
   - `tix ds/scripts/build-site.mjs`: add it to `SITE` too (only used by `pnpm build:site`).
   - `.claude/launch.json`: optionally add a preview config.
4. **Link the new app's libraries:** run `npx -y pnpm@11.13.1 install` in `tix ds/`.
5. **Add a thumbnail:** a square PNG screenshot of the new app (about 400×400) in
   `tix ds/apps/home/public/thumbnails/<new-name>.png`.
6. **Build the screen.** See the rules below.
7. **Publish:** `cd public-site && npm run deploy`, then check it on the live site.

### Rules for building screens

- Build **only** from `@tiket-ds/ui` components and the `--tds-*` tokens (colour, spacing,
  radius, elevation, typography). Don't hard-code hex colours, font families or sizes that a
  token already covers.
- Before building, read `tix ds/AGENTS.md` and `tix ds/docs/COMPONENT-INVENTORY.md`. Open the
  gallery (port 5273) to see components rendered. The token names are in
  `tix ds/packages/tokens/dist/tokens.css`.
- Wrap each screen in `<TiketProvider theme="light" platform="mobile">`. Import
  `@tiket-ds/fonts/fonts.css`, `@tiket-ds/tokens/tokens.css` and `@tiket-ds/ui/styles.css`
  once, in `main.tsx` (see the example).
- If a piece doesn't exist in the library, compose it from tokens in the app's own CSS. Never
  edit `tix ds/packages/*` for a single prototype.
- Links back to the homepage use `HOME_HREF` (see `src/home.ts` in the example). Asset URLs
  use `import.meta.env.BASE_URL`, because each app lives in a sub-folder on the site.
- Check visually in a browser, at phone width (about 375–412px), before calling it done.

---

## Troubleshooting

- **`pnpm: command not found`:** use `npx -y pnpm@11.13.1 …` as written above.
- **A build crashes with a WASM `RuntimeError: unreachable` / "memory allocation failed":** the
  install is missing native binaries (`@rolldown/binding-darwin-arm64`,
  `lightningcss-darwin-arm64` under `tix ds/node_modules/.pnpm/`). Delete
  `tix ds/node_modules` and run `npx -y pnpm@11.13.1 install` again. If that doesn't fix it,
  `npm pack` those two packages at the versions in the lockfile and copy their `.node` files
  into the matching `.pnpm` folders.
- **`pnpm install` aborts asking to remove `node_modules` (no terminal):** run it in a real
  terminal, or delete `tix ds/node_modules` first.
- **Port already in use:** another dev server is running. Stop it, or use the next free port.
- **"Couldn't save to Vercel" from `set-password.sh`:** the Vercel login expired. Run
  `npx vercel login` and run the script again.
- **The homepage card opens a blank page locally:** that prototype's dev server isn't running.
  Use `dev:all`, or start it from `.claude/launch.json`.
- **The site still shows old content:** run `npm run deploy` in `public-site/`, not in
  `tix ds/`.

## Good to know

- The **Tiket Odyssey** font files are licensed Tiket type. Keep this kit inside the company,
  and don't publish the folder to a public repository.
- **Free tiers:** Vercel Hobby is enough. Nothing here costs money.
- **Security:**
  - Prototypes are only sent after the password check, which happens on Vercel's servers.
  - Nothing in the page source contains the password.
  - The password is stored as a PBKDF2 fingerprint.
  - Sessions are HMAC-signed cookies tied to the current password.
