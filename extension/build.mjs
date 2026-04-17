#!/usr/bin/env node
/**
 * Build script for the extension. Produces dist-chrome/ and dist-firefox/.
 * Chrome uses background.service_worker, Firefox uses background.scripts — same code, different manifest.
 */
import * as esbuild from 'esbuild';
import { mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const watch = args.has('--watch');
const onlyTarget = [...args].find(a => a.startsWith('--target='))?.split('=')[1];

const TARGETS = onlyTarget ? [onlyTarget] : ['chrome', 'firefox'];
const ENTRIES = ['src/background.ts', 'src/popup.ts'];

async function buildOne(target) {
  const outdir = join(__dirname, `dist-${target}`);
  if (existsSync(outdir)) await rm(outdir, { recursive: true });
  await mkdir(outdir, { recursive: true });

  const ctx = await esbuild.context({
    entryPoints: ENTRIES,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    outdir,
    sourcemap: 'linked',
    logLevel: 'info',
  });

  if (watch) { await ctx.watch(); } else { await ctx.rebuild(); await ctx.dispose(); }

  // Manifest
  const manifest = JSON.parse(await readFile(join(__dirname, 'manifest.template.json'), 'utf8'));
  if (target === 'chrome') {
    manifest.background = { service_worker: 'background.js', type: 'module' };
  } else {
    manifest.background = { scripts: ['background.js'], type: 'module' };
    manifest.browser_specific_settings = {
      gecko: { id: 'extension@isthislinksafe.com', strict_min_version: '109.0' },
    };
  }
  await writeFile(join(outdir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Static assets
  await copyFile(join(__dirname, 'src/popup.html'), join(outdir, 'popup.html'));
  await copyFile(join(__dirname, 'src/popup.css'), join(outdir, 'popup.css'));
  await mkdir(join(outdir, 'icons'), { recursive: true });
  for (const size of [16, 48, 128]) {
    const src = join(__dirname, `icons/icon-${size}.png`);
    if (existsSync(src)) await copyFile(src, join(outdir, `icons/icon-${size}.png`));
  }

  // _locales/ for chrome.i18n / browser.i18n (Firefox supports the same format).
  const localesSrc = join(__dirname, '_locales');
  if (existsSync(localesSrc)) {
    const { cp } = await import('node:fs/promises');
    await cp(localesSrc, join(outdir, '_locales'), { recursive: true });
  }

  console.log(`built ${target} → ${outdir}`);
}

for (const t of TARGETS) await buildOne(t);
