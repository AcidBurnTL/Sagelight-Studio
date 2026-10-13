#!/usr/bin/env python3
"""Generate PNG favicon variants from the brand SVG (drawn natively in PIL)."""

import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = ROOT

# "Data Manifest" palette (Oct 2026) — mirrors favicon.svg
BG = (25, 23, 36)            # #191724 ink
AMBER = (246, 193, 119)      # #f6c177


def bez(p0, p1, p2, p3, n=48):
    return [tuple((1-t)**3*p0[i] + 3*(1-t)**2*t*p1[i] + 3*(1-t)*t**2*p2[i] + t**3*p3[i] for i in range(2))
            for t in (k / n for k in range(n + 1))]


def render(size: int) -> Image.Image:
    """Draw at 4x then downsample for smooth edges. Leaf = the site's SVG path in a 24-unit box."""
    S = size * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 5.5 / 24), fill=BG + (255,))
    k = S / 24
    pts = bez((4.5, 19.5), (4.5, 10.9), (11.4, 4), (20, 4)) + bez((20, 4), (20, 12.6), (13.1, 19.5), (4.5, 19.5))
    d.polygon([(x * k, y * k) for x, y in pts], fill=AMBER)
    if size >= 32:
        d.line([(6.5 * k, 17.5 * k), (17.5 * k, 6.5 * k)], fill=(150, 112, 74, 255), width=max(1, int(1.1 * k)))
    return img.resize((size, size), Image.LANCZOS)


SIZES = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "apple-touch-icon.png": 180,
    "icon-192.png": 192,
    "icon-512.png": 512,
    "og-favicon.png": 256,
}

for name, sz in SIZES.items():
    img = render(sz)
    img.save(os.path.join(OUT, name), "PNG", optimize=True)
    print(f"wrote {name} ({sz}×{sz})")

print("\nFavicon variants written.")
