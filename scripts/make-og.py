"""Génère l'image de partage (Open Graph) : public/og.png, 1200 x 630.

Même identité que le site : fond noir, réseau de nœuds, accent vert.
Usage : python scripts/make-og.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (10, 11, 13)
TEXT = (237, 237, 232)
MUTED = (169, 174, 182)
SIGNAL = (61, 220, 132)
FONTS = Path(r"C:\Windows\Fonts")
OUT = Path(__file__).resolve().parent.parent / "public" / "og.png"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def main() -> None:
    random.seed(20260927)
    img = Image.new("RGB", (W, H), BG)

    # Réseau : sphère projetée sur la droite de l'image.
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    net = ImageDraw.Draw(glow)
    cx, cy, r = 900, 315, 230
    nodes = []
    for i in range(70):
        y = 1 - 2 * (i + 0.5) / 70
        rad = math.sqrt(1 - y * y)
        th = i * math.pi * (3 - math.sqrt(5)) + 0.6
        x, z = math.cos(th) * rad, math.sin(th) * rad
        nodes.append((cx + x * r, cy + y * r * 0.9, z, i % 9 == 0))
    for i, (x, y, z, _) in enumerate(nodes):
        for j in range(i + 1, len(nodes)):
            x2, y2, _, _ = nodes[j]
            if (x - x2) ** 2 + (y - y2) ** 2 < 95**2:
                shade = int(40 + 30 * (z + 1))
                net.line((x, y, x2, y2), fill=(shade, shade + 4, shade + 10), width=1)
    for x, y, z, mission in nodes:
        size = 7 if mission else 3 + 1.5 * (z + 1)
        color = SIGNAL if mission else (200, 204, 210)
        net.ellipse((x - size, y - size, x + size, y + size), fill=color)
    halo = glow.filter(ImageFilter.GaussianBlur(10))
    img = Image.blend(img, Image.eval(halo, lambda v: min(255, v)), 0.35)
    img.paste(glow, (0, 0), Image.eval(glow.convert("L"), lambda v: 255 if v > 20 else 0))

    # Voile à gauche pour la lisibilité du texte.
    veil = Image.new("L", (W, H))
    vd = ImageDraw.Draw(veil)
    for x in range(W):
        vd.line((x, 0, x, H), fill=int(235 * max(0.0, 1 - x / 760)))
    img.paste(Image.new("RGB", (W, H), BG), (0, 0), veil)

    d = ImageDraw.Draw(img)
    d.ellipse((72, 86, 84, 98), fill=SIGNAL)
    d.text((98, 80), "SYSTÈME EN LIGNE", font=font("consola.ttf", 20), fill=SIGNAL)
    d.text((72, 150), "Legma Parfait", font=font("segoeuib.ttf", 76), fill=TEXT)
    d.text((72, 250), "Développeur Full-Stack & IA", font=font("segoeui.ttf", 40), fill=MUTED)
    d.text((72, 360), "Je construis des systèmes,", font=font("segoeuib.ttf", 44), fill=TEXT)
    d.text((72, 414), "pas seulement des interfaces.", font=font("segoeuib.ttf", 44), fill=TEXT)
    d.text((72, 540), "PYTHON · FASTAPI · NEXT.JS · POSTGRESQL · FLUTTER", font=font("consola.ttf", 20), fill=MUTED)

    img.save(OUT, "PNG", optimize=True)
    print(f"{OUT.name} : {OUT.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
