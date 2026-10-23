#!/usr/bin/env python3
"""
Brand marks: the heritage seal (logo concept F, chosen by the client) and the
P at its centre, generated from geometry and the site's own Inter so every
file stays in step.

    python scripts/brand-marks.py          (from brand-site/; needs fontTools + brotli,
                                            Pillow, and Chrome for the rasters)

The seal: a heavy outer ring, a hairline ring, the inner circle; PAVLICEVITS
COLORS on the upper arc, SINCE 1990 on the lower one, a drop at each end of
the horizontal; in the middle the P whose counter is the hero film's drop,
leaning 45° into the corner where the bowl meets the stem. Beside the
wordmark and below ~64 px the seal becomes the roundel: one heavy ring and
the P (a bare P before PAVLICEVITS would read as "PPAVLICEVITS"). The
logotype speaks the site's headline voice: PAVLICEVITS in heavy Inter caps,
Colors in light Noto Serif Display italic.

Writes
  public/brand/emblem.svg, emblem-light.svg   the seal for dark / light grounds, text outlined
  public/brand/roundel.svg, roundel-light.svg  the roundel (privacy, terms, 404 headers)
  public/brand/lockup.svg, lockup-light.svg    roundel + logotype on one line, set like the header
  public/favicon.svg                           the roundel, light/dark aware
  index.html                                   the inline seal for the intro and the hero, the
                                               inline roundel for the header (<!-- emblem:… -->)
  ../public/svg/pavlicevits_logo.svg, _mark   the light lockup, and the P for the e-shop's
                                               chat badge (already a circle)
  and, through scripts/rasterize.mjs (headless Chrome):
  public/apple-touch-icon.png, public/brand/emblem-512.png, public/og-image.jpg,
  ../src/app/favicon.ico
"""
import json
import math
import re
import subprocess
import sys
from io import BytesIO
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SITE = Path(__file__).resolve().parent.parent
ROOT = SITE.parent
FONT = SITE / 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
SERIF = SITE / 'node_modules/@fontsource-variable/noto-serif-display/files/noto-serif-display-latin-wght-italic.woff2'

# colours: ink (rings, text) and mark (P, drops) per ground
DARK = {'k': '#F2F6F8', 'm': '#5BC5DB'}
LIGHT = {'k': '#0A0E1A', 'm': '#0F4C5C'}

# seal geometry, 100-unit box centred on 50,50 (concept F)
RINGS = [(48, 2.2), (44.9, 0.6), (31.6, 0.8)]          # radius, stroke
TEXT_SIZE, TEXT_WEIGHT, TRACK = 6.1, 600, 1.05
TOP = ('PAVLICEVITS COLORS', 36.15)                      # text, baseline radius (reads outward)
BOTTOM = ('SINCE 1990', 40.65)                            # text, baseline radius (reads inward)
BOTTOM_TRACK = 1.9                                        # the short line opens up to sit like the top one
DROP = 'M11.6,48.05 L12.74,49.82 A1.35,1.35 0 1 1 10.46,49.82 Z'
P_OUTER = [(20, 10), ('H', 51), ('A', 26, 51, 62), ('H', 38), ('V', 92), ('H', 20)]
P_TIP, P_CENTRE, P_DROP_R = (38.63, 23.63), (51, 36), 10.5   # 45° drop, concentric with the bowl
P_INK = (20, 10, 37, 82)                                  # x, y, w, h of the P's ink
# centre of visual mass and the farthest ink from it (measure_ink.py, a3-monogram-45)
P_MASS = (42.22, 43.98, 52.92)
# The P sits in a circle the way every mark shown on its own does in the
# logo presenter (circle_box in build_presenter.py): centred halfway between
# its ink box and its centre of mass, and sized by the circle around that
# centre that holds all its ink, which takes a fixed share of the room inside.
SEAL_P_FILL = 0.756                                       # of the inner circle's inner edge (the concept's size)
# The roundel: the seal reduced for small sizes and for sitting beside the
# wordmark (a bare P there reads as "PPAVLICEVITS"): one heavy ring and the P,
# drawn for 16 px (ring and gaps over 6 units of the 100 box)
ROUNDEL_RING = (46.5, 7)                                  # radius, stroke
ROUNDEL_P_FILL = 0.70                                     # the presenter's chips use 0.69 (22 px marks in 32 px circles); a hair fuller holds at 16 px


def n(v):
    s = f'{v:.2f}'.rstrip('0').rstrip('.')
    return '0' if s == '-0' else s


# ── the P ──────────────────────────────────────────────────────────
def p_path(tx=0.0, ty=0.0, s=1.0):
    """The P with its leaning drop counter, optionally placed (evenodd)."""
    X = lambda x: n(tx + x * s)
    Y = lambda y: n(ty + y * s)
    (x0, y0), d = P_OUTER[0], []
    d.append(f'M{X(x0)},{Y(y0)}')
    for seg in P_OUTER[1:]:
        if seg[0] == 'H':
            d.append(f'H{X(seg[1])}')
        elif seg[0] == 'V':
            d.append(f'V{Y(seg[1])}')
        else:
            _, r, x, y = seg
            d.append(f'A{n(r * s)},{n(r * s)} 0 0 1 {X(x)},{Y(y)}')
    d.append('Z')
    # the drop: tip, then the two tangent points of the round end
    (tx0, ty0), (cx, cy), r = P_TIP, P_CENTRE, P_DROP_R
    dist = math.hypot(cx - tx0, cy - ty0)
    axis = math.atan2(cy - ty0, cx - tx0)
    half = math.asin(r / dist)
    t = math.sqrt(dist * dist - r * r)
    a = (tx0 + t * math.cos(axis - half), ty0 + t * math.sin(axis - half))
    b = (tx0 + t * math.cos(axis + half), ty0 + t * math.sin(axis + half))
    d.append(f'M{X(tx0)},{Y(ty0)} L{X(a[0])},{Y(a[1])} A{n(r * s)},{n(r * s)} 0 1 1 {X(b[0])},{Y(b[1])} Z')
    return ' '.join(d)


# ── ring text: Inter 600, kerned, outlined along the arcs ──────────
def load_font(weight=TEXT_WEIGHT, file=FONT):
    return instancer.instantiateVariableFont(TTFont(file), {'wght': weight})


def kerning(font):
    pairs, classes = {}, []
    gpos = font['GPOS'].table
    lookups = {i for fr in gpos.FeatureList.FeatureRecord if fr.FeatureTag == 'kern' for i in fr.Feature.LookupListIndex}
    for li in lookups:
        for st in gpos.LookupList.Lookup[li].SubTable:
            st = getattr(st, 'ExtSubTable', st)
            if getattr(st, 'Format', None) == 1 and hasattr(st, 'PairSet'):
                for g1, ps in zip(st.Coverage.glyphs, st.PairSet):
                    for rec in ps.PairValueRecord:
                        v = getattr(rec.Value1, 'XAdvance', 0) or 0
                        pairs.setdefault((g1, rec.SecondGlyph), v)
            elif getattr(st, 'Format', None) == 2:
                classes.append(st)

    def kern(a, b):
        if (a, b) in pairs:
            return pairs[(a, b)]
        for st in classes:
            if a not in st.Coverage.glyphs:
                continue
            c1 = st.ClassDef1.classDefs.get(a, 0)
            c2 = st.ClassDef2.classDefs.get(b, 0)
            v = getattr(st.Class1Record[c1].Class2Record[c2].Value1, 'XAdvance', 0) or 0
            if v:
                return v
        return 0
    return kern


def arc_text(font, kern, text, r, inward, track):
    """Outlines of `text` centred on the top (inward=False) or bottom arc."""
    cmap, hmtx, gs = font.getBestCmap(), font['hmtx'], font.getGlyphSet()
    k = TEXT_SIZE / font['head'].unitsPerEm
    glyphs = [cmap[ord(c)] for c in text]
    adv = [hmtx[g][0] * k for g in glyphs]
    kerns = [kern(a, b) * k for a, b in zip(glyphs, glyphs[1:])] + [0]
    total = sum(adv) + sum(kerns) + track * (len(glyphs) - 1)
    pen = SVGPathPen(gs, ntos=n)
    s = math.pi * r / 2 - total / 2       # arc length from the arc's start to the first glyph
    for g, a, kk in zip(glyphs, adv, kerns):
        mid = s + a / 2
        if inward:   # bottom arc, left → right through 6 o'clock
            phi = math.pi - mid / r
            theta = phi - math.pi / 2
        else:        # top arc, left → right through 12 o'clock
            phi = math.pi + mid / r
            theta = phi + math.pi / 2
        px, py = 50 + r * math.cos(phi), 50 + r * math.sin(phi)
        t = Transform().translate(px, py).rotate(theta).translate(-a / 2, 0).scale(k, -k)
        gs[g].draw(TransformPen(pen, t))
        s += a + kk + track
    return pen.getCommands()


# ── assemble ───────────────────────────────────────────────────────
def seal_parts(font, kern):
    r, w = RINGS[2]
    return {
        'rings': ''.join(
            f'<circle class="emblem__ring emblem__ring--{i + 1}" cx="50" cy="50" r="{r}" stroke-width="{w}" pathLength="100"/>'
            for i, (r, w) in enumerate(RINGS)),
        'top': arc_text(font, kern, TOP[0], TOP[1], False, TRACK),
        'bottom': arc_text(font, kern, BOTTOM[0], BOTTOM[1], True, BOTTOM_TRACK),
        'drops': DROP + ' ' + DROP.replace('M11.6', 'M88.4').replace('L12.74', 'L89.54').replace('10.46,49.82', '87.26,49.82'),
        'p': p_in_circle(r - w / 2, SEAL_P_FILL)[0],
    }


def seal_svg(parts, c, attrs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"{attrs}>'
            f'<g fill="none" stroke="{c["k"]}">{parts["rings"]}</g>'
            f'<path fill="{c["k"]}" d="{parts["top"]} {parts["bottom"]}"/>'
            f'<path fill="{c["m"]}" d="{parts["drops"]}"/>'
            f'<path fill="{c["m"]}" fill-rule="evenodd" d="{parts["p"]}"/></svg>')


def seal_inline(parts, cls):
    """Inline seal with a class per part, coloured by --k / --m (style.css, index.html)."""
    return (f'<svg class="emblem {cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'
            f'<g class="emblem__rings">{parts["rings"]}</g>'
            f'<path class="emblem__text emblem__text--top" d="{parts["top"]}"/>'
            f'<path class="emblem__text emblem__text--bottom" d="{parts["bottom"]}"/>'
            f'<path class="emblem__drops" d="{parts["drops"]}"/>'
            f'<path class="emblem__p" fill-rule="evenodd" d="{parts["p"]}"/></svg>')


def mark_svg(colour):
    x, y, w, h = P_INK
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" width="{w}" height="{h}">'
            f'<path fill="{colour}" fill-rule="evenodd" d="{p_path()}"/></svg>')


def p_in_circle(room, fill, w=0.5):
    """The P placed in a circle of radius `room` around 50,50: its centre
    halfway (w) between ink box and mass, its ink circle `fill` × room.
    Returns (path, ink box)."""
    x, y, iw, ih = P_INK
    mx, my, r = P_MASS
    cx = x + iw / 2 + (mx - (x + iw / 2)) * w
    cy = y + ih / 2 + (my - (y + ih / 2)) * w
    R = r + math.hypot(cx - mx, cy - my)
    s = fill * room / R
    tx, ty = 50 - cx * s, 50 - cy * s
    return p_path(tx, ty, s), (tx + x * s, ty + y * s, iw * s, ih * s)


def roundel_p():
    r, w = ROUNDEL_RING
    return p_in_circle(r - w / 2, ROUNDEL_P_FILL)


def roundel_svg(ring, mark, attrs=''):
    r, w = ROUNDEL_RING
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"{attrs}>'
            f'<circle cx="50" cy="50" r="{r}" fill="none" stroke="{ring}" stroke-width="{w}"/>'
            f'<path fill="{mark}" fill-rule="evenodd" d="{roundel_p()[0]}"/></svg>')


def roundel_inline(cls):
    """Inline roundel for the site header, coloured by --k / --m."""
    r, w = ROUNDEL_RING
    return (f'<svg class="roundel {cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'
            f'<circle class="roundel__ring" cx="50" cy="50" r="{r}" stroke-width="{w}" pathLength="100"/>'
            f'<path class="roundel__p" fill-rule="evenodd" d="{roundel_p()[0]}"/></svg>')


def favicon_svg():
    # the roundel; it follows the tab's light or dark scheme
    r, w = ROUNDEL_RING
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
            f'<style>circle{{stroke:{LIGHT["k"]}}}path{{fill:{LIGHT["m"]}}}'
            f'@media (prefers-color-scheme:dark){{circle{{stroke:{DARK["k"]}}}path{{fill:{DARK["m"]}}}}}</style>'
            f'<circle cx="50" cy="50" r="{r}" fill="none" stroke-width="{w}"/>'
            f'<path fill-rule="evenodd" d="{roundel_p()[0]}"/></svg>')


# The lockup is the site header's brand in outlines: the roundel at 2.1 × the
# wordmark's cap height, centred on the cap band, 0.6 em of air, then the
# logotype in the site's headline voice: PAVLICEVITS in Inter 800 tracked
# 0.06 em, and Colors in Noto Serif Display italic 300 at 1.3 ×, on the same
# baseline 0.33 em on (as .site-header__brand sets it)
CAP = 0.727
LOCKUP_K, LOCKUP_GAP, NAME_TRACK, WORD_GAP, COLORS_SCALE = 2.1, 0.6, 0.06, 0.33, 1.3


def set_line(font, kern, text, x, size, track):
    """Outlines of `text` on baseline 0 from x; returns (path, x after the last glyph)."""
    cmap, hmtx, gs = font.getBestCmap(), font['hmtx'], font.getGlyphSet()
    k = size / font['head'].unitsPerEm
    glyphs = [cmap[ord(c)] for c in text]
    pen = SVGPathPen(gs, ntos=n)
    for i, g in enumerate(glyphs):
        gs[g].draw(TransformPen(pen, Transform().translate(x, 0).scale(k, -k)))
        x += hmtx[g][0] * k
        if i + 1 < len(glyphs):
            x += kern(g, glyphs[i + 1]) * k + track
    return pen.getCommands(), x


def lockup_svg(name_font, colors_font, c):
    C = 100
    size = C / CAP
    D = LOCKUP_K * C
    top = -C / 2 - D / 2                       # roundel centred on the cap band
    r, w = ROUNDEL_RING
    k = D / 100
    ring = (f'<circle cx="{n(D / 2)}" cy="{n(top + D / 2)}" r="{n(r * k)}" fill="none" '
            f'stroke="{c["k"]}" stroke-width="{n(w * k)}"/>')
    p = roundel_p()[0]                         # in roundel units, scaled into place below
    x = D + LOCKUP_GAP * size
    name, x = set_line(*name_font, 'PAVLICEVITS', x, size, NAME_TRACK * size)
    x += (NAME_TRACK + WORD_GAP) * size
    colors, x = set_line(*colors_font, 'Colors', x, COLORS_SCALE * size, 0.005 * size)
    W = x + 0.04 * size                        # the italic's overhang
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {n(top)} {n(W)} {n(D)}" width="{n(W)}" height="{n(D)}">'
            f'{ring}<path fill="{c["m"]}" fill-rule="evenodd" transform="translate(0 {n(top)}) scale({n(k)})" d="{p}"/>'
            f'<path fill="{c["k"]}" d="{name}"/><path fill="{c["m"]}" d="{colors}"/></svg>')


def inject(html, marker, content):
    pat = re.compile(rf'(<!-- emblem:{marker} -->).*?(<!-- /emblem:{marker} -->)', re.S)
    if not pat.search(html):
        sys.exit(f'index.html: missing <!-- emblem:{marker} --> markers')
    return pat.sub(lambda m: m.group(1) + content + m.group(2), html)


def main():
    font = load_font()
    kern = kerning(font)
    parts = seal_parts(font, kern)
    brand = SITE / 'public/brand'
    (brand / 'emblem.svg').write_text(seal_svg(parts, DARK), encoding='utf-8')
    (brand / 'emblem-light.svg').write_text(seal_svg(parts, LIGHT), encoding='utf-8')
    (brand / 'roundel.svg').write_text(roundel_svg(DARK['k'], DARK['m']), encoding='utf-8')
    (brand / 'roundel-light.svg').write_text(roundel_svg(LIGHT['k'], LIGHT['m']), encoding='utf-8')
    (SITE / 'public/favicon.svg').write_text(favicon_svg(), encoding='utf-8')
    heavy, italic = load_font(800), load_font(300, SERIF)
    heavy, italic = (heavy, kerning(heavy)), (italic, kerning(italic))
    (brand / 'lockup.svg').write_text(lockup_svg(heavy, italic, DARK), encoding='utf-8')
    lockup_light = lockup_svg(heavy, italic, LIGHT)
    (brand / 'lockup-light.svg').write_text(lockup_light, encoding='utf-8')
    (ROOT / 'public/svg/pavlicevits_logo.svg').write_text(lockup_light, encoding='utf-8')
    (ROOT / 'public/svg/pavlicevits_mark.svg').write_text(mark_svg(LIGHT['m']), encoding='utf-8')

    index = SITE / 'index.html'
    html = index.read_text(encoding='utf-8')
    html = inject(html, 'intro', seal_inline(parts, 'intro__mark'))
    html = inject(html, 'hero', seal_inline(parts, 'hero__emblem'))
    html = inject(html, 'header', roundel_inline('site-header__mark'))
    index.write_text(html, encoding='utf-8')

    # rasters: headless Chrome renders, Pillow packs the .ico and the .jpg
    jobs = [
        {'out': 'apple-touch-icon.png', 'w': 180, 'h': 180, 'bg': '#0A0E1A',
         'html': f'<div style="display:grid;place-items:center;width:180px;height:180px">'
                 f'<img src="brand/emblem.svg" style="width:150px;height:150px"></div>'},
        {'out': 'emblem-512.png', 'w': 512, 'h': 512, 'bg': '#FFFFFF',
         'html': '<div style="display:grid;place-items:center;width:512px;height:512px">'
                 '<img src="brand/emblem-light.svg" style="width:460px;height:460px"></div>'},
        {'out': 'og.png', 'w': 1200, 'h': 630, 'bg': '#0A0E1A',
         'html': '<div style="position:relative;width:1200px;height:630px;overflow:hidden;background:#0A0E1A">'
                 '<img src="og-film.webp" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55">'
                 '<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(91,197,219,.16),rgba(10,14,26,0) 34%),'
                 'linear-gradient(180deg,rgba(10,14,26,.35),rgba(10,14,26,.7))"></div>'
                 '<img src="brand/emblem.svg" style="position:absolute;left:465px;top:180px;width:270px;height:270px"></div>'},
    ] + [{'out': f'ico-{s}.png', 'w': s, 'h': s, 'bg': 'transparent',
          'html': f'<img src="favicon-ico.svg" style="display:block;width:{s}px;height:{s}px">'} for s in (16, 32, 48)]
    work = SITE / 'scripts/.marks'
    work.mkdir(exist_ok=True)
    (work / 'brand').mkdir(exist_ok=True)
    for f in ('emblem.svg', 'emblem-light.svg'):
        (work / 'brand' / f).write_text((brand / f).read_text(encoding='utf-8'), encoding='utf-8')
    # the .ico has no light/dark switch: the mid teal reads on both tab colours
    (work / 'favicon-ico.svg').write_text(roundel_svg('#2BA8C2', '#2BA8C2'), encoding='utf-8')
    (work / 'og-film.webp').write_bytes((SITE / 'public/media/hero-poster.webp').read_bytes())
    (work / 'jobs.json').write_text(json.dumps(jobs), encoding='utf-8')
    subprocess.run(['node', str(SITE / 'scripts/rasterize.mjs'), str(work)], check=True)

    from PIL import Image
    Image.open(work / 'apple-touch-icon.png').convert('RGB').save(SITE / 'public/apple-touch-icon.png', optimize=True)
    Image.open(work / 'emblem-512.png').convert('RGB').save(brand / 'emblem-512.png', optimize=True)
    Image.open(work / 'og.png').convert('RGB').save(SITE / 'public/og-image.jpg', quality=88, optimize=True, progressive=True)
    icos = [Image.open(work / f'ico-{s}.png').convert('RGBA') for s in (16, 32, 48)]
    buf = BytesIO()
    icos[2].save(buf, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=icos[:2])
    (ROOT / 'src/app/favicon.ico').write_bytes(buf.getvalue())
    print('brand marks written')


if __name__ == '__main__':
    main()
