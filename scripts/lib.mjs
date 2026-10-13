// Shared helpers for the site scripts (no dependencies).
import { readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

export const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
export const ORIGIN = 'https://sagelight-studio.com';

// All published HTML files, relative to the repo root.
export function listHtml(dir = ROOT) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules' || name === 'scripts') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listHtml(p));
    else if (name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(name)) out.push(relative(ROOT, p));
  }
  return out.sort();
}

// https://sagelight-studio.com/ro/ -> ro/index.html
export function urlToFile(url) {
  let path = new URL(url, ORIGIN + '/').pathname.replace(/^\//, '');
  if (path === '' || path.endsWith('/')) path += 'index.html';
  return decodeURIComponent(path);
}

// ro/index.html -> https://sagelight-studio.com/ro/
export function fileToUrl(file) {
  return ORIGIN + '/' + file.replace(/(^|\/)index\.html$/, '$1');
}
