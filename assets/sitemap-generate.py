#!/usr/bin/env python3
"""
Regenerate sitemap.xml from the pages themselves.

- <loc>: each page's <link rel="canonical">
- xhtml:link alternates: each page's <link rel="alternate" hreflang=...> tags
- <lastmod>: article:modified_time for blog posts; otherwise the date already in
  sitemap.xml for that URL (kept honest by hand), or --date for new/changed pages.
  No changefreq/priority (Google ignores them).

Run from the site root:
    python3 assets/sitemap-generate.py [--date YYYY-MM-DD] [--touch path.html ...]
--touch marks pages whose content changed so they get --date.
"""
import re, sys, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
args = sys.argv[1:]
DATE = args[args.index('--date') + 1] if '--date' in args else datetime.date.today().isoformat()
TOUCH = set(args[args.index('--touch') + 1:]) if '--touch' in args else set()

old = {}
sm = ROOT / 'sitemap.xml'
if sm.exists():
    for loc, lm in re.findall(r'<loc>([^<]+)</loc>.*?<lastmod>([^<]+)</lastmod>', sm.read_text(), re.S):
        old[loc] = lm

entries = []
for p in sorted(ROOT.rglob('*.html')):
    rel = p.relative_to(ROOT)
    if rel.parts[0].startswith('.') or p.name.startswith('google') or p.name == '404.html':
        continue
    s = p.read_text(encoding='utf-8')
    if re.search(r'<meta name="robots" content="[^"]*noindex', s):
        continue
    m = re.search(r'<link rel="canonical" href="([^"]+)"', s)
    if not m:
        print('no canonical:', rel); continue
    loc = m.group(1)
    alts = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', s)
    art = re.search(r'<meta property="article:modified_time" content="(\d{4}-\d{2}-\d{2})', s)
    if art:
        lm = art.group(1)
    elif str(rel) in TOUCH or loc not in old:
        lm = DATE
    else:
        lm = old[loc]
    entries.append((loc, alts, lm))

order = lambda e: (0 if e[0].rstrip('/').count('/') <= 2 else 1, e[0])
out = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
       '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for loc, alts, lm in sorted(entries, key=order):
    out.append('    <url>')
    out.append(f'        <loc>{loc}</loc>')
    for hl, href in alts:
        out.append(f'        <xhtml:link rel="alternate" hreflang="{hl}" href="{href}"/>')
    out.append(f'        <lastmod>{lm}</lastmod>')
    out.append('    </url>')
out.append('</urlset>\n')
sm.write_text('\n'.join(out), encoding='utf-8')
print(f'{len(entries)} URLs written to sitemap.xml')
