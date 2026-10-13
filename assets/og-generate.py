#!/usr/bin/env python3
"""
Generate Open Graph social images for Sagelight Studio.
Outputs 1200x630 PNGs into /assets/og/.

Run:
    python3 assets/og-generate.py
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "og")
FONTS = os.path.join(ROOT, "assets", "fonts")
os.makedirs(OUT, exist_ok=True)

W, H = 1200, 630

# Palette — "Data Manifest" (Oct 2026)
BG = (25, 23, 36)            # #191724 ink
BG_SURFACE = (31, 29, 46)    # #1f1d2e
GREEN = (246, 193, 119)      # #f6c177 amber accent (name kept for the helpers below)
SAGE = (166, 199, 154)       # #a6c79a
TEXT = (232, 228, 216)       # #e8e4d8 paper
SUB = (201, 196, 214)        # #c9c4d6
DIM = (162, 157, 184)        # #a29db8
BORDER = (57, 53, 82)        # #393552
BORDER_SOFT = (36, 34, 52)

# Static TTFs for Pillow (web pages use the woff2 variable fonts)
F_DISPLAY = os.path.join(FONTS, "ttf", "MartianMono-ExtraBold.ttf")
F_ITALIC = os.path.join(FONTS, "ttf", "MartianMono-ExtraLight.ttf")
F_BODY = os.path.join(FONTS, "ttf", "InstrumentSans-Regular.ttf")
F_MONO = os.path.join(FONTS, "ttf", "MartianMono-Regular.ttf")


def font(path, size):
    return ImageFont.truetype(path, size)


def base_canvas():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img, "RGBA")

    # Dot matrix, fading toward the bottom
    for y in range(11, H, 22):
        a = max(0, int(34 * (1 - y / H)))
        for x in range(11, W, 22):
            d.point((x, y), fill=(224, 222, 244, a))

    # Soft amber + sage glows
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((W - 540, -200, W + 140, 460), fill=(246, 193, 119, 46))
    gd.ellipse((-220, H - 360, 420, H + 220), fill=(166, 199, 154, 26))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=90))
    img.paste(glow, (0, 0), glow)

    d = ImageDraw.Draw(img, "RGBA")

    # Top accent line
    for x in range(W):  # sage -> amber progress line
        t = x / W
        d.line([(x, 0), (x, 2)], fill=tuple(int(SAGE[i] + (GREEN[i] - SAGE[i]) * t) for i in range(3)))

    # Logo — the site's leaf mark (SVG path M4.5 19.5 C4.5 10.9 11.4 4 20 4 c0 8.6-6.9 15.5-15.5 15.5Z), scaled
    def bez(p0, p1, p2, p3, n=24):
        return [tuple((1-t)**3*p0[i] + 3*(1-t)**2*t*p1[i] + 3*(1-t)*t**2*p2[i] + t**3*p3[i] for i in range(2))
                for t in (k / n for k in range(n + 1))]
    k, ox, oy = 2.2, 58, 54
    pts = bez((4.5, 19.5), (4.5, 10.9), (11.4, 4), (20, 4)) + bez((20, 4), (20, 12.6), (13.1, 19.5), (4.5, 19.5))
    d.polygon([(ox + x * k, oy + y * k) for x, y in pts], fill=GREEN)
    d.line([(ox + 6.5 * k, oy + 17.5 * k), (ox + 17.5 * k, oy + 6.5 * k)], fill=BG, width=3)

    logo_font = font(F_DISPLAY, 24)
    d.text((114, 66), "Sagelight", font=logo_font, fill=TEXT)
    lw = d.textbbox((0, 0), "Sagelight ", font=logo_font)[2]
    d.text((114 + lw, 66), "studio", font=font(F_ITALIC, 24), fill=DIM)
    domain = font(F_MONO, 15)
    dw = d.textbbox((0, 0), "sagelight-studio.com", font=domain)[2]
    d.text((W - 64 - dw, 74), "sagelight-studio.com", font=domain, fill=DIM)

    return img, d


def draw_pill(d, x, y, text, font_obj):
    bbox = d.textbbox((0, 0), text, font=font_obj)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pw = tw + 32
    ph = th + 18
    # Pulse dot
    dot_r = 4
    d.ellipse(
        (x + 14 - dot_r, y + ph // 2 - dot_r, x + 14 + dot_r, y + ph // 2 + dot_r),
        fill=GREEN,
    )
    d.text((x + 26, y + 8), text, font=font_obj, fill=GREEN)
    return pw


def text_with_em(d, x, y, parts, font_reg, font_em, fill_reg, fill_em):
    cx = x
    for txt, kind in parts:
        f = font_em if kind == "em" else font_reg
        c = fill_em if kind == "em" else fill_reg
        d.text((cx, y), txt, font=f, fill=c)
        bbox = d.textbbox((0, 0), txt, font=f)
        cx += bbox[2] - bbox[0]


def page(out_name, eyebrow, title_lines, subtitle, footer):
    img, d = base_canvas()

    pill_font = font(F_MONO, 16)
    draw_pill(d, 64, 150, eyebrow.upper(), pill_font)

    size = 72
    while size > 36:
        title_font, title_em = font(F_DISPLAY, size), font(F_ITALIC, size)
        widest = max(sum(d.textbbox((0, 0), t, font=title_em if k == "em" else title_font)[2] for t, k in line)
                     for line in title_lines)
        if widest <= W - 128:
            break
        size -= 2
    y = 222
    for line in title_lines:
        text_with_em(d, 64, y, line, title_font, title_em, TEXT, GREEN)
        y += int(size * 1.22)

    sub_font = font(F_BODY, 26)
    wrap = wrap_text(d, subtitle, sub_font, W - 128)
    sy = y + 24
    for ln in wrap[:3]:
        d.text((64, sy), ln, font=sub_font, fill=SUB)
        sy += 38

    footer_font = font(F_MONO, 16)
    d.text((64, H - 64), footer.upper(), font=footer_font, fill=DIM)

    out_path = os.path.join(OUT, out_name)
    img.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path}")


def wrap_text(d, text, fnt, max_w):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        test = (cur + " " + w).strip()
        bw = d.textbbox((0, 0), test, font=fnt)
        if bw[2] - bw[0] <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


PAGES = [
    {
        "out": "home.png",
        "eyebrow": "Privacy-first · EU-built",
        "title_lines": [
            [("Your paperwork,", "em")],
            [("sent to us: ", "reg"), ("0 bytes.", "em")],
        ],
        "subtitle": "SageDocs · SageBills · SageMeet — privacy-first iOS & macOS apps from an independent studio in Romania, EU.",
        "footer": "iOS · macOS · GDPR Compliant · Zero Tracking",
    },
    {
        "out": "sagebills.png",
        "eyebrow": "SageBills · iOS & macOS · Free",
        "title_lines": [
            [("Every bill.", "reg")],
            [("Every provider. ", "reg"), ("One app.", "em")],
        ],
        "subtitle": "The smart utility tracker built for European households. Track, predict, and save — with zero data leaving your device.",
        "footer": "40+ Categories · OCR Scanning · GDPR Compliant",
    },
    {
        "out": "sagemeet.png",
        "eyebrow": "SageMeet · iOS · BYOK",
        "title_lines": [
            [("Record. Transcribe.", "reg")],
            [("Remember ", "em"), ("everything.", "reg")],
        ],
        "subtitle": "AI meeting recorder for iPhone. Whisper transcripts and GPT-4o summaries with your own OpenAI key. Private Mode disables all external data.",
        "footer": "Whisper · GPT-4o · Bring Your Own Key · Private Mode",
    },
    {
        "out": "sagedocs.png",
        "eyebrow": "SageDocs · iOS & macOS · From $2.99/mo",
        "title_lines": [
            [("Your documents.", "reg")],
            [("Encrypted. ", "em"), ("Yours.", "em")],
        ],
        "subtitle": "AES-256 encrypted vault for IDs, contracts, insurance, and personal documents. Biometric-protected. Encrypted iCloud sync.",
        "footer": "AES-256-GCM · Face ID · Encrypted iCloud · 7-day trial",
    },
    {
        "out": "blog.png",
        "eyebrow": "Sagelight Studio · Blog",
        "title_lines": [
            [("Tips, insights,", "reg")],
            [("and ", "reg"), ("smart bills", "em"), (".", "reg")],
        ],
        "subtitle": "Money-saving guides and product updates for European households who want to spend less and know more about their utilities.",
        "footer": "Money Saving · Guides · Market Insights",
    },
    {
        "out": "press.png",
        "eyebrow": "Sagelight Studio · Press Kit",
        "title_lines": [
            [("Press resources", "reg")],
            [("for ", "reg"), ("Sagelight ", "em"), ("Studio", "reg")],
        ],
        "subtitle": "Brand assets, press releases, screenshots, and contact info. Everything journalists and content creators need to cover our apps.",
        "footer": "contact@sagelight-studio.com",
    },
    {
        "out": "legal.png",
        "eyebrow": "Sagelight Studio · Legal",
        "title_lines": [
            [("Privacy. GDPR.", "reg")],
            [("Terms ", "em"), ("of Service.", "reg")],
        ],
        "subtitle": "Local-first apps. Zero tracking. Full GDPR compliance. Read exactly how we handle your data — short version: we don't.",
        "footer": "GDPR · Articles 13 & 14 · ePrivacy",
    },
]


BLOG_POSTS = [
    {
        "out": "blog-save-utility-bills-europe.png",
        "eyebrow": "Blog · Money Saving",
        "title_lines": [
            [("Save ", "reg"), ("€1,200/year", "em")],
            [("on utility bills.", "reg")],
        ],
        "subtitle": "Where European households overpay on electricity, gas, water, and building services — and how to recover it, country by country.",
        "footer": "Electricity · Gas · Water · Building Fees",
    },
    {
        "out": "blog-romanian-electricity-bill-guide.png",
        "eyebrow": "Blog · Romania",
        "title_lines": [
            [("Your electricity bill,", "reg")],
            [("decoded ", "em"), ("line by line.", "reg")],
        ],
        "subtitle": "A line-by-line decoder for Romanian electricity invoices: tariffs, network fees, green certificates, and how to spot errors.",
        "footer": "PPC · Electrica · Tariffs · Certificates",
    },
    {
        "out": "blog-sagebills-v1-launch.png",
        "eyebrow": "Blog · Product Update",
        "title_lines": [
            [("SageBills v1.0", "reg")],
            [("is ", "reg"), ("live.", "em")],
        ],
        "subtitle": "A transparent look at the 40+ bill categories, on-device OCR, anomaly detection, and what's coming next.",
        "footer": "40+ Categories · OCR · On-device AI",
    },
    {
        "out": "blog-winter-heating-cee-2025-2026.png",
        "eyebrow": "Blog · Market Insights",
        "title_lines": [
            [("Winter heating in CEE:", "reg")],
            [("2025–2026 ", "em"), ("review.", "reg")],
        ],
        "subtitle": "Gas, district heating, and price caps across Romania, Poland, Hungary, and Czechia — what this season actually cost households.",
        "footer": "Romania · Poland · Hungary · Czechia",
    },
    {
        "out": "blog-apps-european-renter-iphone.png",
        "eyebrow": "Blog · Guides",
        "title_lines": [
            [("5 apps every", "reg")],
            [("European renter ", "em"), ("needs.", "reg")],
        ],
        "subtitle": "The renter's essential iPhone workflow: utility tracking, document storage, cross-border payments, and invoice translation.",
        "footer": "Renting · Utilities · Documents",
    },
    {
        "out": "blog-building-maintenance-fees-romania.png",
        "eyebrow": "Blog · Romania",
        "title_lines": [
            [("The hidden cost of", "reg")],
            [("întreținere", "em"), (" fees.", "reg")],
        ],
        "subtitle": "Romanian building maintenance fees are rarely explained and almost never audited. What's mandatory, what's added, and your rights.",
        "footer": "Întreținere · Audits · Tenant Rights",
    },
]


def main():
    for p in PAGES + BLOG_POSTS:
        page(p["out"], p["eyebrow"], p["title_lines"], p["subtitle"], p["footer"])
    print(f"\nGenerated {len(PAGES) + len(BLOG_POSTS)} OG images in {OUT}")


if __name__ == "__main__":
    main()
