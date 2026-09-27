"""Maillage 3D du portrait, pour le visage qui parle dans la scène du hero.

À partir de la photo (public/profile/legma-parfait.webp) :
  1. MediaPipe Face Landmarker : 478 points 3D du visage (nez, lèvres, paupières…).
  2. Triangulation de Delaunay limitée à l'ovale du visage.
  3. Déformations (morphs) calculées sur ces points :
       jaw    mâchoire qui s'ouvre (rotation autour de l'articulation),
       shape  lèvres étirées (valeur positive) ou arrondies (valeur négative),
       blink  paupières qui se ferment.
  4. MediaPipe Image Segmenter (multiclasse) : cheveux, peau, vêtements, fond.
     Chaque région reçoit une profondeur plausible (crâne en ellipsoïde, cou
     en cylindre, buste arrondi, brume du fond en retrait).

Sortie : public/profile/portrait-rig.json, lu par le navigateur, qui
échantillonne lui-même les particules sur la photo (leur nombre dépend
de l'appareil). Aperçus : scripts/.portrait-rig-*.png (non versionnés).

Prérequis (développement uniquement) :
  python -m venv .venv
  .venv/Scripts/python -m pip install mediapipe pillow
  modèles dans .cache/models/ : face_landmarker.task, selfie_multiclass.tflite
    https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
    https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
Usage : .venv/Scripts/python scripts/make-portrait-rig.py
"""
import base64
import json
import math
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "profile" / "legma-parfait.webp"
OUT = ROOT / "public" / "profile" / "portrait-rig.json"
MODELS = ROOT / ".cache" / "models"
PREVIEW = ROOT / "scripts"

# Cadrage tête et épaules (pixels du portrait 612 x 765), identique à la scène.
CROP = (70, 20, 540, 600)
GRID = 4  # résolution des cartes de profondeur et de régions (1 case = 4 px)

FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148,
             176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
LIPS_OUTER_UPPER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291]
LIPS_OUTER_LOWER = [146, 91, 181, 84, 17, 314, 405, 321, 375]
LIPS_INNER_UPPER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308]
LIPS_INNER_LOWER = [95, 88, 178, 87, 14, 317, 402, 318, 324]
# Couture des lèvres : paires lèvre supérieure / inférieure (intérieur).
SEAM = [(78, 78), (191, 95), (80, 88), (81, 178), (82, 87), (13, 14), (312, 317), (311, 402), (310, 318), (415, 324), (308, 308)]
# Paupières : bord supérieur et bord inférieur correspondant, puis pli au-dessus.
EYES = [
    ([246, 161, 160, 159, 158, 157, 173], [7, 163, 144, 145, 153, 154, 155], [247, 30, 29, 27, 28, 56, 190]),
    ([466, 388, 387, 386, 385, 384, 398], [249, 390, 373, 374, 380, 381, 382], [467, 260, 259, 257, 258, 286, 414]),
]

# Régions du segmenteur multiclasse.
BACKGROUND, HAIR, BODY_SKIN, FACE_SKIN, CLOTHES, OTHERS = range(6)
DEPTH_RANGE = (-0.7, 0.25)  # profondeur codée sur 8 bits (unités : largeur du cadrage)


def smoothstep(a: float, b: float, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def landmarks(image: np.ndarray) -> np.ndarray:
    options = vision.FaceLandmarkerOptions(
        base_options=mpt.BaseOptions(model_asset_path=str(MODELS / "face_landmarker.task")), num_faces=1)
    with vision.FaceLandmarker.create_from_options(options) as detector:
        result = detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=image))
    if not result.face_landmarks:
        raise SystemExit("Aucun visage détecté")
    h, w = image.shape[:2]
    x0, y0, x1, y1 = CROP
    cw = x1 - x0
    ch = y1 - y0
    pts = np.array([[p.x * w, p.y * h, p.z * w] for p in result.face_landmarks[0]])
    # Repère du cadrage : u, v de 0 à 1 ; profondeur d en largeur du cadrage, positive vers l'avant.
    return np.stack([(pts[:, 0] - x0) / cw, (pts[:, 1] - y0) / ch, -pts[:, 2] / cw], axis=1)


def segment(image: np.ndarray) -> np.ndarray:
    options = vision.ImageSegmenterOptions(
        base_options=mpt.BaseOptions(model_asset_path=str(MODELS / "selfie_multiclass.tflite")),
        output_category_mask=True, output_confidence_masks=False)
    with vision.ImageSegmenter.create_from_options(options) as segmenter:
        result = segmenter.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=image))
    return result.category_mask.numpy_view().squeeze().copy()


def triangulate(lm: np.ndarray, cw: int, ch: int) -> list[int]:
    subdiv = cv2.Subdiv2D((-cw, -ch, cw * 3, ch * 3))
    lookup = {}
    for i, (u, v, _) in enumerate(lm):
        p = (float(u * cw), float(v * ch))
        lookup[(round(p[0], 2), round(p[1], 2))] = i
        subdiv.insert(p)
    oval = np.array([[lm[i, 0] * cw, lm[i, 1] * ch] for i in FACE_OVAL], np.float32)
    triangles = []
    for t in subdiv.getTriangleList():
        ids = [lookup.get((round(float(t[k]), 2), round(float(t[k + 1]), 2))) for k in (0, 2, 4)]
        if None in ids:
            continue
        cx = (t[0] + t[2] + t[4]) / 3
        cy = (t[1] + t[3] + t[5]) / 3
        if cv2.pointPolygonTest(oval, (float(cx), float(cy)), False) >= 0:
            triangles.extend(ids)
    return triangles


def seam_v(lm: np.ndarray, u: np.ndarray) -> np.ndarray:
    """Hauteur de la couture des lèvres à l'abscisse u."""
    su = np.array([(lm[a, 0] + lm[b, 0]) / 2 for a, b in SEAM])
    sv = np.array([(lm[a, 1] + lm[b, 1]) / 2 for a, b in SEAM])
    order = np.argsort(su)
    return np.interp(u, su[order], sv[order])


def morphs(lm: np.ndarray) -> dict[str, np.ndarray]:
    n = len(lm)
    u, v, d = lm[:, 0], lm[:, 1], lm[:, 2]
    mouth_u = (lm[61, 0] + lm[291, 0]) / 2
    half_mouth = abs(lm[291, 0] - lm[61, 0]) / 2
    seam = seam_v(lm, u)

    # Mâchoire : rotation autour de l'articulation (niveau des pommettes, en retrait).
    hinge_v = (lm[234, 1] + lm[454, 1]) / 2
    hinge_d = (lm[234, 2] + lm[454, 2]) / 2 - 0.04
    theta = 0.2
    rel_v = v - hinge_v
    rel_d = d - hinge_d
    rot_v = rel_v * math.cos(theta) + rel_d * math.sin(theta)
    rot_d = rel_d * math.cos(theta) - rel_v * math.sin(theta)
    below = smoothstep(-0.002, 0.012, v - seam)
    # Au-delà de la bouche, la joue s'étire : le mouvement s'atténue vers les côtés.
    lateral = 1 - 0.55 * smoothstep(half_mouth * 1.1, half_mouth * 2.6, np.abs(u - mouth_u))
    w = below * lateral
    for i in (61, 291, 78, 308):
        w[i] = 0.45
    jaw = np.zeros((n, 3))
    jaw[:, 1] = (rot_v - rel_v) * w
    jaw[:, 2] = (rot_d - rel_d) * w
    # La lèvre supérieure se soulève à peine.
    opening = jaw[14, 1]
    for i in LIPS_OUTER_UPPER[1:-1] + LIPS_INNER_UPPER[1:-1]:
        jaw[i, 1] = -0.16 * opening

    # Lèvres étirées : commissures vers l'extérieur et vers l'arrière, lèvres amincies.
    lips = set(LIPS_OUTER_UPPER + LIPS_OUTER_LOWER + LIPS_INNER_UPPER + LIPS_INNER_LOWER)
    shape = np.zeros((n, 3))
    near = np.exp(-(((u - mouth_u) / (half_mouth * 1.8)) ** 2)) * np.exp(-(((v - seam) / 0.05) ** 2))
    for i in range(n):
        k = 1.0 if i in lips else float(near[i]) * 0.5
        if k < 0.02:
            continue
        side = (u[i] - mouth_u) / half_mouth
        shape[i, 0] = side * half_mouth * 0.16 * k
        shape[i, 1] = (seam[i] - v[i]) * 0.18 * k
        shape[i, 2] = -min(1.0, abs(side)) * 0.008 * k

    # Paupières : le bord supérieur rejoint le bord inférieur.
    blink = np.zeros((n, 3))
    for upper, lower, crease in EYES:
        for a, b, c in zip(upper, lower, crease):
            gap = lm[b] - lm[a]
            blink[a] = gap * 0.9
            blink[b] = -gap * 0.08
            blink[c] = gap * 0.38
    return {"jaw": jaw, "shape": shape, "blink": blink}


def depth_map(lm: np.ndarray, classes: np.ndarray, cw: int, ch: int) -> np.ndarray:
    gw, gh = cw // GRID, ch // GRID
    gu = (np.arange(gw) + 0.5) / gw
    gv = (np.arange(gh) + 0.5) / gh
    U, V = np.meshgrid(gu, gv)
    oval = lm[FACE_OVAL]
    cu = oval[:, 0].mean()
    cv = oval[:, 1].mean()
    ru = (oval[:, 0].max() - oval[:, 0].min()) / 2 * 1.12
    rv = (oval[:, 1].max() - oval[:, 1].min()) / 2 * 1.18
    rd = ru * 1.05
    d_edge = oval[:, 2].mean()
    head_c = d_edge - 0.4 * rd

    # Crâne, cheveux, oreilles : ellipsoïde légèrement remonté.
    r2 = ((U - cu) / ru) ** 2 + ((V - (cv - 0.02)) / rv) ** 2
    head = head_c + rd * np.sqrt(np.clip(1 - r2, 0, 1))
    # Cou : cylindre sous le menton.
    chin = lm[152]
    neck = head_c - 0.03 + 0.085 * np.sqrt(np.clip(1 - ((U - chin[0]) / 0.1) ** 2, 0, 1))
    # Buste : surface arrondie, épaules en retrait.
    body_cols = np.where((classes == CLOTHES).any(axis=0))[0]
    bu = (body_cols.mean() + 0.5) / gw if len(body_cols) else 0.5
    body = head_c - 0.14 + 0.2 * np.sqrt(np.clip(1 - ((U - bu) / 0.55) ** 2, 0, 1)) - 0.06 * smoothstep(0.6, 1.0, V)

    depth = np.full((gh, gw), head_c - 0.42)  # brume du fond, loin derrière
    head_zone = (classes == HAIR) | (classes == FACE_SKIN) | (classes == OTHERS) | ((classes == BODY_SKIN) & (V < chin[1]))
    depth = np.where(head_zone, np.where(r2 < 1, head, head_c), depth)
    depth = np.where((classes == BODY_SKIN) & (V >= chin[1]), neck, depth)
    depth = np.where(classes == CLOTHES, body, depth)
    # Transitions douces entre régions (pas de marches entre le cou et le col).
    subject = classes != BACKGROUND
    smooth = cv2.GaussianBlur(depth.astype(np.float32), (0, 0), 2.2)
    depth = np.where(subject, smooth, depth)
    return depth


def encode(values: np.ndarray, low: float, high: float) -> str:
    q = np.clip(np.round((values - low) / (high - low) * 255), 0, 255).astype(np.uint8)
    return base64.b64encode(q.tobytes()).decode()


def sparse(delta: np.ndarray) -> list[float]:
    out: list[float] = []
    for i, (dx, dy, dz) in enumerate(delta):
        if abs(dx) + abs(dy) + abs(dz) > 1e-5:
            out.extend([i, round(float(dx), 5), round(float(dy), 5), round(float(dz), 5)])
    return out


def preview(lm, triangles, rig_morphs, depth, classes, rgb):
    """Aperçus : maillage de face, profil de profondeur, bouche ouverte."""
    x0, y0, x1, y1 = CROP
    cw, ch = x1 - x0, y1 - y0
    scale = 1.6
    for name, pose in (("face", 0.0), ("mouth", 1.0)):
        img = Image.fromarray(rgb).resize((int(cw * scale), int(ch * scale)))
        draw = ImageDraw.Draw(img)
        p = lm + rig_morphs["jaw"] * pose
        for k in range(0, len(triangles), 3):
            a, b, c = triangles[k:k + 3]
            pts = [(p[i, 0] * cw * scale, p[i, 1] * ch * scale) for i in (a, b, c, a)]
            draw.line(pts, fill=(61, 220, 132), width=1)
        img.save(PREVIEW / f".portrait-rig-{name}.png")
    # Profil : profondeur (horizontal) le long de la hauteur.
    gh, gw = depth.shape
    side = Image.new("RGB", (400, gh * 3), (10, 11, 13))
    draw = ImageDraw.Draw(side)
    for y in range(gh):
        for x in range(0, gw, 2):
            if classes[y, x] == BACKGROUND:
                continue
            draw.point((200 + depth[y, x] * 500, y * 3), fill=(120, 140, 130))
    for u, v, d in lm:
        draw.point((200 + d * 500, v * gh * 3), fill=(61, 220, 132))
    side.save(PREVIEW / ".portrait-rig-side.png")


def main() -> None:
    rgb_full = np.asarray(Image.open(SOURCE).convert("RGB"))
    lm = landmarks(rgb_full)
    classes_full = segment(rgb_full)
    x0, y0, x1, y1 = CROP
    cw, ch = x1 - x0, y1 - y0
    crop_classes = classes_full[y0:y1, x0:x1]
    gw, gh = cw // GRID, ch // GRID
    classes = cv2.resize(crop_classes.astype(np.uint8), (gw, gh), interpolation=cv2.INTER_NEAREST)

    triangles = triangulate(lm, cw, ch)
    rig_morphs = morphs(lm)
    depth = depth_map(lm, classes, cw, ch)

    rig = {
        "source": "/profile/legma-parfait.webp",
        "crop": [x0, y0, cw, ch],
        "grid": [gw, gh],
        "depthRange": list(DEPTH_RANGE),
        "landmarks": [round(float(x), 5) for x in lm.flatten()],
        "triangles": triangles,
        "morphs": {name: sparse(delta) for name, delta in rig_morphs.items()},
        "mouth": [round(float(lm[13, 0] + lm[14, 0]) / 2, 5), round(float(lm[13, 1] + lm[14, 1]) / 2, 5)],
        "pivot": [round(float(lm[152, 0]), 5), round(float(lm[152, 1]) + 0.04, 5), round(float(lm[FACE_OVAL, 2].mean()) - 0.08, 5)],
        "depth": encode(depth, *DEPTH_RANGE),
        "classes": base64.b64encode(classes.astype(np.uint8).tobytes()).decode(),
    }
    OUT.write_text(json.dumps(rig, separators=(",", ":")))
    preview(lm, triangles, rig_morphs, depth, classes, rgb_full[y0:y1, x0:x1])
    counts = np.bincount(classes.flatten(), minlength=6)
    print(f"{OUT.name} : {len(lm)} points, {len(triangles) // 3} triangles, régions {counts.tolist()}, "
          f"{OUT.stat().st_size // 1024} Ko")


if __name__ == "__main__":
    main()
