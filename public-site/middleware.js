/*
 * One shared password in front of every page (homepage and every prototype).
 *
 * Runs as Vercel Routing Middleware before any file is sent, so nothing behind it
 * reaches a browser until the password is right. The password is never in this file
 * or in anything the browser receives — only a PBKDF2 fingerprint of it, kept in a
 * sensitive Vercel environment variable.
 *
 *   /auth/          password page (GET shows it, POST checks it)
 *   /auth/logout/   signs this browser out
 *
 * Settings (Vercel environment variables, Production):
 *   SITE_PASSWORD_HASH   set by ./set-password.sh — "pbkdf2-sha256$<iterations>$<salt>$<hash>"
 *   SITE_PASSWORD        optional alternative typed into the Vercel dashboard (plain, sensitive)
 *   SITE_ORIGIN          optional canonical address, e.g. https://yourname-design.vercel.app
 *
 * The session cookie is signed with a key derived from the password setting, so
 * changing the password signs everyone out. With no password set the site stays locked.
 */

export const config = { matcher: "/:path*", runtime: "nodejs" };

const SESSION_COOKIE = "proto_session";
const SESSION_DAYS = 7;
const MAX_TRIES = 5; // wrong passwords per IP…
const LOCK_MINUTES = 10; // …before a pause of this long
const WRONG_DELAY_MS = 1200;

/** Best effort: per server instance, so it slows guessing rather than guaranteeing a cap. */
const attempts = new Map();

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const origin = (env("SITE_ORIGIN") || "").replace(/\/+$/, "");

  // One canonical address (old links forward to it).
  if (origin && url.origin !== origin) {
    return Response.redirect(origin + path + url.search, 308);
  }

  // The password page's own font files must load before anyone has signed in.
  if (path.startsWith("/auth/fonts/")) return;

  const secret = await passwordSetting();

  if (path.startsWith("/auth/logout")) {
    return redirect("/auth/?msg=signed-out", [clearCookie()]);
  }

  if (path === "/auth" || path === "/auth/") {
    const next = safeNext(url.searchParams.get("next"));
    if (!secret) return page({ msg: "config", next, status: 503 });
    if (request.method === "POST") return checkPassword(request, secret);
    return page({ msg: url.searchParams.get("msg"), next });
  }

  if (secret && (await hasValidSession(request, secret))) return; // carry on to the file

  return redirect(`/auth/?next=${encodeURIComponent(safeNext(path + url.search))}`);
}

/* ---------- Password check ---------- */

async function checkPassword(request, secret) {
  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  const next = safeNext(String(form?.get("next") ?? "/"));
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";

  const now = Date.now();
  const record = attempts.get(ip);
  if (record && record.lockedUntil > now) {
    return page({ msg: "locked", next, status: 429 });
  }

  if (password && (await passwordMatches(password, secret))) {
    attempts.delete(ip);
    const exp = Math.floor(now / 1000) + SESSION_DAYS * 86400;
    const token = `${exp}.${await hmac(secret.sessionKey, String(exp))}`;
    return redirect(next, [
      `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Lax`,
    ]);
  }

  const count = (record && record.windowEnds > now ? record.count : 0) + 1;
  const windowEnds = record && record.windowEnds > now ? record.windowEnds : now + LOCK_MINUTES * 60_000;
  attempts.set(ip, {
    count,
    windowEnds,
    lockedUntil: count >= MAX_TRIES ? now + LOCK_MINUTES * 60_000 : 0,
  });
  await new Promise((resolve) => setTimeout(resolve, WRONG_DELAY_MS));
  return page({ msg: count >= MAX_TRIES ? "locked" : "wrong", next, status: 401 });
}

/**
 * The stored setting, normalised. `sessionKey` signs cookies; it's derived from the
 * setting, so a new password invalidates every existing cookie.
 */
async function passwordSetting() {
  const hashed = env("SITE_PASSWORD_HASH");
  if (hashed) {
    const [scheme, iterations, salt, hash] = hashed.split("$");
    if (scheme !== "pbkdf2-sha256" || !Number(iterations) || !salt || !hash) return null;
    return {
      kind: "hash",
      iterations: Number(iterations),
      salt,
      hash,
      sessionKey: await sha256("session:" + hashed),
    };
  }
  const plain = env("SITE_PASSWORD");
  if (plain) return { kind: "plain", plain, sessionKey: await sha256("session:" + plain) };
  return null;
}

async function passwordMatches(password, secret) {
  if (secret.kind === "plain") {
    return timingSafeEqual(await sha256(password), await sha256(secret.plain));
  }
  const derived = await pbkdf2(password, b64urlDecode(secret.salt), secret.iterations);
  return timingSafeEqual(derived, secret.hash);
}

async function hasValidSession(request, secret) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) * 1000 < Date.now()) return false;
  return timingSafeEqual(sig, await hmac(secret.sessionKey, exp));
}

/* ---------- Crypto (Web Crypto, no dependencies) ---------- */

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return b64urlEncode(new Uint8Array(bits));
}

async function hmac(keyText, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyText),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

async function sha256(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return b64urlEncode(new Uint8Array(digest));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64urlEncode(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(text) {
  const s = atob(text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

/* ---------- Helpers ---------- */

function env(name) {
  return (typeof process !== "undefined" && process.env && process.env[name]) || "";
}

/** Only same-site paths, so the page can't be used to bounce people elsewhere. */
function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.startsWith("/auth")) return "/";
  return value;
}

function getCookie(request, name) {
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(name + "=")) return trimmed.slice(name.length + 1);
  }
  return null;
}

function clearCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

function redirect(location, cookies = []) {
  const headers = new Headers({ location, "cache-control": "no-store" });
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(null, { status: 303, headers });
}

/* ---------- Password page ---------- */

const MESSAGES = {
  wrong: ["error", "That password isn’t right. Please try again."],
  locked: ["error", `Too many wrong tries. Please wait ${LOCK_MINUTES} minutes and try again.`],
  "signed-out": ["info", "You’ve signed out."],
  config: ["error", "This site isn’t set up yet. Ask the site owner to finish the setup."],
};

function page({ msg, next = "/", status = 200 }) {
  const [tone, text] = MESSAGES[msg] || [];
  const sad = msg === "wrong" || msg === "locked";
  const form =
    msg === "config"
      ? ""
      : `<form method="post" action="/auth/">
    <input type="hidden" name="next" value="${escapeHtml(next)}">
    <label for="password">Password</label>
    <div class="field">
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus spellcheck="false">
      <button type="button" class="toggle" id="toggle" aria-label="Show password" aria-pressed="false" aria-controls="password">${EYE_ICON}${EYE_OFF_ICON}</button>
    </div>
    <button type="submit" class="submit">Enter</button>
  </form>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Private — Tysha’s tiket project</title>
<style>
@font-face { font-family: "Tiket Odyssey Text"; src: url("/auth/fonts/TiketOdysseyText-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Tiket Odyssey Text"; src: url("/auth/fonts/TiketOdysseyText-SemiBold.woff2") format("woff2"); font-weight: 500 600; font-display: swap; }
:root { --page: #ffffff; --ink: #21201c; --muted: #82827c; --line: #ecebe9; --field: #d9d7d3;
  --blue: #0064d2; --blue-hover: #0052ad; --error-bg: #fdecec; --error-ink: #b42318; --info-bg: #eef4fd; --info-ink: #0064d2;
  --m-line: #21201c; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--page); color: var(--ink); -webkit-font-smoothing: antialiased;
  font-family: "Tiket Odyssey Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
/* Fills the *visible* area (above the phone keyboard): the script keeps --vv-top/--vv-h in sync. */
.stage { position: fixed; left: 0; right: 0; top: var(--vv-top, 0px); height: var(--vv-h, 100%); overflow-y: auto;
  display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
.card { width: 100%; max-width: 400px; padding: 32px 28px; border: 1px solid var(--line); border-radius: 12px; background: #fff;
  box-shadow: 2px 2px 4px rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03); text-align: center; }
.note { margin: 0 0 16px; padding: 10px 12px; border-radius: 8px; font-size: 14px; line-height: 20px; text-align: left; }
.note--error { background: var(--error-bg); color: var(--error-ink); }
.note--info { background: var(--info-bg); color: var(--info-ink); }
form { display: flex; flex-direction: column; text-align: left; }
label { font-size: 12px; line-height: 16px; font-weight: 500; color: var(--muted); margin-bottom: 6px; }
.field { position: relative; }
.field input { width: 100%; height: 44px; padding: 0 48px 0 12px; border: 1px solid var(--field); border-radius: 8px; font: inherit;
  font-size: 14px; color: var(--ink); background: #fff; transition: border-color 120ms ease; }
.field input:focus { outline: none; border-color: var(--blue); }
.toggle { position: absolute; top: 4px; right: 4px; width: 36px; height: 36px; display: grid; place-items: center; padding: 0;
  border: 0; border-radius: 6px; background: transparent; color: var(--muted); cursor: pointer; transition: color 120ms ease, background-color 120ms ease; }
.toggle:hover { color: var(--ink); background: #f4f4f2; }
.toggle:focus-visible { outline: 2px solid var(--blue); outline-offset: 0; }
.toggle svg { width: 20px; height: 20px; }
.toggle .icon-eye-off, .toggle[aria-pressed="true"] .icon-eye { display: none; }
.toggle[aria-pressed="true"] .icon-eye-off { display: block; }
.submit { margin-top: 16px; height: 44px; border: 0; border-radius: 8px; background: var(--blue); color: #fff; font: inherit;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: background-color 120ms ease; }
.submit:hover { background: var(--blue-hover); }
.submit:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

/* Mascot: inline SVG, no image files. Face follows the caret; sunglasses drop while the password is shown. */
.mascot { display: block; width: 112px; height: 112px; margin: 0 auto 8px; transition: width 300ms ease-out, height 300ms ease-out, margin 300ms ease-out; }
.caption { margin: 0 0 20px; font-size: 14px; line-height: 20px; font-weight: 500; color: var(--ink); }
.caption.is-swapping { animation: caption-in 200ms ease-out; }
@keyframes caption-in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
/* Phones: no card chrome, 16px text (stops iOS zooming into the field). */
@media (max-width: 480px) {
  .card { max-width: none; padding: 0; border: 0; border-radius: 0; box-shadow: none; }
  .field input { font-size: 16px; }
}
/* Keyboard open: sit on the keyboard with an 8px gap, and shrink the mascot so it fits. */
.kb-open .stage { align-items: flex-end; padding-top: 8px; padding-bottom: 8px; }
.kb-open .mascot { width: 84px; height: 84px; margin-bottom: 6px; }
.kb-open .caption { margin-bottom: 12px; }
.m-face, .m-eyes { transition: transform 150ms ease-out; }
.m-eye { transform-box: fill-box; transform-origin: 50% 0; animation: m-blink 5s infinite; }
.m-shades { transform: translateY(-64px); transition: transform 300ms ease-out; }
.is-covering .m-shades { transform: translateY(0); }
.m-cool, .m-frown { opacity: 0; }
.is-covering .m-smile, .is-sad .m-smile { opacity: 0; }
.is-covering .m-cool, .is-sad .m-frown { opacity: 1; }
.is-sad .m-head { animation: m-shake 450ms ease-out 1; }
@keyframes m-blink { 0%, 95%, 100% { transform: scaleY(1); } 97.5% { transform: scaleY(.12); } }
@keyframes m-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
@media (prefers-reduced-motion: reduce) {
  .m-face, .m-eyes, .m-shades, .mascot { transition-duration: 1ms; }
  .m-eye, .is-sad .m-head, .caption.is-swapping { animation: none; }
}
</style>
</head>
<body>
<div class="stage"><main class="card">
  ${MASCOT.replace('class="mascot"', `class="mascot${sad ? " is-sad" : ""}"`)}
  ${form ? `<p class="caption" id="caption" aria-live="polite">masukin pass nya</p>` : ""}
  ${text ? `<div class="note note--${tone}" role="alert">${escapeHtml(text)}</div>` : ""}
  ${form}
</main></div>
${form ? `<script>${PAGE_SCRIPT}</script>` : ""}
</body>
</html>`;

  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

/* A minimal, slightly too-cool face: half-moon eyes, a smirk, and sunglasses for "not looking". ~1.5 KB. */
const MASCOT = `<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <defs><clipPath id="m-clip"><circle cx="60" cy="60" r="48.8"/></clipPath></defs>
  <g class="m-head">
    <circle cx="60" cy="60" r="50" fill="#fff"/>
    <g clip-path="url(#m-clip)"><g class="m-face">
      <g class="m-eyes" fill="var(--m-line)">
        <path class="m-eye" d="M33 48 H55 A11 11 0 0 1 33 48 Z"/>
        <path class="m-eye" d="M65 48 H87 A11 11 0 0 1 65 48 Z"/>
      </g>
      <g fill="none" stroke="var(--m-line)" stroke-width="2.5" stroke-linecap="round">
        <path class="m-smile" d="M46 75 Q61 83 75 72"/>
        <path class="m-cool" d="M45 73 Q62 86 78 69"/>
        <path class="m-frown" d="M48 79 Q60 73 72 79"/>
      </g>
      <g class="m-shades" fill="var(--m-line)">
        <path d="M29 42 H56 V49 Q56 61 43 61 Q29 61 29 49 Z M64 42 H91 V49 Q91 61 78 61 Q64 61 64 49 Z"/>
        <path d="M56 45 H64 M29 44 L8 41 M91 44 L112 41" fill="none" stroke="var(--m-line)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M34 46 L39 46 M69 46 L74 46" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      </g>
    </g></g>
    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--m-line)" stroke-width="2.5"/>
  </g>
</svg>`;

const EYE_ICON = `<svg class="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg class="icon-eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.6M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M3 3l18 18"/></svg>`;

/*
 * Runs in the browser. Kept free of template-literal syntax because it is embedded in one.
 * The face turns toward the caret: 0 = start of the box, 1 = its right edge.
 */
const PAGE_SCRIPT = `(function () {
  var input = document.getElementById("password");
  var toggle = document.getElementById("toggle");
  var mascot = document.querySelector(".mascot");
  if (!input || !toggle || !mascot) return;
  var face = mascot.querySelector(".m-face");
  var eyes = mascot.querySelector(".m-eyes");
  var caption = document.getElementById("caption");
  var ctx = document.createElement("canvas").getContext("2d");

  function widthOf(text) {
    var s = getComputedStyle(input);
    ctx.font = s.fontWeight + " " + s.fontSize + " " + s.fontFamily;
    return ctx.measureText(text).width;
  }

  function look() {
    if (document.activeElement !== input) {
      face.style.transform = "";
      eyes.style.transform = "";
      return;
    }
    var pos = input.selectionEnd == null ? input.value.length : input.selectionEnd;
    var before = input.type === "text" ? input.value.slice(0, pos) : "\\u2022".repeat(pos);
    var s = getComputedStyle(input);
    var room = input.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
    // Reaches the far right after about 25 characters, so typical passwords visibly turn it.
    var r = Math.max(0, Math.min(1, (widthOf(before) - input.scrollLeft) / Math.min(room, 160)));
    face.style.transform = "translate(" + (-12 + 24 * r).toFixed(1) + "px, 4px)";
    eyes.style.transform = "translate(" + (-2.5 + 5 * r).toFixed(1) + "px, 1px)";
  }

  ["input", "keyup", "click", "focus", "blur", "select"].forEach(function (name) {
    input.addEventListener(name, look);
  });
  document.addEventListener("selectionchange", look);

  toggle.addEventListener("mousedown", function (e) { e.preventDefault(); });
  toggle.addEventListener("click", function () {
    var show = input.type === "password";
    var pos = input.selectionEnd;
    input.type = show ? "text" : "password";
    toggle.setAttribute("aria-pressed", String(show));
    toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    mascot.classList.toggle("is-covering", show);
    if (caption) {
      caption.textContent = show ? "udah bener belum?" : "masukin pass nya";
      caption.classList.remove("is-swapping");
      void caption.offsetWidth; // restart the fade
      caption.classList.add("is-swapping");
    }
    mascot.classList.remove("is-sad");
    input.focus();
    if (pos != null) input.setSelectionRange(pos, pos);
    look();
  });

  input.addEventListener("input", function () { mascot.classList.remove("is-sad"); }, { once: true });

  // Track the visible area so the phone keyboard never hides the mascot or the button.
  var vv = window.visualViewport;
  function fit() {
    if (!vv) return;
    var root = document.documentElement;
    root.style.setProperty("--vv-h", vv.height + "px");
    root.style.setProperty("--vv-top", vv.offsetTop + "px");
    root.classList.toggle("kb-open", window.innerHeight - vv.height > 120);
  }
  if (vv) {
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
  }
  fit();
  look();
})();`;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
