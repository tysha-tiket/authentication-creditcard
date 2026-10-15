# The prototype site

One Vercel site that holds the homepage and every prototype, behind one shared password.
It's built on this computer and uploaded as plain static files: `vercel.json` turns Vercel's
own build off, so Vercel never needs the `tix ds` workspace.

| Path | What | Source |
|---|---|---|
| `/` | Homepage (project index) | `tix ds/apps/home` |
| `/design-system/` | Tiket Design System kitchen sink | `tix ds/apps/kitchen-sink` |
| `/example-prototype/` | Example Prototype (starter screen) | `tix ds/apps/example-prototype` |
| `/auth/` | Password page (rendered by `middleware.js`) | `middleware.js` |

```bash
npm run build     # builds every app into public/
npm run preview   # serves public/ at http://localhost:5280 (no password locally; the middleware only runs on Vercel)
npm run deploy    # build + `vercel deploy --prod` (needs `npx vercel login` and a linked project once)
./set-password.sh # choose or change the password; also deploys
```

## Adding a prototype

1. Add an entry to `SITE` in `build.mjs` (app folder and URL path).
2. Add a card with the same `path` to `tix ds/apps/home/src/projects.ts`, plus a thumbnail in
   `tix ds/apps/home/public/thumbnails/`.
3. `npm run deploy`.

Every link inside an app must use Vite's `base` (`import.meta.env.BASE_URL`), never a
hard-coded `/…`, because each app is served from its own sub-folder here.

## Password

`middleware.js` runs in front of every file (Vercel Routing Middleware, Node.js runtime). A
visitor without a valid session gets the password page at `/auth/`. The right password gives
them a signed cookie for 7 days. `/auth/logout/` signs out.

- **Set or change the password:** `./set-password.sh`. It asks twice (hidden), stores only a
  PBKDF2 fingerprint as the sensitive Vercel variable `SITE_PASSWORD_HASH`, then rebuilds and
  deploys. A new password signs everyone out.
- **From another computer:** in Vercel → Project → Settings → Environment Variables, add a
  sensitive `SITE_PASSWORD` (plain) and delete `SITE_PASSWORD_HASH` (it takes priority). Then
  go to Deployments → latest → Redeploy.
- **Guessing:** each wrong try waits about 1s, and 5 wrong tries from one IP pause it for 10
  minutes (best effort). A long password is the real protection.
- **Fails closed:** if no password is set, the whole site stays locked and shows "This site
  isn't set up yet".
- **Optional `SITE_ORIGIN`** (e.g. `https://yourname-design.vercel.app`) sends every other
  hostname of the project to that one address.

### The password page

It's all in `middleware.js`: about 4 KB gzipped, with no image files.

- **Eye button** shows or hides the password.
- **Mascot** (`MASCOT`): a minimal black-and-white face with half-moon eyes and a smirk.
  - Its face and eyes follow the end of the typed text, reaching the far right at about 25
    characters (`Math.min(room, 160)` in `PAGE_SCRIPT`).
  - Sunglasses drop over its eyes while the password is shown.
  - After a wrong password it frowns and shakes its head.
  - It blinks now and then.
- **Caption** under the mascot: "masukin pass nya" while the password is hidden, "udah bener
  belum?" while it's shown.
- **Phones:** the page fits the area above the keyboard (`visualViewport`, `fit()` in
  `PAGE_SCRIPT`). When the keyboard is open, **Enter** sits 8px above it and the mascot
  shrinks to 84px. The field text is 16px so iOS doesn't zoom in.
- Motion is reduced for people who turn on "reduce motion" in their system settings.
- The tab title says "Private — My tiket project". Personalise it in `page()`.

### How visitors are remembered

The browser stays signed in for **7 days** (`SESSION_DAYS`). They're asked again after that,
on another browser or device, in incognito, after clearing cookies, after a password change,
or after `/auth/logout/`.

## What to do if…

- **Forgot the password:** it can't be recovered, because only a fingerprint is stored. Run
  `./set-password.sh` to set a new one.
- **The password leaked:** run `./set-password.sh` with a new one. Everyone is signed out
  immediately.
- **New computer:**
  1. Copy the whole folder, including `public-site/.vercel/` (the link to the Vercel project).
  2. Install Node.js 22+.
  3. Run `npx -y pnpm@11.13.1 install` in `tix ds/`.
  4. Run `npx vercel login` with the same account.
  5. Run `npm run deploy`.
- **Vercel says you're logged out:** run `npx vercel login` and try again. The live site keeps
  working meanwhile.
- **"Too many wrong tries":** the visitor waits 10 minutes.
- **Make the site public:** move `middleware.js` into `alternatives/` and run `npm run deploy`.
- **Company accounts only instead of a password:** see `alternatives/` (Google sign-in). It
  needs a Google OAuth client, which company Google Cloud may not allow you to create.
