# Carlton Ridge

Astro + React marketing site for a Barbados villa. Production: https://www.carltonridgevilla.com (Cloudflare Pages). See `README.md` for structure and design tokens.

## Site checks (Playwright)

The suite in `tests/site.spec.js` smoke-tests every page in the sitemap on desktop and mobile. Run it as part of any significant change.
First time only: `npx playwright install chromium`.

### On a PR branch (before merging)

```bash
npm run test:site
```

Builds the site, serves it locally and tests that. To test a Cloudflare PR preview instead (URL is in the PR's Cloudflare comment):

```bash
SITE_URL=https://<branch>.carltonridge.pages.dev npm run test:site
```

### On `main` (after merging, once the Cloudflare deploy finishes)

```bash
npm run test:live
```

Tests the live production site.

### Notes

- Report results faithfully: if a check fails, show the failure rather than summarising it as passing.
- `npm run test:site` runs `astro build`, which rewrites the tracked `dist/` files. Run `git checkout -- dist` before switching branches or committing, and don't commit `dist/` changes that only differ by build timestamp.
- The suite stubs the Cloudflare analytics beacon so tests don't pollute real stats or hit CORS errors on localhost.
- The Claude Code cloud sandbox blocks `*.pages.dev` and may block the live domain, so run preview and live checks from a local machine.
