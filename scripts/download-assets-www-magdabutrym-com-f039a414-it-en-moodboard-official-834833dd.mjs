#!/usr/bin/env node
/**
 * Downloads every asset used by the magdabutrym.com `/it-en/moodboard-official` clone
 * into `public/sites/www-magdabutrym-com-f039a414/it-en-moodboard-official-834833dd/`.
 *
 * The manifest lives next to this file so the two stay in sync:
 *   scripts/assets-www-magdabutrym-com-f039a414-it-en-moodboard-official-834833dd.json
 *
 * Usage: node scripts/download-assets-www-magdabutrym-com-f039a414-it-en-moodboard-official-834833dd.mjs
 */
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const SITE_KEY = 'www-magdabutrym-com-f039a414';
const PAGE_KEY = 'it-en-moodboard-official-834833dd';
const CONCURRENCY = 4;

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const outRoot = join(repoRoot, 'public', 'sites', SITE_KEY, PAGE_KEY);

const manifest = JSON.parse(
  readFileSync(join(here, `assets-${SITE_KEY}-${PAGE_KEY}.json`), 'utf8')
);

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function exists(path) {
  try {
    const s = await stat(path);
    return s.size > 0;
  } catch {
    return false;
  }
}

async function download({ url, file }) {
  const dest = join(outRoot, file);
  if (await exists(dest)) return { file, status: 'cached' };

  await mkdir(dirname(dest), { recursive: true });

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length === 0) throw new Error('empty body');
      await writeFile(dest, buf);
      return { file, status: 'ok', bytes: buf.length };
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  return { file, status: 'failed', error: lastError?.message ?? 'unknown' };
}

async function main() {
  const queue = [...manifest];
  const results = [];

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const job = queue.shift();
      const result = await download(job);
      results.push(result);
      const n = results.length;
      if (result.status === 'failed') {
        console.error(`[${n}/${manifest.length}] FAIL ${result.file} — ${result.error}`);
      } else if (n % 20 === 0 || n === manifest.length) {
        console.log(`[${n}/${manifest.length}] ${result.status} ${result.file}`);
      }
    }
  });

  await Promise.all(workers);

  const failed = results.filter((r) => r.status === 'failed');
  const bytes = results.reduce((sum, r) => sum + (r.bytes ?? 0), 0);

  console.log(`\nDone: ${results.length - failed.length}/${manifest.length} assets`);
  console.log(`Downloaded this run: ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Output: public/sites/${SITE_KEY}/${PAGE_KEY}/`);

  if (failed.length) {
    console.error(`\n${failed.length} failed:`);
    failed.forEach((f) => console.error(`  ${f.file} — ${f.error}`));
    process.exit(1);
  }
}

main();
