#!/usr/bin/env node
// Regenerates sitemap.xml from the HTML files in the repo.
//   node scripts/build-sitemap.mjs          write sitemap.xml
//   node scripts/build-sitemap.mjs --check  exit 1 if sitemap.xml is out of date
//
// <loc>      = the page's <link rel="canonical">
// alternates = the page's own <link rel="alternate" hreflang> tags (only pages that exist)
// <lastmod>  = article:modified_time for posts, otherwise the date of the last git
//              commit that touched the file (uncommitted files: today).
// Skips noindex pages, 404.html, google verification files and *.md.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { listHtml, ROOT, urlToFile } from './lib.mjs';

const CHECK = process.argv.includes('--check');
const today = new Date().toISOString().slice(0, 10);

function gitDate(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim();
    return dirty || !out ? today : out;
  } catch { return today; }
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
  const art = html.match(/<meta property="article:modified_time" content="(\d{4}-\d{2}-\d{2})/);
  entries.push({ loc: canon[1], alts, lastmod: art ? art[1] : gitDate(file) });
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
  console.log(`${entries.length} URLs written to sitemap.xml`);
}
