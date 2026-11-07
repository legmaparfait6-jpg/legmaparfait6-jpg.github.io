"""La bande-son du film, entièrement synthétisée ici : aucun échantillon, aucune musique d'autrui."""
import subprocess
import sys
import wave

import numpy as np

SR = 44100
DUREE = 114.0
N = int(SR * DUREE)
rng = np.random.default_rng(7)
G, D = np.zeros(N), np.zeros(N)
F_EXE = sys.argv[1]


def ajoute(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[:N - i]
    g, d = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    G[i:i + len(sig)] += sig * gain * g * 1.41
    D[i:i + len(sig)] += sig * gain * d * 1.41


def tt(d):
    return np.arange(int(d * SR)) / SR


def bas(x, fc):
    """Filtre passe-bas d'ordre 2, fréquence fixe ou courbe."""
    fc = np.broadcast_to(fc, x.shape)
    a = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    p1 = p2 = 0.0
    for i in range(len(x)):
        p1 += a[i] * (x[i] - p1)
        p2 += a[i] * (p1 - p2)
        y[i] = p2
    return y


def scie(f, t):
    ph = np.cumsum(np.broadcast_to(f, t.shape)) / SR
    return 2 * (ph % 1) - 1


def enveloppe(t, att, rel, d):
    return np.clip(t / max(att, 1e-4), 0, 1) * np.clip((d - t) / max(rel, 1e-4), 0, 1)


def coeur(force=1.0):
    t = tt(.34)
    un = np.sin(2 * np.pi * (52 + 34 * np.exp(-t * 34)) * t) * np.exp(-t * 15)
    return un * force


def battement(tps, force=1.0):
    ajoute(coeur(force), tps, .9)
    ajoute(coeur(force * .72), tps + .21, .9)


def impact(tps, force=1.0, d=4.5):
    t = tt(d)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 110 * np.exp(-t * 7)) / SR) * np.exp(-t * 1.5)
    n = rng.standard_normal(len(t))
    choc = bas(n, 1500 * np.exp(-t * 7) + 90) * np.exp(-t * 4.5) * 2.2
    ajoute(sub * force + choc * force * .55, tps, .95)
    # queue large
    q = bas(rng.standard_normal(len(t)), 500) * np.exp(-t * 1.1) * .5
    ajoute(q * force, tps, .5, -.4)
    ajoute(bas(rng.standard_normal(len(t)), 500) * np.exp(-t * 1.1) * .5 * force, tps, .5, .4)


def braam(tps, base=41.2, d=3.6, force=1.0):
    t = tt(d)
    s = sum(scie(base * r * (1 + .004 * k), t) for k, r in enumerate((1, 1, 2, 1.5, 2.002, 3)))
    fc = 80 + 1900 * np.exp(-((t - .35) / .55) ** 2)
    y = bas(s / 4, fc) * enveloppe(t, .05, 1.3, d) * (1 + .22 * np.sin(2 * np.pi * 5.2 * t))
    y = np.tanh(y * 2.2)
    ajoute(y * force, tps, .62, -.25)
    ajoute(np.roll(y, 240) * force, tps, .62, .25)


def montee(tps, d, force=1.0, f0=120, f1=5200):
    t = tt(d)
    k = (t / d) ** 2.6
    n = bas(rng.standard_normal(len(t)), f0 + (f1 - f0) * k) * k * 2.4
    ton = np.sin(2 * np.pi * np.cumsum(70 + 620 * k ** 1.5) / SR) * k * .34
    ajoute((n + ton) * force, tps, .55, -.15)
    ajoute((bas(rng.standard_normal(len(t)), f0 + (f1 - f0) * k) * k * 2.4 + ton) * force, tps, .55, .15)


def souffle(tps, d=.7, force=1.0):
    t = tt(d)
    e = np.sin(np.pi * t / d) ** 2
    ajoute(bas(rng.standard_normal(len(t)), 300 + 5200 * e) * e * 2 * force, tps, .5, -.5 + rng.random())


def ping(tps, f=1760, force=1.0, pan=0.0):
    t = tt(.5)
    ajoute((np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 11) * force, tps, .13, pan)


def nappe(t0, t1, freqs, force=1.0, fc=620, att=1.6, rel=1.6):
    d = t1 - t0
    t = tt(d)
    for k, f in enumerate(freqs):
        s = scie(f * (1 + .0018 * np.sin(2 * np.pi * (.07 + k * .03) * t)), t) + scie(f * 1.004, t)
        y = bas(s, fc) * enveloppe(t, att, rel, d) / len(freqs) * force
        ajoute(y, t0, .5, -.7 + 1.4 * k / max(1, len(freqs) - 1))


def drone(t0, t1, f=41.2, force=1.0):
    d = t1 - t0
    t = tt(d)
    y = (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2 * t + .3)) * enveloppe(t, 1.2, 1.2, d) * (1 + .12 * np.sin(2 * np.pi * .23 * t))
    ajoute(y * force, t0, .5)


def tambour(tps, force=1.0):
    t = tt(.5)
    y = np.sin(2 * np.pi * np.cumsum(46 + 90 * np.exp(-t * 26)) / SR) * np.exp(-t * 8.5) + bas(rng.standard_normal(len(t)), 2200) * np.exp(-t * 42) * 1.6
    ajoute(y * force, tps, .72)


def corde(tps, f, force=1.0, d=.13):
    t = tt(d + .05)
    y = bas(scie(f, t) + scie(f * 1.006, t), 1400) * np.exp(-t * 12) * .55
    ajoute(y * force, tps, .42, rng.uniform(-.4, .4))


def ostinato(t0, t1, bpm0, bpm1, force0, force1, tamb=True, base=73.42):
    gamme = [1, 1, 1.189, 1, 1, 1.335, 1.189, 1]
    t = t0
    i = 0
    while t < t1:
        k = (t - t0) / (t1 - t0)
        bpm = bpm0 + (bpm1 - bpm0) * k
        pas = 60 / bpm / 2
        f = force0 + (force1 - force0) * k
        corde(t, base * gamme[i % 8], f * (1.25 if i % 4 == 0 else .8))
        corde(t, base * 2 * gamme[i % 8], f * .35)
        if tamb and i % 4 == 0:
            tambour(t, f * 1.2)
        if tamb and k > .45 and i % 8 == 6:
            tambour(t, f * .8)
        t += pas
        i += 1


def voix(t0, t1, f=147, force=1.0):
    """Une voix sans mots : un son qui ressemble à un chant, sans aucune syllabe."""
    d = t1 - t0
    t = tt(d)
    s = scie(f * (1 + .006 * np.sin(2 * np.pi * 5 * t)), t)
    y = bas(s, 900 + 500 * np.sin(2 * np.pi * .9 * t)) * enveloppe(t, .5, .8, d)
    ajoute(y * force, t0, .3, -.2)
    ajoute(bas(s, 2200) * enveloppe(t, .5, .8, d) * force * .25, t0, .3, .2)


def note_chaude(tps, f, force=1.0, d=3.2):
    t = tt(d)
    y = sum(np.sin(2 * np.pi * f * h * t) * a * np.exp(-t * (1.4 + h * .55)) for h, a in ((1, 1), (2, .42), (3, .16), (4, .07)))
    ajoute(y * force, tps, .62, rng.uniform(-.2, .2))


def fil_aigu(t0, t1, f=3136, force=1.0):
    d = t1 - t0
    t = tt(d)
    y = (np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 1.012 * t)) * enveloppe(t, .4, .4, d)
    ajoute(y * force, t0, .022)


# --- ouverture
drone(.4, 6.6, 36.7, .35)
note_chaude(1.0, 146.8, .6, 4.5)

# --- acte I : le réseau, puis la panne
drone(6.6, 20.6, 41.2, .55)
nappe(6.8, 20.6, [82.4, 87.3, 123.5], .5, 480, 3, .05)
for x in np.arange(7.5, 16.6, 2.6):
    ping(x, 1760, .75, rng.uniform(-.6, .6))
for x, g in ((7.3, .4), (8.4, .4), (9.6, .4)):
    ping(x, 2637, g, -.3)
ostinato(9.5, 16.6, 96, 120, .22, .62)
for x, f in ((11.2, .8), (12.2, 1.0), (13.2, 1.25)):
    ping(x, 440, f * 3)
impact(14, .85, 3.5)
for x in np.arange(14, 16.6, .45):
    ping(x, 587, 1.8, .3)
    ping(x + .22, 494, 1.5, -.3)
braam(15.7, 41.2, 2.6, .75)
montee(16.6, 4.0, 1.25)
for b in (17, 17.8, 18.5, 19.1, 19.6, 20, 20.3):
    battement(b, .8 + (b - 17) * .12)
# 20.6 à 21 : silence total

# --- l'œil s'ouvre
braam(21, 36.7, 4.4, 1.15)
impact(21, 1.05, 5)
nappe(21.2, 25.2, [440, 466.2, 659.3], .2, 2400, 1.5, .1)
# 25.2 : il vous voit. Un seul coup, puis presque rien.
impact(25.2, 1.2, 3.6)
fil_aigu(25.35, 28, 3136, 1.0)
drone(25.3, 28, 30.9, .5)
# --- le recul
souffle(27.75, 1.1, 1.0)
nappe(28.4, 31.3, [110, 164.8, 220], .55, 760, .8, .6)
impact(29, .45, 2.5)

# --- acte II : juger
drone(31, 41.2, 41.2, .6)
ostinato(31.2, 41.1, 112, 148, .32, 1.0)
for x in rng.uniform(32, 41, 90):
    ping(float(x), float(rng.choice((2093, 2349, 2637, 3136))), .3, float(rng.uniform(-.8, .8)))
montee(38.2, 3.0, 1.15)
braam(39.2, 49, 2.0, .8)
for b in (39.3, 39.8, 40.2, 40.55, 40.85, 41.05):
    battement(b, 1.05)
impact(41.2, 1.3, 4.5)
drone(41.4, 45.2, 32.7, .7)
nappe(43.2, 45.2, [196, 207.7], .32, 900, 1, .4)
souffle(44.9, .6, .6)
impact(45.4, .5, 2.2)
nappe(45.5, 47.8, [110, 164.8], .45, 700, .5, .3)
montee(47.1, .9, 1.1)

# --- acte III : tenir
impact(48, .7, 2.2)
nappe(48.1, 55.5, [73.4, 110, 146.8, 220], .72, 900, .8, .02)
drone(48.1, 55.5, 36.7, .7)
ostinato(49.3, 55.45, 118, 150, .3, 1.05)
for x in rng.uniform(50, 55.4, 40):
    ping(float(x), float(rng.choice((1318, 1568, 1976, 2349))), .28, float(rng.uniform(-.8, .8)))
# la coupure : tout tombe en un quart de seconde, puis rien
t_ = tt(.26)
ajoute(np.sin(2 * np.pi * np.cumsum(320 * np.exp(-t_ * 13) + 26) / SR) * np.exp(-t_ * 6), 55.5, .75)
# dans le noir : l'œil
for b in (56.6, 57.6):
    battement(b, .62)
drone(56.4, 58.35, 27.5, .42)
fil_aigu(56.9, 58.25, 2093, .8)
# une petite lumière
ping(58.6, 1318, 1.1)
ping(60, 1318, 1.0)
ping(61.4, 1318, .9)
drone(60, 63.98, 32.7, .3)
for b in (61, 61.9, 62.6, 63.1, 63.5, 63.8):
    battement(b, .78 + (b - 61) * .1)
montee(61.6, 2.38, 1.4)
# le réseau revient
impact(64, 1.5, 5)
braam(64, 36.7, 3.8, 1.3)
nappe(64.1, 68, [73.4, 110, 146.8, 220, 293.7], .85, 1500, .05, .8)
ostinato(64.05, 67.9, 150, 156, 1.05, 1.1)

# --- acte IV : parler, transmettre
drone(68, 78, 36.7, .42)
voix(68.6, 73, 146.8, .72)
voix(69.6, 73, 220, .4)
nappe(68.4, 78, [146.8, 220, 277.2], .24, 1100, 1.5, .8)
souffle(73.05, .55, .6)
for x in np.arange(73.3, 76.3, .06):
    ping(float(x), float(rng.choice((2349, 2637, 3136, 3520))), .32, float(rng.uniform(-.9, .9)))
impact(78.3, .5, 2.3)

# --- acte V : servir
montee(80.3, 3.9, 1.25, 100, 6200)
drone(80.3, 84.2, 41.2, .55)
ping(80.8, 880, 1.2)
# 84.2 : silence. Puis une seule personne.
note_chaude(85, 196, .85)
note_chaude(86.3, 293.7, .7)
note_chaude(87.7, 246.9, .72)
note_chaude(88.9, 196, .6, 2.4)

# --- la révélation
for b in (91, 92, 93, 94):
    battement(b, .68 + (b - 91) * .08)
nappe(90.2, 94.5, [146.8, 174.6, 220], .3, 700, 3, .05)
impact(94.6, .75, 4)
nappe(94.6, 105.9, [73.4, 146.8, 220, 293.7, 440], .62, 1500, 1.8, .03)
drone(94.6, 105.9, 36.7, .6)
impact(97.9, .9, 3.5)
voix(98, 105.8, 293.7, .34)
ostinato(100.2, 105.85, 90, 104, .16, .42, tamb=False)
# 105.95 : noir et silence.

# --- après la fin : ils s'ouvrent encore
impact(107.38, 1.3, 2.3)
t_ = tt(2.25)
aigre = sum(np.sin(2 * np.pi * f * (1 + .012 * np.sin(2 * np.pi * 7 * t_)) * t_) for f in (1244.5, 1318.5, 1864.7))
ajoute(aigre * enveloppe(t_, .05, .1, 2.25) * (.55 + .45 * t_ / 2.25), 107.4, .05)
drone(107.4, 109.7, 27.5, .9)

# --- la signature, en vidéo seulement
impact(110.25, .55, 3)
note_chaude(110.3, 146.8, .8)
note_chaude(110.3, 220, .5)

# silences absolus : aucune queue de son ne les traverse
for a, b in ((20.6, 21.0), (55.76, 56.4), (84.2, 85.0), (105.95, 107.38), (109.72, 110.2)):
    i, j = int(a * SR), int(b * SR)
    G[i:j] = 0
    D[i:j] = 0
    bord = int(.012 * SR)
    G[i - bord:i] *= np.linspace(1, 0, bord)
    D[i - bord:i] *= np.linspace(1, 0, bord)

m = max(np.abs(G).max(), np.abs(D).max())
print("crête brute", round(float(m), 2))
crete = 1.5
G, D = np.tanh(G / m * crete) / np.tanh(crete) * .93, np.tanh(D / m * crete) / np.tanh(crete) * .93


def niveau(a, b):
    i, j = int(a * SR), int(b * SR)
    x = np.concatenate((G[i:j], D[i:j]))
    r = np.sqrt(np.mean(x * x))
    return "muet" if r < 1e-6 else f"{20 * np.log10(r):.1f} dB"


for nom, a, b in (("ouverture", .5, 6), ("réseau", 7, 14), ("panne", 14, 20.5), ("silence", 20.62, 20.98), ("œil", 21, 25.1), ("il vous voit", 25.3, 27.7), ("juger", 34, 41), ("refus", 41.2, 44), ("FasoCommerce", 50, 55.4), ("noir", 55.8, 56.38), ("œil noir", 56.5, 58.3), ("retour", 64, 67.9), ("parler", 69, 72), ("servir", 80.5, 84), ("une personne", 85, 89), ("fin", 95, 105), ("après", 107.5, 109.6)):
    print(f"{nom:14} {niveau(a, b)}")
print("écrêtage", int(np.sum(np.abs(G) > .999) + np.sum(np.abs(D) > .999)))

arr = (np.stack((G, D), 1) * 32767).astype(np.int16)
with wave.open("film/bande.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(arr.tobytes())
subprocess.run([F_EXE, "-y", "-loglevel", "error", "-i", "film/bande.wav", "-t", "110.6", "-c:a", "libmp3lame", "-b:a", "192k", "film/bande.mp3"], check=True)
print("fini")
