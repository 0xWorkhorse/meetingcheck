/**
 * Generate web/public/og-image.png by screenshotting the /og React page with
 * Playwright. Runs as a post-build step.
 *
 * Design notes:
 *  - We spawn a tiny HTTP server to serve the freshly-built dist/ directory
 *    with SPA-style fallback (unknown paths → /index.html). This is separate
 *    from the production `serve` setup, which we want to stay non-SPA.
 *  - Playwright uses a headless chromium to navigate to /og, waits for the
 *    `[data-og-ready="true"]` marker, screenshots at exactly 1200×630, and
 *    writes to BOTH web/dist/ (for the current build output) and web/public/
 *    (so the committed copy stays in sync on the dev's next commit).
 *  - Graceful degradation: if playwright isn't installed OR its chromium
 *    binary isn't available, we log a warning and exit 0. The existing
 *    og-image.png in public/ stays in place. Builds never fail on OG gen.
 */
import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const WEB_ROOT = resolve(__dirname, '..');
const DIST_DIR = join(WEB_ROOT, 'dist');
const PUBLIC_DIR = join(WEB_ROOT, 'public');
const OUT_FILE = 'og-image.png';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.map':  'application/json; charset=utf-8',
};

async function fileExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

/** Minimal static server with SPA fallback. */
async function startServer(root) {
  const server = http.createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let filePath = join(root, urlPath);
      if (await fileExists(filePath)) {
        const s = await stat(filePath);
        if (s.isDirectory()) filePath = join(filePath, 'index.html');
      }
      if (!(await fileExists(filePath))) {
        // SPA fallback: anything not a file gets the React app, which
        // reads location.pathname to decide whether to render /og.
        filePath = join(root, 'index.html');
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  const { port } = server.address();
  return { server, port };
}

async function main() {
  if (!(await fileExists(join(DIST_DIR, 'index.html')))) {
    console.error('[generate-og] dist/index.html not found — run `vite build` first');
    process.exit(1);
  }

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (err) {
    console.warn(
      '[generate-og] WARNING: OG image generation failed, using stale placeholder image. ' +
      'Error: playwright is not installed. Run `npm install --save-dev playwright` in the web workspace. ' +
      'Underlying error: ' + (err instanceof Error ? err.message : String(err)),
    );
    return;
  }

  const { server, port } = await startServer(DIST_DIR);
  const url = `http://127.0.0.1:${port}/og`;
  console.log(`[generate-og] serving dist on ${url}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    server.close();
    console.warn(
      '[generate-og] WARNING: OG image generation failed, using stale placeholder image. ' +
      'Error: chromium failed to launch. Install the browser binary and its system dependencies with ' +
      '`npx playwright install --with-deps chromium`. ' +
      'Underlying error: ' + (err instanceof Error ? err.message : String(err)),
    );
    return;
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 2, // crisper output for social previews (retina)
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForSelector('[data-og-ready="true"]', { timeout: 15_000 });
    // Small settle for Google Fonts to apply
    await page.waitForTimeout(500);

    const png = await page.screenshot({
      type: 'png',
      omitBackground: false,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });

    await writeFile(join(DIST_DIR, OUT_FILE), png);
    await writeFile(join(PUBLIC_DIR, OUT_FILE), png);
    console.log(`[generate-og] wrote ${OUT_FILE} to dist/ and public/ (${png.length.toLocaleString()} bytes)`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.warn(
    '[generate-og] WARNING: OG image generation failed, using stale placeholder image. ' +
    'Error: unexpected failure during screenshot run. ' +
    'Underlying error: ' + (err instanceof Error ? (err.stack ?? err.message) : String(err)),
  );
  // Non-fatal — the existing og-image.png is a fine fallback. We warn loudly
  // (the message above is greppable in Railway logs) but don't break the build.
  process.exit(0);
});
