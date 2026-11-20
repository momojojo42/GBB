#!/usr/bin/env bash
set -euo pipefail

open "https://github.com/settings/tokens/new?description=Antigravity+Mac+Git&scopes=repo"

TOKEN="$(osascript -e 'Tell application "System Events" to display dialog "1. In the browser tab that just opened, scroll down and click \"Generate token\".\n2. Copy the ghp_... token and paste it below:" default answer "" with title "Save GitHub Token to macOS Keychain" buttons {"Cancel", "Save & Push"} default button "Save & Push" with hidden answer' -e 'text returned of result' 2>/dev/null || true)"

if [[ -z "${TOKEN}" ]]; then
  echo "❌ No token entered."
  exit 1
fi

printf "protocol=https\nhost=github.com\nusername=zhoumi42race\npassword=%s\n\n" "${TOKEN}" | git credential-osxkeychain store
echo "✅ Saved GitHub token to macOS Keychain for zhoumi42race!"

git push -u origin main
echo "🚀 Successfully pushed to https://github.com/zhoumi42race/GBB.git !"
