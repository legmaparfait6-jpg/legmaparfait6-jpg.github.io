"""Prépare le portrait du portfolio : public/profile/legma-parfait.webp.

Retire la bande noire du haut, cadre de la tête à la taille (format 4:5)
et convertit en WebP.
Usage : python scripts/prepare-portrait.py <photo source>
"""
import sys
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public" / "profile" / "legma-parfait.webp"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage : python scripts/prepare-portrait.py <photo source>")
    with Image.open(sys.argv[1]) as img:
        img = img.convert("RGB")
        gray = img.convert("L")
        w, h = img.size
        # Première ligne réellement éclairée (sous la bande noire).
        top = next(y for y in range(h) if sum(gray.getpixel((x, y)) for x in range(0, w, 8)) / (w / 8) > 12)
        height = round(w * 5 / 4)
        crop = img.crop((0, top + 20, w, min(h, top + 20 + height)))
        OUT.parent.mkdir(parents=True, exist_ok=True)
        crop.save(OUT, "WEBP", quality=86, method=6)
        print(f"{OUT.name} : {crop.width}x{crop.height}, {OUT.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
