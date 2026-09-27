"""Prépare les captures de FasoCommerce pour le portfolio.

Source : captures produites par les tests end-to-end Playwright du dépôt
FasoCommerce (données de démonstration). Chaque capture est recadrée sur la
zone utile, réduite à 540 px de large (2x pour un affichage à 270 px) et
convertie en WebP.

Usage : python scripts/prepare-images.py [dossier_source]
"""
import sys
from pathlib import Path

from PIL import Image

SOURCE = Path(
    sys.argv[1]
    if len(sys.argv) > 1
    else r"C:\Users\HP\Downloads\FasoCommerce\repo_clone\frontend\e2e\captures"
)
DEST = Path(__file__).resolve().parent.parent / "public" / "missions" / "fasocommerce"
WIDTH = 540

# nom de sortie -> (fichier source, (haut, bas) du recadrage en px source ; None = pleine hauteur)
CAPTURES = {
    "boutique": ("P-rayon-boissons.png", (0, 2100)),
    "caisse": ("G-vente-encaissee.png", (0, 1920)),
    "hors-ligne": ("H-vente-hors-ligne.png", (0, 1920)),
    "ticket": ("I-ticket-thermique.png", (1030, 2378)),
    "cuisine": ("V2-cuisine.png", (0, 1920)),
    "devis-garage": ("V2-garage-devis.png", (330, 2202)),
}


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for name, (filename, (top, bottom)) in CAPTURES.items():
        src = SOURCE / filename
        if not src.exists():
            raise SystemExit(f"Capture introuvable : {src}")
        with Image.open(src) as img:
            img = img.convert("RGB")
            cropped = img.crop((0, top, img.width, min(bottom, img.height)))
            ratio = WIDTH / cropped.width
            resized = cropped.resize((WIDTH, round(cropped.height * ratio)), Image.LANCZOS)
            out = DEST / f"{name}.webp"
            resized.save(out, "WEBP", quality=82, method=6)
            print(f"{out.name:20} {resized.width}x{resized.height}  {out.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
