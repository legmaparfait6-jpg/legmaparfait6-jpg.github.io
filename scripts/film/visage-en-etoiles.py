"""Le visage du film : la photo studio, affinée par les traits de la vidéo, traduite en étoiles séparées, découpée en parties."""
import base64
import json
import os
import sys

import cv2
import numpy as np

K = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0
RACINE = "C:/Users/HP/Projects/legma-portfolio/public/profile/"
ICI = os.getcwd().replace("\\", "/") + "/"
SORTIE = ICI + "film/"
os.makedirs(SORTIE, exist_ok=True)
PHOTO = "C:/Users/HP/Downloads/WhatsApp Image 2026-09-27 at 02.22.30.jpeg"
VIDEO = "C:/Users/HP/Downloads/photo/VID-20261106-WA0000.mp4"

d = json.load(open(RACINE + "portrait-rig.json"))
cx, cy, cw, ch = d["crop"]
gw, gh = d["grid"]
classes = np.frombuffer(base64.b64decode(d["classes"]), np.uint8).reshape(gh, gw)
LMP = np.array(d["landmarks"], np.float64).reshape(-1, 3)
TR = np.array(d["triangles"], np.int32).reshape(-1, 3)

# --- la photo, calée sur le maillage
ref = cv2.imdecode(np.fromfile(RACINE + "legma-parfait.webp", np.uint8), cv2.IMREAD_GRAYSCALE)
ph = cv2.imdecode(np.fromfile(PHOTO, np.uint8), cv2.IMREAD_GRAYSCALE)
res = cv2.matchTemplate(ph, ref[60:340, 140:360], cv2.TM_CCOEFF_NORMED)
_, score, _, (mx0, my0) = cv2.minMaxLoc(res)
dx, dy = mx0 - 140, my0 - 60
print("calage", dx, dy, round(score, 3))
crop = ph[cy + dy:cy + dy + ch, cx + dx:cx + dx + cw]
net = cv2.fastNlMeansDenoising(crop, None, h=6, templateWindowSize=5, searchWindowSize=15)
W, H = int(cw * K), int(ch * K)
grand = cv2.resize(net, (W, H), interpolation=cv2.INTER_LANCZOS4).astype(np.float32) / 255
canon = LMP[:, :2] * [cw * K, ch * K]

# --- les images de la vidéo les plus proches de l'angle de la photo
z = np.load(ICI + "video-pose.npz")
LMV, NET, BOUCHE, YEUX = z["LM"], z["NET"], z["BOUCHE"], z["YEUX"]
vW, vH = int(z["W"]), int(z["H"])
if LMV[..., :2].max() < 2:
    LMV = LMV * [vW, vH, vW]
STABLE = [33, 133, 362, 263, 1, 2, 4, 5, 6, 168, 197, 195, 61, 291, 0, 17, 152, 10, 234, 454, 127, 356, 58, 288, 172, 397, 150, 379, 13, 14, 159, 145, 386, 374, 70, 300, 105, 334, 107, 336, 50, 280, 205, 425, 40, 270, 91, 321]
residu = np.full(len(LMV), 1e9)
for i in range(len(LMV)):
    if NET[i] <= 0 or not np.isfinite(LMV[i]).all():
        continue
    a, _ = cv2.estimateAffinePartial2D(LMV[i, STABLE, :2].astype(np.float32), canon[STABLE].astype(np.float32), method=cv2.LMEDS)
    if a is None:
        continue
    q = LMV[i, STABLE, :2] @ a[:, :2].T + a[:, 2]
    residu[i] = np.sqrt(((q - canon[STABLE]) ** 2).sum(1)).mean() / K
seuil_net = np.percentile(NET[NET > 0], 45)
bon = np.where((NET > seuil_net) & (BOUCHE < np.percentile(BOUCHE, 55)) & (YEUX > np.percentile(YEUX, 45)))[0]
choisis = bon[np.argsort(residu[bon])[:14]]
print("images", sorted(choisis.tolist()), "résidu", round(float(residu[choisis].mean()), 2), "px")


def base_tps(points, lam):
    n = len(points)
    r2 = ((points[:, None] - points[None]) ** 2).sum(2)
    Ka = np.where(r2 > 0, r2 * np.log(r2 + 1e-9), 0) + np.eye(n) * lam
    P = np.hstack([np.ones((n, 1)), points])
    A = np.zeros((n + 3, n + 3))
    A[:n, :n], A[:n, n:], A[n:, :n] = Ka, P, P.T
    return A


def tps_carte(cible, source, W_, H_, lam=1200.0, pas=8):
    n = len(cible)
    moy = cible.mean(0)
    ech = 1 / cible.std()
    c = (cible - moy) * ech
    b = np.zeros((n + 3, 2))
    b[:n] = source
    sol = np.linalg.solve(base_tps(c, lam * ech * ech), b)
    gx, gy = np.meshgrid(np.arange(0, W_ + pas, pas), np.arange(0, H_ + pas, pas))
    g = (np.stack((gx.ravel(), gy.ravel()), 1) - moy) * ech
    r2 = ((g[:, None] - c[None]) ** 2).sum(2)
    U = np.where(r2 > 0, r2 * np.log(r2 + 1e-9), 0)
    s = U @ sol[:n] + sol[n, None] + g @ sol[n + 1:]
    mx = s[:, 0].reshape(gx.shape).astype(np.float32)
    my = s[:, 1].reshape(gx.shape).astype(np.float32)
    xx, yy = np.meshgrid(np.arange(W_, dtype=np.float32) / pas, np.arange(H_, dtype=np.float32) / pas)
    return cv2.remap(mx, xx, yy, cv2.INTER_LINEAR), cv2.remap(my, xx, yy, cv2.INTER_LINEAR)


TRAITS = sorted(set(STABLE + [7, 163, 144, 153, 154, 155, 246, 161, 160, 158, 157, 173, 249, 390, 373, 380, 381, 382, 466, 388, 387, 385, 384, 398, 78, 308, 82, 312, 87, 317, 148, 377, 176, 400, 149, 378, 136, 365, 164, 94, 98, 327, 200, 199, 175]))
cap = cv2.VideoCapture(VIDEO)
pile = []
for i in sorted(choisis.tolist()):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ok, im = cap.read()
    if not ok:
        continue
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    mx_, my_ = tps_carte(canon[TRAITS], LMV[i][TRAITS, :2], W, H)
    pile.append(cv2.remap(g, mx_, my_, cv2.INTER_CUBIC).astype(np.float32) / 255)
cap.release()
stack = np.median(np.stack(pile), 0).astype(np.float32)

# --- masque du visage : les traits de la vidéo ne touchent que le visage, jamais les cheveux
OVALE = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
ov = np.zeros((H, W), np.uint8)
cv2.fillPoly(ov, [canon[OVALE].astype(np.int32)], 1)
ov = cv2.GaussianBlur(ov.astype(np.float32), (0, 0), 7 * K)
ov = np.clip((ov - .35) / .5, 0, 1)
barbe = np.zeros((H, W), np.uint8)
cv2.fillPoly(barbe, [canon[[61, 164, 291, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172]].astype(np.int32)], 1)
barbe = cv2.GaussianBlur(barbe.astype(np.float32), (0, 0), 5 * K)
oeils = np.zeros((H, W), np.float32)
for idx in ([33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246], [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466]):
    t = np.zeros((H, W), np.uint8)
    cv2.fillPoly(t, [canon[idx].astype(np.int32)], 1)
    oeils = np.maximum(oeils, cv2.GaussianBlur(cv2.dilate(t, np.ones((int(9 * K), int(9 * K)), np.uint8)).astype(np.float32), (0, 0), 3 * K))
poids = np.clip(ov * .55 + barbe * .45 * ov + oeils * .25 * ov, 0, .95)

sig = 2.6 * K
basP = cv2.GaussianBlur(grand, (0, 0), sig)
hautP = grand - basP
hautV = stack - cv2.GaussianBlur(stack, (0, 0), sig)
gain = float(np.median(np.abs(hautP[ov > .7])) / max(np.median(np.abs(hautV[ov > .7])), 1e-4))
gain = float(np.clip(gain, .9, 1.7))
print("gain", round(gain, 2))
ameliore = basP + hautP * (1 - poids) + hautV * gain * poids
ameliore = np.clip(ameliore, 0, 1).astype(np.float32)

# planche avant / après, à juger à l'œil
x0, x1, y0, y1 = int(canon[:, 0].min()) - 30, int(canon[:, 0].max()) + 30, int(canon[:, 1].min()) - 10, int(canon[:, 1].max()) + 40
pl = np.hstack([grand[y0:y1, x0:x1], stack[y0:y1, x0:x1], ameliore[y0:y1, x0:x1]])
cv2.imencode(".jpg", (pl * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])[1].tofile(ICI + "avant-apres.jpg")

# --- ton, relief
clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(3, 3))
ton = clahe.apply((ameliore * 255).astype(np.uint8)).astype(np.float32) / 255
ton = np.clip(ton + (ton - cv2.GaussianBlur(ton, (0, 0), 3.5 * K)) * .6, 0, 1)
masque = cv2.GaussianBlur(cv2.resize((classes > 0).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC), (0, 0), 3.4 * K)
sujet = (masque > .5).astype(np.float32)
mx_, my_, mz_ = LMP[:, 0] * cw * K, LMP[:, 1] * ch * K, LMP[:, 2] * cw / 90.0
zmesh = np.full((H, W), np.nan)
for a, b, c in TR:
    xa, xb, xc_, ya, yb, yc_ = mx_[a], mx_[b], mx_[c], my_[a], my_[b], my_[c]
    x0_, x1_ = int(max(0, min(xa, xb, xc_))), int(min(W - 1, max(xa, xb, xc_)) + 1)
    y0_, y1_ = int(max(0, min(ya, yb, yc_))), int(min(H - 1, max(ya, yb, yc_)) + 1)
    den = (yb - yc_) * (xa - xc_) + (xc_ - xb) * (ya - yc_)
    if x1_ <= x0_ or y1_ <= y0_ or abs(den) < 1e-6:
        continue
    gx_, gy_ = np.meshgrid(np.arange(x0_, x1_), np.arange(y0_, y1_))
    l1 = ((yb - yc_) * (gx_ - xc_) + (xc_ - xb) * (gy_ - yc_)) / den
    l2 = ((yc_ - ya) * (gx_ - xc_) + (xa - xc_) * (gy_ - yc_)) / den
    l3 = 1 - l1 - l2
    dd = (l1 >= -.01) & (l2 >= -.01) & (l3 >= -.01)
    zt = l1 * mz_[a] + l2 * mz_[b] + l3 * mz_[c]
    ci = zmesh[y0_:y1_, x0_:x1_]
    plus = dd & (np.isnan(ci) | (zt > ci))
    ci[plus] = zt[plus]
surM = (~np.isnan(zmesh)).astype(np.float32)
zfill = np.nan_to_num(zmesh).astype(np.float32)
connu = surM.copy()
for sg in (2, 4, 8, 16, 32, 64):
    n_ = cv2.GaussianBlur(zfill * connu, (0, 0), sg * K)
    d_ = cv2.GaussianBlur(connu, (0, 0), sg * K)
    fi = d_ > .02
    zfill = np.where((connu < .5) & fi, n_ / np.maximum(d_, 1e-4), zfill).astype(np.float32)
    connu = np.where(fi, 1.0, connu).astype(np.float32)
loin = cv2.distanceTransform((1 - surM).astype(np.uint8), cv2.DIST_L2, 5) / K
zt = zfill - np.minimum(np.power(loin / 75.0, 2) * .55, 1.05)
zt = cv2.GaussianBlur(zt.astype(np.float32), (0, 0), 2 * K)
gxz = cv2.GaussianBlur(cv2.Sobel(zt, cv2.CV_32F, 1, 0, ksize=5) / 48 * (90 * K), (0, 0), 2.4 * K)
gyz = cv2.GaussianBlur(cv2.Sobel(zt, cv2.CV_32F, 0, 1, ksize=5) / 48 * (90 * K), (0, 0), 2.4 * K)
nl = np.sqrt(gxz * gxz + gyz * gyz + 1)
nX, nY = -gxz / nl, gyz / nl

# --- densité : jamais pleine, pour que chaque point reste une étoile et qu'on voie à travers
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
xc, yc = xs / K, ys / K
tete = cv2.GaussianBlur(((xc > 40) & (xc < 330) & (yc < 345)).astype(np.float32), (0, 0), 5 * K)
contour = cv2.GaussianBlur(sujet, (0, 0), 2.2 * K)
lisere = np.clip(1 - np.abs(contour - .5) * 3.6, 0, 1) * sujet
fondu = np.clip(1 - (yc - 330) / 240, 0, 1) ** 1.3
cheveux = cv2.GaussianBlur(cv2.resize((classes == 1).astype(np.float32), (W, H)), (0, 0), 1.5 * K)
rng = np.random.default_rng(5)
grain = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), 1.1 * K)
grain = (grain - grain.min()) / (grain.max() - grain.min())
dt = np.clip(np.power(ton, 1.5) * .98, 0, 1) + .006 + cheveux * (.03 + grain * .08) + lisere * .05
dc = (np.power(ton, 1.1) * .16 + lisere * .42) * fondu
densite = np.clip((dt * tete + dc * (1 - tete)) * sujet, 0, .62)

err = densite.astype(np.float64).copy()
seuil = .5 + rng.uniform(-.12, .12, err.shape)
pts = []
for y in range(H):
    g = y % 2 == 0
    sens = 1 if g else -1
    li, su, se = err[y], err[y + 1] if y + 1 < H else None, seuil[y]
    for x in (range(W) if g else range(W - 1, -1, -1)):
        v = li[x]
        e = v
        if v > se[x]:
            pts.append((x, y))
            e = v - 1
        if 0 <= x + sens < W:
            li[x + sens] += e * 7 / 16
        if su is not None:
            if 0 <= x - sens < W:
                su[x - sens] += e * 3 / 16
            su[x] += e * 5 / 16
            if 0 <= x + sens < W:
                su[x + sens] += e * 1 / 16
F = 3
Wf, Hf = W * F, H * F
dens_f = np.clip(cv2.resize(densite, (Wf, Hf)), 0, 1).astype(np.float64)
P = np.array(pts, np.float64) * F + F / 2
gy, gx = np.mgrid[0:Hf, 0:Wf]
for it in range(4):
    src = np.ones((Hf, Wf), np.uint8)
    src[np.clip(P[:, 1].astype(int), 0, Hf - 1), np.clip(P[:, 0].astype(int), 0, Wf - 1)] = 0
    _, lab = cv2.distanceTransformWithLabels(src, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    lab = lab.ravel()
    n = lab.max() + 1
    m = np.bincount(lab, dens_f.ravel(), n)
    a_ = np.bincount(lab, (dens_f * gx).ravel(), n)
    b_ = np.bincount(lab, (dens_f * gy).ravel(), n)
    ok = m > 1e-6
    P = np.stack((a_[ok] / m[ok], b_[ok] / m[ok]), 1)
P = P[np.random.default_rng(3).permutation(len(P))]
print(len(P), "points")

# --- les parties du visage : chaque projet en révèle une
ECH, OX, OY = 90.0, 165.0, 170.0
ix = (P[:, 0] / F).astype(int).clip(0, W - 1)
iy = (P[:, 1] / F).astype(int).clip(0, H - 1)
px, py = P[:, 0] / F / K, P[:, 1] / F / K
lp = LMP[:, :2] * [cw, ch]
cE = [lp[468], lp[473]]
larg = [np.linalg.norm(lp[33] - lp[133]), np.linalg.norm(lp[263] - lp[362])]
principal = int(np.argmax(larg))
print("œil principal", principal, "largeurs", np.round(larg, 1))
pente = (cE[1][1] - cE[0][1]) / (cE[1][0] - cE[0][0])
ligne = cE[0][1] + (px - cE[0][0]) * pente


def ellipse(c, rx, ry):
    return ((px - c[0]) / rx) ** 2 + ((py - c[1]) / ry) ** 2 < 1


partie = np.full(len(P), 2, np.uint8)  # front et cheveux
partie[py > ligne + 2] = 3  # bas du visage, nez, joues, oreilles
nezb = lp[2][1]
poly = lp[[61, 164, 291, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172]].astype(np.float32)
for i in range(len(P)):
    if py[i] > nezb - 2 and cv2.pointPolygonTest(poly, (float(px[i]), float(py[i])), True) > -9:
        partie[i] = 4
partie[(py > lp[152][1] + 10) | (tete[iy, ix] < .35)] = 5
for k in (0, 1):
    c = cE[k]
    partie[ellipse(c, larg[k] * 1.05, larg[k] * .78)] = 0 if k == principal else 1

bb = ton[iy, ix]
zz = zt[iy, ix]
rec = np.zeros(len(P), dtype=[("x", "<f4"), ("y", "<f4"), ("z", "<f4"), ("b", "u1"), ("p", "u1"), ("nx", "u1"), ("ny", "u1")])
rec["x"], rec["y"], rec["z"] = (px - OX) / ECH, -(py - OY) / ECH, zz
rec["b"], rec["p"] = np.clip(bb * 255, 0, 255), partie
rec["nx"], rec["ny"] = np.clip((nX[iy, ix] * .5 + .5) * 255, 0, 255), np.clip((nY[iy, ix] * .5 + .5) * 255, 0, 255)
rec.tofile(SORTIE + "visage.bin")
print("parties", np.bincount(partie, minlength=6).tolist())


def loc(i):
    return [round(float((lp[i][0] - OX) / ECH), 4), round(float(-(lp[i][1] - OY) / ECH), 4), round(float(LMP[i][2] * cw / ECH), 4)]


CONT = [([33, 246, 161, 160, 159, 158, 157, 173, 133], [33, 7, 163, 144, 145, 153, 154, 155, 133], 468, [469, 470, 471, 472]),
        ([263, 466, 388, 387, 386, 385, 384, 398, 362], [263, 249, 390, 373, 374, 380, 381, 382, 362], 473, [474, 475, 476, 477])]
yeux = []
for up, lo, ci, rim in CONT:
    yeux.append({"c": loc(ci), "haut": [loc(i) for i in up], "bas": [loc(i) for i in lo],
                 "r": round(float(np.mean([np.linalg.norm(lp[i] - lp[ci]) for i in rim]) / ECH), 4)})
yeux = [yeux[principal], yeux[1 - principal]]

aretes = set()
for a, b, c in TR:
    for u, v in ((a, b), (b, c), (c, a)):
        aretes.add((min(int(u), int(v)), max(int(u), int(v))))
# chaque arête connaît sa partie, pour que la maille apparaisse avec le visage
pl_ = (LMP[:, 0] * cw, LMP[:, 1] * ch)
yl = cE[0][1] + (pl_[0] - cE[0][0]) * pente
plm = np.where(pl_[1] > yl + 2, 3, 2)
for i in range(468):
    if pl_[1][i] > nezb - 2 and cv2.pointPolygonTest(poly, (float(pl_[0][i]), float(pl_[1][i])), True) > -6:
        plm[i] = 4
for k in (0, 1):
    pr = ((pl_[0] - cE[k][0]) / (larg[k] * 1.05)) ** 2 + ((pl_[1] - cE[k][1]) / (larg[k] * .78)) ** 2 < 1
    plm[pr] = 0 if k == principal else 1

qr = None
try:
    enc = cv2.QRCodeEncoder_create()
    q = enc.encode("https://fasodigit.com")
    qr = ["".join("1" if v < 128 else "0" for v in ligne_) for ligne_ in q]
except Exception as e:
    print("qr", e)

meta = {
    "n": int(len(P)), "ech": ECH, "yeux": yeux, "bouche": loc(13), "nez": loc(1), "menton": float((OY - lp[152][1]) / ECH),
    "haut": float(rec["y"].max()), "bas": float(rec["y"].min()), "front": loc(10),
    "maille": [round(float(v), 3) for i in range(468) for v in loc(i)], "partM": plm[:468].tolist(), "aretes": [v for a in sorted(aretes) if a[0] < 468 and a[1] < 468 for v in a],
    "qr": qr,
}
json.dump(meta, open(SORTIE + "visage.json", "w"), separators=(",", ":"))
print("fini", os.path.getsize(SORTIE + "visage.bin"), os.path.getsize(SORTIE + "visage.json"), "qr", None if qr is None else len(qr))
