# @isthislinksafe/extension

Manifest V3 browser extension. Chrome + Firefox from the same source.

## Develop

```bash
npm install
npm run build          # builds dist-chrome/ and dist-firefox/
npm run dev            # watch mode
```

**Load in Chrome:** `chrome://extensions` → Developer mode → Load unpacked → `dist-chrome/`
**Load in Firefox:** `about:debugging` → This Firefox → Load Temporary Add-on → `dist-firefox/manifest.json`

## Permissions

Deliberately minimal — store reviewers look at this first.

- `contextMenus` — right-click a link to check it.
- `storage` — store install_id (anonymous UUID) and cached verdicts.
- `host_permissions: https://api.isthislinksafe.com/*` — the API. No `<all_urls>`.

## Features

- Right-click any link → "Check this link" or "Report as scam".
- Toolbar popup — paste any URL, auto-check on paste.
- Badge icon shows `✓` / `!` / `?` briefly after a check.
- Local 15-minute verdict cache to reduce server load.
- Offline fallback: runs the detector locally if the API is unreachable (no redirect expansion in that mode).

## What the extension does NOT do (intentional)

- No auto-injection on every page. No `<all_urls>`. Keeps review-time low and respects privacy.
- Does not intercept navigation. User still clicks through; we warn.
- Does not read page content.
