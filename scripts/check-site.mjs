#!/usr/bin/env node
// Static site checks. Exits 1 on any error. Run: node scripts/check-site.mjs
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { listHtml, ROOT, ORIGIN, urlToFile, fileToUrl } from './lib.mjs';

// Third-party scripts allowed on the site (owner decision 2026-10: Google Ads tag
// under Consent Mode v2, default denied). Anything else fails the build.
const SCRIPT_HOSTS_ALLOWED = ['www.googletagmanager.com'];
const APP_IDS = ['6762064711', '6762021142', '6761443109'];

const errors = [];
const err = (file, msg) => errors.push(`${file}: ${msg}`);
const titles = new Map(), descs = new Map(), pages = new Map();

const files = listHtml();
for (const file of files) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  const is404 = file === '404.html';

  // every <script> must be closed (an unclosed one swallows the markup after it)
  const opens = (html.match(/<script[\s>]/g) || []).length, closes = (html.match(/<\/script>/g) || []).length;
  if (opens !== closes) err(file, `unbalanced <script> tags (${opens} open, ${closes} close)`);

  // links and assets
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|javascript:|#)/.test(raw)) {
      if (/^https?:\/\/apps\.apple\.com\/[a-z]{2}\//.test(raw)) err(file, `App Store link is not region-less: ${raw}`);
      continue;
    }
    const path = raw.split(/[?#]/)[0];
    if (!path) continue;
    if (/(^|\/)index\.html$/.test(path)) err(file, `link to index.html (use the folder URL): ${raw}`);
    let target = path.startsWith('/') ? join(ROOT, path) : normalize(join(ROOT, dirname(file), path));
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) err(file, `broken link/asset: ${raw}`);
  }

  // third-party scripts
  for (const [, src] of html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"/g)) {
    const host = new URL(src).host;
    if (!SCRIPT_HOSTS_ALLOWED.includes(host)) err(file, `third-party script not allowed: ${src}`);
  }

  // JSON-LD
  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(block);
      const items = Array.isArray(data) ? data : [data];
      for (const d of items) if (!d['@context'] || !d['@type']) err(file, 'JSON-LD missing @context or @type');
      if (/aggregateRating/.test(block)) err(file, 'aggregateRating present: only add real App Store ratings');
    } catch (e) { err(file, `invalid JSON-LD: ${e.message}`); }
  }

  if (is404) continue;

  // head essentials
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) err(file, 'missing <title>'); else (titles.get(title) || titles.set(title, []).get(title)).push(file);
  if (!desc) err(file, 'missing meta description'); else (descs.get(desc) || descs.set(desc, []).get(desc)).push(file);
  if (h1 !== 1) err(file, `expected exactly one <h1>, found ${h1}`);
  if (!canon) err(file, 'missing canonical');
  else {
    if (!canon.startsWith(ORIGIN + '/')) err(file, `canonical not absolute: ${canon}`);
    if (urlToFile(canon) !== file) err(file, `canonical not self-referencing: ${canon}`);
  }
  if (/<meta name="keywords"/.test(html)) err(file, 'meta keywords present');

  // smart banner points at a real app
  const banner = html.match(/<meta name="apple-itunes-app" content="app-id=(\d+)/)?.[1];
  if (banner && !APP_IDS.includes(banner)) err(file, `unknown apple-itunes-app id ${banner}`);

  const alts = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(m => [m[1], m[2]]));
  pages.set(fileToUrl(file), { file, alts });
}

// duplicates
for (const [map, what] of [[titles, 'title'], [descs, 'meta description']])
  for (const [v, fs] of map) if (fs.length > 1) err(fs.join(', '), `duplicate ${what}: "${v.slice(0, 60)}"`);

// hreflang: x-default present, self-reference, targets exist, reciprocal
for (const [url, { file, alts }] of pages) {
  const langs = Object.keys(alts);
  if (!langs.length) continue;
  if (!alts['x-default']) err(file, 'hreflang set has no x-default');
  if (!Object.entries(alts).some(([hl, h]) => hl !== 'x-default' && h === url)) err(file, 'hreflang set does not include the page itself');
  for (const [hl, href] of Object.entries(alts)) {
    if (hl === 'x-default') continue;
    const other = pages.get(href);
    if (!other) { err(file, `hreflang ${hl} target missing: ${href}`); continue; }
    if (!Object.values(other.alts).includes(url)) err(file, `hreflang ${hl} not reciprocal: ${href} does not link back`);
  }
}

if (errors.length) {
  console.error(`check-site: ${errors.length} problem(s)\n` + errors.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`check-site: ${files.length} pages OK`);
