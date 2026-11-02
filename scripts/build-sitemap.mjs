#!/usr/bin/env node
// Regenerates sitemap.xml from the HTML files in the repo.
//   node scripts/build-sitemap.mjs          write sitemap.xml
//   node scripts/build-sitemap.mjs --check  exit 1 if sitemap.xml is out of date
//
// <loc>      = the page's <link rel="canonical">
// alternates = the page's own <link rel="alternate" hreflang> tags (only pages that exist)
// <lastmod> resolution, first match wins:
//   1. <meta name="lastmod" content="YYYY-MM-DD">
//   2. article:modified_time, unless it is the 2026-10-13 bulk stamp
//   3. article:published_time
//   4. newest git commit that touched this file but fewer than 25 HTML files
//      (sitewide redesigns and tag swaps are skipped)
//   5. the commit that added the file
//   6. today
// The 2026-10-13 modified_time was written onto every article the day the
// sitemap was first submitted, so it is not a per-page content date.
// Skips noindex pages, 404.html, google verification files and *.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { listHtml, ROOT, urlToFile } from './lib.mjs';

const CHECK = process.argv.includes('--check');
const today = new Date().toISOString().slice(0, 10);

const BULK_HTML = 25;
const BULK_STAMP = '2026-10-13';
const htmlCountByCommit = new Map();

function htmlFilesInCommit(hash) {
  if (htmlCountByCommit.has(hash)) return htmlCountByCommit.get(hash);
  let count = BULK_HTML;
  try {
    const names = execFileSync('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', hash], { cwd: ROOT, encoding: 'utf8' });
    count = names.split('\n').filter((name) => name.endsWith('.html')).length;
  } catch { /* treat as bulk so we fall through */ }
  htmlCountByCommit.set(hash, count);
  return count;
}

function gitDate(file) {
  try {
    const log = execFileSync('git', ['log', '--format=%H %cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    if (!log) return today;
    for (const line of log.split('\n')) {
      const [hash, date] = line.split(' ');
      if (!hash || !date) continue;
      if (htmlFilesInCommit(hash) < BULK_HTML) return date;
    }
    const added = execFileSync('git', ['log', '--diff-filter=A', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n')[0];
    return added || today;
  } catch { return today; }
}

function contentLastmod(file, html) {
  const named = html.match(/<meta name="lastmod" content="(\d{4}-\d{2}-\d{2})"/);
  if (named) return named[1];
  const modified = html.match(/property="article:modified_time" content="(\d{4}-\d{2}-\d{2})/);
  if (modified && modified[1] !== BULK_STAMP) return modified[1];
  const published = html.match(/property="article:published_time" content="(\d{4}-\d{2}-\d{2})/);
  if (published) return published[1];
  return gitDate(file);
}

const entries = [];
for (const file of listHtml()) {
  if (file.endsWith('404.html')) continue;
  const html = readFileSync(`${ROOT}/${file}`, 'utf8');
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/);
  if (!canon) continue;
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .filter(([, , href]) => existsSync(`${ROOT}/${urlToFile(href)}`))
    .map(([, hl, href]) => [hl, href]);
  entries.push({ loc: canon[1], alts, lastmod: contentLastmod(file, html) });
}

const depth = (u) => new URL(u).pathname.split('/').filter(Boolean).length;
entries.sort((a, b) => (depth(a.loc) > 1) - (depth(b.loc) > 1) || a.loc.localeCompare(b.loc));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...entries.flatMap(({ loc, alts, lastmod }) => [
    '    <url>',
    `        <loc>${loc}</loc>`,
    ...alts.map(([hl, href]) => `        <xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`),
    `        <lastmod>${lastmod}</lastmod>`,
    '    </url>',
  ]),
  '</urlset>',
  '',
].join('\n');

if (CHECK) {
  const current = existsSync(`${ROOT}/sitemap.xml`) ? readFileSync(`${ROOT}/sitemap.xml`, 'utf8') : '';
  // lastmod of uncommitted files depends on the day; compare structure only
  const strip = (s) => s.replace(/<lastmod>[^<]*<\/lastmod>/g, '');
  if (strip(current) !== strip(xml)) {
    console.error('sitemap.xml is out of date: run `node scripts/build-sitemap.mjs` and commit.');
    process.exit(1);
  }
  console.log(`sitemap.xml up to date (${entries.length} URLs)`);
} else {
  writeFileSync(`${ROOT}/sitemap.xml`, xml);
  const counts = new Map();
  for (const entry of entries) counts.set(entry.lastmod, (counts.get(entry.lastmod) || 0) + 1);
  const spread = [...counts.entries()].sort().map(([date, n]) => `${date}×${n}`).join(', ');
  console.log(`${entries.length} URLs written to sitemap.xml (${spread})`);
}
