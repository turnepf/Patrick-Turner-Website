# patrickturner.net

Patrick Turner's personal site, showcasing his apps: Scoring Spades, Show Picker Club and Parjamie.

Plain static HTML/CSS in `public/`, no build step, served by a Cloudflare Worker with Static Assets.

## How changes go live

Push to `main`. Cloudflare Workers Builds picks up the commit, installs the pinned dependencies from `package-lock.json`, runs `node scripts/check.mjs`, and if that passes runs `npx wrangler deploy`. If the check fails, nothing deploys and the live site stays as it was.

- Check locally: `node scripts/check.mjs`
- Preview locally: `npx wrangler dev` (or `npx serve public`)

## What's where

| Path | What |
|---|---|
| `public/` | Everything served: `index.html`, `styles.css`, `404.html`, `_headers` (security headers), `img/` (app icons) |
| `src/worker.js` | Redirects `www` and any other hostname to `patrickturner.net`, then serves `public/` |
| `scripts/check.mjs` | Pre-deploy gate: missing local files, broken `#anchors`, unbalanced tags, dead external links |
| `wrangler.jsonc` | Worker config and the two custom domains |
| `package.json` / `package-lock.json` | Pins the exact Wrangler version a deploy is allowed to use |
