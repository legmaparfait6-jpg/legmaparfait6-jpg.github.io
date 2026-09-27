"""Transforme le portrait en nuage de points pour la scène 3D du hero.

La densité des points suit la lumière de la photo : le visage éclairé devient
dense et net, le fond et le pull noir deviennent une brume légère.

Sortie : public/profile/portrait-points.bin
  Uint16 par point : x, y (0..65535, repère normalisé), intensité (0..65535).
Aperçu : scripts/.portrait-preview.png (non versionné)

Usage : python scripts/make-portrait-points.py [nombre_de_points]
"""
import random
import sys
from array import array
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "profile" / "legma-parfait.webp"
OUT = ROOT / "public" / "profile" / "portrait-points.bin"
PREVIEW = ROOT / "scripts" / ".portrait-preview.png"

COUNT = int(sys.argv[1]) if len(sys.argv) > 1 else 6000
# Cadrage tête et épaules (pixels du portrait 612 x 765).
CROP = (70, 20, 540, 600)
STEP = 2  # échantillonnage d'un pixel sur deux

def main() -> None:
    random.seed(20260927)
    rgb = Image.open(SOURCE).convert("RGB").crop(CROP)
    gray = rgb.convert("L")
    # Contours (silhouette du pull, traits du visage) sur une image adoucie.
    edges = gray.filter(ImageFilter.GaussianBlur(2)).filter(ImageFilter.FIND_EDGES)
    w, h = rgb.size

    cells, weights = [], []
    margin = 6  # le filtre de contours crée des artefacts sur les bords
    for y in range(margin, h - margin, STEP):
        for x in range(margin, w - margin, STEP):
            r, _, b = rgb.getpixel((x, y))
            lum = gray.getpixel((x, y)) / 255
            # La peau tire vers le rouge ; le fond et le pull sont neutres ou bleutés.
            skin = max(0.0, (r - b - 4) / 50)
            edge = min(1.0, edges.getpixel((x, y)) / 22)
            weight = 1.8 * skin * (0.35 + lum) + 3.0 * edge**1.3 + (0.015 if lum > 0.14 else 0)
            if weight <= 0:
                continue
            intensity = min(1.0, 0.5 + 0.6 * lum) if skin > 0.15 else (0.42 if edge > 0.3 else 0.16)
            cells.append((x, y, intensity))
            weights.append(weight)

    picks = random.choices(cells, weights=weights, k=COUNT)
    data = array("H")
    preview = Image.new("RGB", (w, h), (10, 11, 13))
    draw = ImageDraw.Draw(preview)
    for x, y, intensity in picks:
        jx = min(w - 1, max(0.0, x + random.uniform(-STEP / 2, STEP / 2)))
        jy = min(h - 1, max(0.0, y + random.uniform(-STEP / 2, STEP / 2)))
        data.extend([round(jx / w * 65535), round(jy / h * 65535), round(intensity * 65535)])
        c = int(60 + 195 * intensity)
        draw.point((jx, jy), fill=(int(c * 0.75), c, int(c * 0.82)))

    OUT.write_bytes(data.tobytes())
    preview.save(PREVIEW)
    print(f"{OUT.name} : {COUNT} points, {OUT.stat().st_size // 1024} Ko (ratio {w}x{h})")


if __name__ == "__main__":
    main()
