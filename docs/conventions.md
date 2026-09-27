# Conventions du projet

Règles de développement du portfolio de Legma Parfait.

## Principes

- **Authenticité** : chaque information (mission, chiffre, date, technologie) provient du code ou des documents des projets. Ce qui n'est pas vérifiable est listé dans le champ `pending` des missions : affiché en développement uniquement, jamais publié.
- **Une seule source de données** : le portfolio et le CV lisent les mêmes fichiers de `content/`. Modifier une information se fait à un seul endroit.
- **Bilingue** : tout texte visible est un objet `{ fr, en }` passé par `t()` (`lib/i18n.ts`), qui applique aussi la typographie (apostrophes, espaces insécables).

## Stack

- Next.js 16 (App Router) en **export statique**, TypeScript strict, React 19.
- CSS natif avec variables (`app/globals.css`, `app/network.css`, `app/experience.css`), sans framework.
- three.js pour la scène 3D, chargée à la demande (`components/network/engine.ts`).
- Visage 3D : maillage préparé hors ligne (`scripts/make-portrait-rig.py`, MediaPipe dans `.venv`), particules tirées dans le navigateur sur la photo (`portrait-build.ts`).
- Voix : fichiers audio pré-enregistrés (`npm run voice`), jamais la synthèse vocale du navigateur. Après toute modification de `content/transmissions.ts`, relancer `npm run voice` et versionner `public/voice/`.
- Aucune bibliothèque d'animation : transitions et animations en CSS.

## Performance

- La scène 3D ne se charge qu'après le chargement complet de la page, jamais si l'utilisateur demande moins d'animations, en économie de données ou sans WebGL 2.
- Les titres principaux restent visibles dès le premier affichage (pas de fondu depuis l'opacité 0).
- Images en WebP, dimensions explicites, chargement différé hors écran.

## Accessibilité (WCAG 2.1 AA)

- Navigation complète au clavier, focus visible, lien d'évitement.
- `prefers-reduced-motion` respecté partout (CSS et 3D).
- Nom accessible des liens et boutons identique au texte visible.
- Contrastes vérifiés sur fond sombre (`--text-3` au minimum pour le texte).

## Contenu

| Fichier | Rôle |
|---|---|
| `content/profile.ts` | Identité, coordonnées, formation, adresse du site |
| `content/missions.ts` | Les missions (projets) et leurs douze rubriques |
| `content/skills.ts` | Carte des compétences et niveaux de preuve |
| `content/story.ts` | Textes des sections |
| `content/cv.ts` | Contenu propre au CV |

## Avant chaque envoi

1. `npx tsc --noEmit`
2. `npm run build`
3. Si le contenu du CV a changé : `npm run cv:pdf`, puis nouveau `npm run build`.
