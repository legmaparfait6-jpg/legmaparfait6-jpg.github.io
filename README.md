# Legma Parfait — Portfolio

Portfolio et CV de **Legma Parfait**, développeur Full-Stack & IA basé à Ouagadougou (Burkina Faso).

**Site :** https://legmaparfait6-jpg.github.io

> Je construis des systèmes, pas seulement des interfaces.

## L'expérience

Le site est pensé comme un système réseau vivant :

- **Réseau 3D** (three.js) dont chaque nœud est une vraie technologie ou une vraie mission ; il se réorganise selon la section lue (couches, grappes par mission, vue d'ensemble).
- **Visage 3D qui parle** : un maillage de 478 points extrait de la photo (MediaPipe) porte des dizaines de milliers de particules ; la mâchoire, les lèvres et les paupières bougent, la tête suit le pointeur.
- **Voix du système** : sept annonces en français et en anglais, voix d'homme robotique fabriquée par un vocodeur ; la bouche suit l'audio image par image, sous-titres synchronisés.
- **Incident simulé** : une panne rejouée selon les règles réelles de l'application de supervision développée en stage (3 échecs consécutifs, SLA critique de 180 minutes, escalade jusqu'au niveau 3).
- **Carte des compétences** reliée aux missions qui les utilisent.
- **Palette de commandes** (`Ctrl` + `K`) : `ping legma`, `open fasocommerce`, `get cv`…
- **CV** au format A4, lisible par les ATS, généré depuis les mêmes données que le site (français et anglais).

## Stack

Next.js 16 (export statique) · React 19 · TypeScript · CSS natif · three.js · GitHub Actions · GitHub Pages

## Qualité

Mesures Lighthouse (page d'accueil, site en ligne) : **accessibilité 100**, **bonnes pratiques 100**, **SEO 100** sur ordinateur et sur mobile.

- Le visage 3D tourne à 60 images par seconde sur une carte graphique intégrée (ordinateur et téléphone) : rendu HDR, shaders compilés en parallèle puis préchauffés image par image.
- La 3D ne se charge qu'après l'affichage du contenu et se désactive si l'utilisateur demande moins d'animations, en économie de données ou sans WebGL 2.
- Navigation complète au clavier, focus visible, `prefers-reduced-motion` respecté.

## Démarrer

```bash
npm install
npm run dev          # développement : http://localhost:3000/fr/
npm run build        # export statique dans out/
npm run preview      # sert out/ : http://localhost:4173
```

Autres scripts :

| Commande | Rôle |
|---|---|
| `npm run cv:pdf` | Génère les CV PDF (FR et EN) à partir de l'export |
| `npm run typecheck` | Vérification TypeScript |
| `python scripts/prepare-images.py` | Prépare les captures des projets (WebP) |
| `python scripts/make-og.py` | Génère l'image de partage `public/og.png` |
| `npm run voice` | Fabrique les annonces audio (`public/voice/`), Windows uniquement |
| `.venv/Scripts/python scripts/make-portrait-rig.py` | Maillage 3D du portrait (`public/profile/portrait-rig.json`) |

Les deux derniers scripts servent uniquement au développement ; leurs résultats sont versionnés. Prérequis détaillés en tête de chaque script.

## Structure

```
app/            pages (routes /fr et /en), styles
components/     sections, en-tête, palette, scène 3D
content/        toutes les données : profil, missions, compétences, textes, CV
lib/            langues et typographie, bus d'événements, sons, voix
scripts/        images, maillage du portrait, voix, CV PDF, serveur de prévisualisation
docs/           conventions du projet
```

Les règles de développement sont décrites dans [`docs/conventions.md`](docs/conventions.md).

## Déploiement

Chaque envoi sur `main` déclenche le workflow `.github/workflows/deploy.yml` : vérification des types, export statique, publication sur GitHub Pages.

## Licence

Code : libre de consultation. Contenus (textes, photo, captures des projets) : © Legma Parfait, tous droits réservés.
