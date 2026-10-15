#!/bin/zsh
# Stores the Google sign-in settings in Vercel for the linked Vercel project.
# You paste the Client ID and Client Secret from Google Cloud; the secret is typed
# hidden and goes straight to Vercel. Nothing is written to disk or printed.
set -e
cd "${0:A:h}/.."  # the linked Vercel project lives one folder up

VERCEL=(npx -y vercel@62.1.0)

echo "Paste the Google OAuth Client ID, then press Enter:"
read -r CLIENT_ID
echo "Paste the Google OAuth Client Secret (hidden), then press Enter:"
read -rs CLIENT_SECRET
echo

if [[ "$CLIENT_ID" != *.apps.googleusercontent.com ]]; then
  echo "That Client ID doesn't look right (it should end in .apps.googleusercontent.com)."
  exit 1
fi
if [[ -z "$CLIENT_SECRET" ]]; then
  echo "The Client Secret was empty."
  exit 1
fi

printf '%s' "$CLIENT_ID" | $VERCEL env add GOOGLE_CLIENT_ID production --force --no-sensitive >/dev/null
printf '%s' "$CLIENT_SECRET" | $VERCEL env add GOOGLE_CLIENT_SECRET production --force --sensitive >/dev/null
# A fresh random key that signs everyone's sign-in cookie. Changing it signs everyone out.
openssl rand -base64 48 | tr -d '\n' | $VERCEL env add AUTH_SECRET production --force --sensitive >/dev/null

unset CLIENT_SECRET
echo "Done. Google sign-in settings are stored in Vercel. Tell Claude it's ready to deploy."
