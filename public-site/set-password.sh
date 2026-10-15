#!/bin/zsh
# Sets (or changes) the one shared password for the whole site, then puts it live.
#
# The password is typed hidden and never saved anywhere readable: only a PBKDF2
# fingerprint of it goes to Vercel, as a sensitive environment variable. Running this
# again with a new password signs everyone out.
set -e
cd "${0:A:h}"

VERCEL=(npx -y vercel@62.1.0)

echo "Choose the site password (typing is hidden), then press Enter:"
read -rs PASSWORD
echo
echo "Type it again to confirm:"
read -rs CONFIRM
echo

if [[ "$PASSWORD" != "$CONFIRM" ]]; then
  unset PASSWORD CONFIRM
  echo "The two passwords didn't match. Nothing was changed."
  exit 1
fi
unset CONFIRM
if (( ${#PASSWORD} < 10 )); then
  unset PASSWORD
  echo "Please use at least 10 characters (e.g. three words and a number). Nothing was changed."
  exit 1
fi

# The password goes to node on stdin (not as an argument), so it never shows up in
# the process list. Only the fingerprint comes out.
HASH=$(printf '%s' "$PASSWORD" | node -e '
  const crypto = require("node:crypto");
  let password = "";
  process.stdin.on("data", (chunk) => (password += chunk));
  process.stdin.on("end", () => {
    const iterations = 210000;
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    process.stdout.write(`pbkdf2-sha256$${iterations}$${salt.toString("base64url")}$${hash.toString("base64url")}`);
  });
')
unset PASSWORD

echo "Saving to Vercel…"
if ! printf '%s' "$HASH" | $VERCEL env add SITE_PASSWORD_HASH production --force --sensitive >/dev/null 2>&1; then
  echo "Couldn't save to Vercel. If you're logged out, run: npx vercel login — then run this again."
  exit 1
fi
unset HASH

echo "Building and publishing the site (takes a minute or two)…"
if ! npm run deploy > deploy.log 2>&1; then
  echo "The password is saved, but publishing failed. Details are in public-site/deploy.log"
  exit 1
fi

echo "Done. The new password is live."
echo "Everyone who was signed in will be asked for the new password."
