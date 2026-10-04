import { test, expect } from '@playwright/test';

const PRODUCTION_HOST = 'www.carltonridgevilla.com';

// Don't load analytics in tests: avoids CORS noise on localhost and keeps test visits
// out of the real stats.
test.beforeEach(async ({ context }) => {
  await context.route(/cloudflareinsights\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
});

// Routes come from the target's own sitemap so new pages are picked up automatically.
async function getRoutes(request) {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok(), 'sitemap-index.xml should load').toBeTruthy();
  const sitemapPaths = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname);
  const routes = new Set();
  for (const p of sitemapPaths) {
    const res = await request.get(p);
    expect(res.ok(), `${p} should load`).toBeTruthy();
    for (const m of (await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      routes.add(new URL(m[1]).pathname);
    }
  }
  expect(routes.size, 'sitemap should list pages').toBeGreaterThan(0);
  return [...routes];
}

test.describe('site pages', () => {
  let routes = [];
  test.beforeAll(async ({ playwright, baseURL }) => {
    const request = await playwright.request.newContext({ baseURL });
    routes = await getRoutes(request);
    await request.dispose();
  });

  test('every page renders cleanly', async ({ page, request, baseURL }, testInfo) => {
    const origin = new URL(baseURL).origin;
    for (const route of routes) {
      await test.step(route, async () => {
        const problems = [];
        // Third-party failures (e.g. Google Fonts) are not ours; same-origin ones are caught below.
        const onConsole = (m) => {
          const from = m.location().url;
          if (m.type() === 'error' && (!from || from.startsWith(origin))) problems.push(`console: ${m.text()}`);
        };
        const onPageError = (e) => problems.push(`pageerror: ${e.message}`);
        const onFailed = (r) => {
          if (r.url().startsWith(origin)) problems.push(`request failed: ${r.url()}`);
        };
        const onResponse = (r) => {
          if (r.url().startsWith(origin) && r.status() >= 400) problems.push(`${r.status()}: ${r.url()}`);
        };
        page.on('console', onConsole);
        page.on('pageerror', onPageError);
        page.on('requestfailed', onFailed);
        page.on('response', onResponse);

        const res = await page.goto(route, { waitUntil: 'networkidle' });
        expect(res.status(), 'page status').toBe(200);

        // SEO basics
        await expect(page).toHaveTitle(/\S/);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
        const canonical = new URL(await page.locator('link[rel="canonical"]').getAttribute('href'));
        expect(canonical.host, 'canonical should be the production host').toBe(PRODUCTION_HOST);
        expect(canonical.pathname, 'canonical path').toBe(route);

        // Images: all loaded, none broken
        await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]')
          .forEach((img) => { img.loading = 'eager'; }));
        await page.waitForFunction(
          () => [...document.images].every((img) => img.complete), null, { timeout: 20_000 },
        ).catch(() => {}); // anything still unloaded is reported as broken below
        const broken = await page.$$eval('img', (imgs) =>
          imgs.filter((i) => i.getAttribute('src') && !i.naturalWidth).map((i) => i.currentSrc || i.src));
        expect(broken, 'broken images').toEqual([]);

        // Internal links resolve
        const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
        const internal = [...new Set(hrefs.filter((h) => h.startsWith(origin)).map((h) => h.split('#')[0]))];
        for (const href of internal) {
          const r = await request.get(href);
          expect(r.status(), `link ${href}`).toBe(200);
        }

        // No sideways scroll
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, 'horizontal overflow (px)').toBeLessThanOrEqual(1);

        const shot = `${testInfo.project.name}${route === '/' ? '-home' : route.replace(/\//g, '-').replace(/-$/, '')}.png`;
        await page.screenshot({ path: testInfo.outputPath(shot), fullPage: true });
        await testInfo.attach(shot, { path: testInfo.outputPath(shot), contentType: 'image/png' });

        page.off('console', onConsole);
        page.off('pageerror', onPageError);
        page.off('requestfailed', onFailed);
        page.off('response', onResponse);
        expect(problems, 'console / network problems').toEqual([]);
      });
    }
  });
});

test.describe('site files', () => {
  test('robots.txt points at the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).toContain('sitemap');
  });

  test('unknown route serves the 404 page', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist/');
    expect(res.status()).toBe(404);
    await expect(page.locator('h1')).toHaveCount(1);
  });
});

test.describe('booking links', () => {
  test('reserve page links to Island Villas and a phone number', async ({ page }) => {
    await page.goto('/reserve/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('link', { name: 'Check Availability' }))
      .toHaveAttribute('href', /island-villas\.com/);
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  });
});
