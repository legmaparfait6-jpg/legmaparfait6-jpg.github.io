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

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "profile" / "legma-parfait.webp"
OUT = ROOT / "public" / "profile" / "portrait-points.bin"
PREVIEW = ROOT / "scripts" / ".portrait-preview.png"

COUNT = int(sys.argv[1]) if len(sys.argv) > 1 else 6000
# Cadrage tête et épaules (pixels du portrait 612 x 765).
CROP = (70, 20, 540, 600)
STEP = 2  # échantillonnage d'un pixel sur deux
FLOOR = 38  # en dessous : noir pur, aucun point
GAMMA = 2.4  # > 1 : la lumière concentre fortement les points


def main() -> None:
    random.seed(20260927)
    img = Image.open(SOURCE).convert("L").crop(CROP)
    w, h = img.size
    cells, weights = [], []
    for y in range(0, h, STEP):
        for x in range(0, w, STEP):
            lum = img.getpixel((x, y))
            if lum <= FLOOR:
                continue
            cells.append((x, y, lum))
            weights.append((lum - FLOOR) ** GAMMA)

    picks = random.choices(cells, weights=weights, k=COUNT)
    data = array("H")
    preview = Image.new("RGB", (w, h), (10, 11, 13))
    draw = ImageDraw.Draw(preview)
    for x, y, lum in picks:
        jx = min(w - 1, max(0.0, x + random.uniform(-STEP / 2, STEP / 2)))
        jy = min(h - 1, max(0.0, y + random.uniform(-STEP / 2, STEP / 2)))
        intensity = min(1.0, (lum - FLOOR) / (220 - FLOOR))
        data.extend([round(jx / w * 65535), round(jy / h * 65535), round(intensity * 65535)])
        c = int(60 + 195 * intensity)
        draw.point((jx, jy), fill=(int(c * 0.75), c, int(c * 0.82)))

    OUT.write_bytes(data.tobytes())
    preview.save(PREVIEW)
    print(f"{OUT.name} : {COUNT} points, {OUT.stat().st_size // 1024} Ko (ratio {w}x{h})")


if __name__ == "__main__":
    main()
