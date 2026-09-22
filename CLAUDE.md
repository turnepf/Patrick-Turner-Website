# patrickturner.net

Patrick's personal site: an intro plus one section per app (Show Picker Club, Parjamie, Scoring Spades). Static HTML/CSS, no framework, no build step.

## Workflow

- **Commit straight to `main` and push.** No branches or PRs for this repo. Every push to `main` auto-deploys through Cloudflare Workers Builds (build command `node scripts/check.mjs`, deploy command `npx wrangler deploy`).
- Run `node scripts/check.mjs` before pushing. If it fails, the deploy is blocked, so fix it rather than pushing anyway.
- **Wrangler is pinned** in `package.json` with a committed `package-lock.json`, so a deploy can't pull an unreviewed release. Cloudflare's build installs from the lockfile before `npx wrangler deploy` runs. Bump it deliberately with `npm install --package-lock-only wrangler@<version>` and commit both files; never with `npm update`.
- After pushing, confirm the change is live with `curl -s https://patrickturner.net/ | grep ...`.
- Only `public/` is served. New pages or images go there.

## Content rules

- **Parjamie:** never use the trademarked names of the modern commercial games in this family, or any close spelling. Describe it as a race-home or cross-and-circle game. (Same rule as the Parjamie repo, whose CLAUDE.md is the source of truth for the wording.)
- **No location** on the site. Patrick asked for it to be removed.
- **Show Picker Club code link:** don't add one until the repo `turnepf/Show-Picker-Club` is public. It was private as of 2026-09.
- **Button labels:** every link that gets you the app reads "Get it on <platform>": "Get it on the App Store", "Get it on Roku", "Get it on the web". Keep that wording for any new platform. Other buttons ("Read the rules", "View the code") say what they do.
- App icons in `public/img/` are resized copies of each app's 1024px App Store icon from the sibling repos in `~/`.

## Analytics

Google Analytics 4, measurement ID `G-5PTJP40SXJ`. Every page's `<head>` loads the gtag script plus `/analytics.js` (the config lives there instead of inline so the CSP doesn't need `'unsafe-inline'`). New pages need both tags. The Google domains are allowlisted in `script-src`, `img-src` and `connect-src` in `public/_headers`, as is Cloudflare Web Analytics (`static.cloudflareinsights.com` / `cloudflareinsights.com`), whose beacon Cloudflare injects automatically.

## Design

Quiet chalk page with the name as the big type moment; each app gets a full-width band in its own icon colors (tokens `--app-*` in `styles.css`). Fonts: Bricolage Grotesque (display) and Public Sans (body) from Google Fonts, which the CSP in `public/_headers` allows. Light and dark mode via `prefers-color-scheme`.
