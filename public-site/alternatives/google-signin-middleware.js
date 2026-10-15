/*
 * Company-only access: every page on the site (homepage and every prototype) requires
 * signing in with a Google account on the company domain.
 *
 * Runs as Vercel Routing Middleware in front of the static files. No dependencies, so
 * Vercel's install/build can stay switched off.
 *
 *   /auth/            sign-in page (also shows errors)
 *   /auth/google/     starts the Google sign-in
 *   /auth/callback/   Google sends the user back here
 *   /auth/logout/     clears the session
 *
 * Settings (Vercel environment variables, set by setup-auth.sh, never in this file):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   the Google OAuth client
 *   AUTH_SECRET                              random key that signs the session cookie
 *   ALLOWED_DOMAIN                           e.g. tiket.com
 *   SITE_ORIGIN                              e.g. https://yourname-design.vercel.app
 *
 * If any setting is missing the site stays locked (it never falls back to public).
 */

export const config = { matcher: "/:path*" };

const SESSION_COOKIE = "proto_session";
const STATE_COOKIE = "proto_oauth";
const SESSION_DAYS = 7;

export default async function middleware(request) {
  const env = readEnv();
  const url = new URL(request.url);
  const path = url.pathname;

  // One canonical address, so Google only needs to know a single return URL.
  if (env.ok && url.origin !== env.origin) {
    return Response.redirect(env.origin + path + url.search, 308);
  }

  // The sign-in page's own font files must load before anyone has signed in.
  if (path.startsWith("/auth/fonts/")) return;

  if (path === "/auth" || path === "/auth/") {
    return signInPage(env, url.searchParams.get("error"), url.searchParams.get("next"));
  }

  if (!env.ok) return signInPage(env, "config");

  if (path.startsWith("/auth/google")) return startGoogle(env, url);
  if (path.startsWith("/auth/callback")) return finishGoogle(env, request, url);
  if (path.startsWith("/auth/logout")) {
    return redirect("/auth/?error=signed-out", [clearCookie(SESSION_COOKIE)]);
  }

  const session = await readSession(env, request);
  if (session) return; // signed in: carry on to the static file

  // Not signed in. Only full page loads come back here after sign-in.
  const next = safeNext(path + url.search);
  return redirect(`/auth/?next=${encodeURIComponent(next)}`);
}

/* ---------- Google OAuth ---------- */

function startGoogle(env, url) {
  const state = randomToken();
  const next = safeNext(url.searchParams.get("next"));
  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.search = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: env.origin + "/auth/callback/",
    response_type: "code",
    scope: "openid email profile",
    hd: env.domain, // pre-selects company accounts; checked again on return
    prompt: "select_account",
    state,
  }).toString();
  return redirect(google.toString(), [
    cookie(STATE_COOKIE, `${state}|${next}`, 600, "/auth/"),
  ]);
}

async function finishGoogle(env, request, url) {
  const saved = getCookie(request, STATE_COOKIE) ?? "";
  const [savedState, next = "/"] = splitOnce(saved, "|");
  const clearState = clearCookie(STATE_COOKIE, "/auth/");

  if (url.searchParams.get("error")) return redirect("/auth/?error=cancelled", [clearState]);

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!code || !state || state !== savedState) {
    return redirect("/auth/?error=expired", [clearState]);
  }

  // Exchanged directly with Google over HTTPS using the client secret, so the
  // returned ID token is trustworthy without a separate signature check.
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.clientId,
      client_secret: env.clientSecret,
      redirect_uri: env.origin + "/auth/callback/",
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) return redirect("/auth/?error=google", [clearState]);

  const { id_token: idToken } = await response.json();
  const claims = decodeJwtPayload(idToken);
  const email = String(claims?.email ?? "").toLowerCase();

  const allowed =
    claims &&
    claims.aud === env.clientId &&
    claims.email_verified === true &&
    claims.hd === env.domain &&
    email.endsWith("@" + env.domain);
  if (!allowed) return redirect("/auth/?error=domain", [clearState]);

  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const token = await signSession(env, { email, exp });
  return redirect(safeNext(next), [
    clearState,
    cookie(SESSION_COOKIE, token, SESSION_DAYS * 86400, "/"),
  ]);
}

/* ---------- Session cookie: base64url(payload).base64url(HMAC-SHA256) ---------- */

async function signSession(env, payload) {
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await hmac(env.secret, body);
  return `${body}.${sig}`;
}

async function readSession(env, request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const [body, sig] = splitOnce(token, ".");
  if (!body || !sig) return null;
  const expected = await hmac(env.secret, body);
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    if (!String(payload.email).endsWith("@" + env.domain)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64urlEncode(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------- Helpers ---------- */

function readEnv() {
  const e = (typeof process !== "undefined" && process.env) || {};
  const env = {
    clientId: e.GOOGLE_CLIENT_ID,
    clientSecret: e.GOOGLE_CLIENT_SECRET,
    secret: e.AUTH_SECRET,
    domain: (e.ALLOWED_DOMAIN || "").toLowerCase(),
    origin: (e.SITE_ORIGIN || "").replace(/\/+$/, ""),
  };
  env.ok = Boolean(
    env.clientId && env.clientSecret && env.secret && env.secret.length >= 32 && env.domain && env.origin,
  );
  return env;
}

/** Only same-site paths, so the sign-in can't be used to bounce people elsewhere. */
function safeNext(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (value.startsWith("/auth")) return "/";
  return value;
}

function splitOnce(value, separator) {
  const i = value.indexOf(separator);
  return i < 0 ? [value] : [value.slice(0, i), value.slice(i + 1)];
}

function decodeJwtPayload(jwt) {
  try {
    return JSON.parse(new TextDecoder().decode(b64urlDecode(String(jwt).split(".")[1])));
  } catch {
    return null;
  }
}

function randomToken() {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(24)));
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

function getCookie(request, name) {
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const [k, v] = splitOnce(part.trim(), "=");
    if (k === name) return v ?? "";
  }
  return null;
}

function cookie(name, value, maxAge, path) {
  return `${name}=${value}; Path=${path}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function clearCookie(name, path = "/") {
  return cookie(name, "", 0, path);
}

function redirect(location, cookies = []) {
  const headers = new Headers({ location, "cache-control": "no-store" });
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(null, { status: 302, headers });
}

/* ---------- Sign-in page ---------- */

const MESSAGES = {
  domain: (d) => `That account isn’t a @${d} account. Sign in with your company Google account.`,
  cancelled: () => "Sign-in was cancelled. Try again when you’re ready.",
  expired: () => "That sign-in link expired. Please try again.",
  google: () => "Google couldn’t complete the sign-in. Please try again.",
  "signed-out": () => "You’ve signed out.",
  config: () => "Sign-in isn’t set up yet. Ask the site owner to finish the setup.",
};

function signInPage(env, error, next) {
  const domain = env.domain || "company";
  const message = error && MESSAGES[error] ? MESSAGES[error](domain) : "";
  const tone = error === "signed-out" ? "info" : "error";
  const href = `/auth/google/?next=${encodeURIComponent(safeNext(next))}`;
  const button = env.ok
    ? `<a class="button" href="${escapeHtml(href)}">${GOOGLE_ICON}<span>Sign in with Google</span></a>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in — My tiket project</title>
<style>
@font-face { font-family: "Tiket Odyssey Text"; src: url("/auth/fonts/TiketOdysseyText-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Tiket Odyssey Text"; src: url("/auth/fonts/TiketOdysseyText-SemiBold.woff2") format("woff2"); font-weight: 500 600; font-display: swap; }
:root { --page: #ffffff; --ink: #21201c; --muted: #82827c; --line: #ecebe9; --line-hover: #d9d7d3;
  --error-bg: #fdecec; --error-ink: #b42318; --info-bg: #eef4fd; --info-ink: #0064d2; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px;
  background: var(--page); color: var(--ink); -webkit-font-smoothing: antialiased;
  font-family: "Tiket Odyssey Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
.card { width: 100%; max-width: 400px; padding: 32px 28px; border: 1px solid var(--line); border-radius: 12px; background: #fff;
  box-shadow: 2px 2px 4px rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03); }
h1 { margin: 0 0 8px; font-size: 16px; font-weight: 500; line-height: 1.25; letter-spacing: .32px; color: #000; }
p { margin: 0; font-size: 14px; line-height: 20px; color: var(--muted); }
.note { margin-top: 20px; padding: 10px 12px; border-radius: 8px; font-size: 14px; line-height: 20px; }
.note--error { background: var(--error-bg); color: var(--error-ink); }
.note--info { background: var(--info-bg); color: var(--info-ink); }
.button { margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 44px;
  border: 1px solid var(--line-hover); border-radius: 8px; background: #fff; color: var(--ink); font: inherit; font-size: 14px;
  font-weight: 500; text-decoration: none; transition: border-color 120ms ease, box-shadow 120ms ease; }
.button:hover { border-color: #b8b6b1; box-shadow: 2px 4px 10px rgba(0,0,0,.06); }
.button:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
.button svg { width: 18px; height: 18px; flex: none; }
</style>
</head>
<body>
<main class="card">
  <h1>My tiket project<br>code design prototype</h1>
  <p>For ${escapeHtml(domain)} employees only. Sign in with your company Google account (@${escapeHtml(domain)}).</p>
  ${message ? `<div class="note note--${tone}" role="alert">${escapeHtml(message)}</div>` : ""}
  ${button}
</main>
</body>
</html>`;

  return new Response(html, {
    status: error === "config" ? 503 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const GOOGLE_ICON = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>`;
