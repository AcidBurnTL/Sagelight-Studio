#!/usr/bin/env node
// Submits changed URLs to IndexNow (Bing, Yandex, Seznam, Naver...) after a deploy.
//   node scripts/indexnow.mjs <before-sha> <after-sha>   URLs changed between two commits
//   node scripts/indexnow.mjs --all                       every URL in sitemap.xml
// Waits until the first changed URL is live on GitHub Pages before submitting.
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ROOT, ORIGIN, fileToUrl } from './lib.mjs';

const key = readdirSync(ROOT).find(f => /^[0-9a-f]{32}\.txt$/.test(f))?.slice(0, 32);
if (!key) { console.error('IndexNow key file (<32 hex>.txt) not found in repo root'); process.exit(1); }

let urls;
if (process.argv[2] === '--all') {
  urls = [...readFileSync(`${ROOT}/sitemap.xml`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
} else {
  const [before, after = 'HEAD'] = process.argv.slice(2);
  const from = !before || /^0+$/.test(before) ? `${after}~1` : before;
  const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=AM', from, after], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
  urls = changed.filter(f => f.endsWith('.html') && !f.startsWith('scripts/') && !/^google[0-9a-f]+\.html$/.test(f) && f !== '404.html').map(fileToUrl);
}
if (!urls.length) { console.log('IndexNow: no changed pages'); process.exit(0); }

// wait for GitHub Pages to publish (up to ~5 minutes)
const probe = `${ORIGIN}/${key}.txt`;
for (let i = 0; i < 30; i++) {
  const r = await fetch(urls[0], { method: 'HEAD' }).catch(() => null);
  const k = await fetch(probe).then(r => r.text()).catch(() => '');
  if (r?.ok && k.trim() === key) break;
  await new Promise(res => setTimeout(res, 10_000));
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(ORIGIN).host, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: urls.slice(0, 10000) }),
});
console.log(`IndexNow: HTTP ${res.status} for ${urls.length} URL(s)`);
if (res.status >= 400) process.exit(1);
