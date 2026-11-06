#!/usr/bin/env node
// Static site checks. Exits 1 on any error. Run: node scripts/check-site.mjs
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { listHtml, ROOT, ORIGIN, urlToFile, fileToUrl } from './lib.mjs';
import { buildRequestMailto, isReplyEmail, REQUEST_TO } from '../assets/request-mailto.js';

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
      // Own apps stay region-less. Fixly (id1508502089) 404s on the region-less URL
      // outside Poland, so that one listing keeps the Polish storefront.
      if (/^https?:\/\/apps\.apple\.com\/[a-z]{2}\//.test(raw) && !/\/pl\/app\/(?:fixly\/)?id1508502089(?:[/?#"]|$)/.test(raw)) {
        err(file, `App Store link is not region-less: ${raw}`);
      }
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

// Custom-app request pages: fixed recipient, no prices, mailto draft cannot
// grow extra headers, and the UI must not claim the message was sent.
const REQUEST_PAGES = [
  'request.html', 'ro/request.html', 'de/request.html', 'pl/request.html', 'fr/request.html',
  'es/request.html', 'it/request.html', 'nl/request.html', 'pt/request.html', 'cz/request.html',
  'hu/request.html', 'sv/request.html',
];
const PRICE_ON_REQUEST = /(?:€|\$|£)\s?\d|\b\d+(?:[.,]\d{2})?\s?(?:€|\$|£|EUR|USD|lei|RON|PLN|HUF|CZK|SEK)\b/;
for (const file of REQUEST_PAGES) {
  const full = join(ROOT, file);
  if (!existsSync(full)) { err(file, 'missing custom-app request page'); continue; }
  const html = readFileSync(full, 'utf8');
  if (!html.includes('mailto:' + REQUEST_TO)) err(file, 'request page missing visible mailto to ' + REQUEST_TO);
  if (html.includes('contact@sagelightstudio.com')) err(file, 'request page uses the address without hyphens');
  if (PRICE_ON_REQUEST.test(html)) err(file, 'request page lists a price or amount');
  if (/<form\b[^>]*\baction\s*=\s*["']https?:/i.test(html)) err(file, 'request form posts to a server');
  if (!html.includes('method="dialog"')) err(file, 'request form is missing method="dialog"');
  if (!html.includes('event.preventDefault()')) err(file, 'request form can navigate on submit');
  const block = html.match(/<script type="application\/json" id="request-copy">([\s\S]*?)<\/script>/);
  if (!block) { err(file, 'request page missing form copy'); continue; }
  let cfg;
  try { cfg = JSON.parse(block[1]); }
  catch (e) { err(file, 'request copy is not JSON: ' + e.message); continue; }
  if (!cfg.opened || !cfg.opened.includes(REQUEST_TO)) err(file, 'opened message must name the destination address');
  if (/we have received|message sent successfully|successfully sent|am primit cererea|hemos recibido tu solicitud|abbiamo ricevuto la richiesta|nous avons reçu votre demande/i.test(cfg.opened || '')) {
    err(file, 'opened message claims the request was received');
  }
  const built = buildRequestMailto({
    name: 'Ștefan\r\nBcc: evil@example.com',
    email: 'stefan@example.com',
    idea: 'A small ledger & checklist?\nSecond line %0A <note>',
    requirements: 'iPhone și Mac\u2028only',
    subjectPrefix: cfg.subject,
    heading: cfg.heading,
    disclaimer: cfg.disclaimer,
    labels: cfg.labels,
    pageUrl: cfg.pageUrl,
    languageName: cfg.languageName,
  });
  if (!built.ok) { err(file, 'sample mailto was not buildable: ' + built.reason); continue; }
  let mailtoUrl;
  try { mailtoUrl = new URL(built.href); }
  catch (e) { err(file, 'mailto is not a URL'); continue; }
  if (mailtoUrl.protocol !== 'mailto:' || mailtoUrl.pathname !== REQUEST_TO) err(file, 'mailto recipient is not ' + REQUEST_TO);
  const keys = [...mailtoUrl.searchParams.keys()];
  if (keys.join(',') !== 'subject,body') err(file, 'mailto has unexpected parameters: ' + keys.join(','));
  const subject = mailtoUrl.searchParams.get('subject') || '';
  const body = mailtoUrl.searchParams.get('body') || '';
  if (/[\r\n]/.test(subject)) err(file, 'subject contains a line break');
  if (!body.includes('Bcc: evil@example.com') || !body.includes('Ștefan')) err(file, 'unicode or injected name was not kept inside the body');
  if (!body.includes('iPhone și Mac')) err(file, 'unicode requirements were lost');
  if (!body.includes('&') || !body.includes('%0A')) err(file, 'user punctuation was not preserved as text');
  if (built.href.includes('\n') || built.href.includes('\r') || built.href.includes(' ')) err(file, 'raw mailto contains whitespace');
  const subjectParam = built.href.split('subject=')[1].split('&body=')[0];
  if (/%0a|%0d/i.test(subjectParam)) err(file, 'subject parameter encodes a line break');
  if ((built.href.match(/subject=/g) || []).length !== 1 || (built.href.match(/[?&]body=/g) || []).length !== 1) {
    err(file, 'mailto query was split by user text');
  }
  if (!body.includes(cfg.languageName) || !body.includes(String(cfg.disclaimer).slice(0, 24))) {
    err(file, 'draft is missing the localized disclaimer or language');
  }
}
if (isReplyEmail('a@b.com\nBcc: x@y.z') || isReplyEmail('a@b.com,c@d.com')) err('request-mailto', 'unsafe reply address accepted');
if (!isReplyEmail('florin.nica+studio@sagelight-studio.com')) err('request-mailto', 'ordinary plus-address rejected');
const oversized = buildRequestMailto({
  name: 'Ana',
  email: 'ana@example.com',
  idea: 'ă'.repeat(700),
  requirements: 'ő'.repeat(900),
  subjectPrefix: 'Cerere',
  heading: 'Cerere',
  disclaimer: 'Nu este o comandă.',
  labels: { name: 'Nume', email: 'E-mail', idea: 'Idee', requirements: 'Cerințe', page: 'Pagină', language: 'Limbă' },
  pageUrl: 'https://sagelight-studio.com/ro/request.html',
  languageName: 'Română',
});
if (oversized.ok || oversized.reason !== 'too-long' || !oversized.text || !oversized.text.includes('ă')) {
  err('request-mailto', 'oversized unicode draft was not refused with its text intact');
}
const formJs = readFileSync(join(ROOT, 'assets/request-form.js'), 'utf8');
if (/requestSubmit|\.submit\(/.test(formJs)) err('assets/request-form.js', 'form is submitted programmatically');
if (formJs.indexOf('config.opened') < formJs.indexOf("addEventListener('submit'")) err('assets/request-form.js', 'opened message is assigned outside the submit handler');

if (errors.length) {
  console.error(`check-site: ${errors.length} problem(s)\n` + errors.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`check-site: ${files.length} pages OK`);
