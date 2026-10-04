# Mi Alfabeto

Application web (installable en PWA) pour motiver un enfant à lire son livre de l'alphabet,
lettre par lettre, avec un badge à débloquer et 3 mini-jeux par lettre déjà validée.

**L'interface, les textes, la mascotte et la voix de l'application sont en espagnol** (l'enfant
utilise l'app entièrement en espagnol). Ce README reste en français, à destination du parent.

## Lancer l'application

Il faut un petit serveur local (le PWA / service worker ne fonctionne pas en ouvrant le fichier
directement avec `file://`). Depuis ce dossier :

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080` sur la tablette ou l'ordinateur.

Sur tablette (Chrome Android ou Safari iOS), on peut ensuite faire "Ajouter à l'écran d'accueil"
pour l'installer comme une vraie app.

## Ajouter les illustrations "animal transformé en lettre"

Déposer une image par lettre dans `assets/letters/`, nommée exactement comme la lettre en
majuscule, par exemple :

```
assets/letters/A.png
assets/letters/B.png
...
assets/letters/N.png
assets/letters/Ñ.png
assets/letters/Z.png
```

Formats acceptés : `.png` (recommandé, fond transparent si possible). Tant qu'une image n'est
pas ajoutée, l'application affiche un emoji animal à la place, donc rien ne bloque en attendant.

## Fonctionnement

- **Ordre des lettres** : alphabet espagnol, voyelles d'abord (A, E, I, O, U), puis les consonnes
  dans l'ordre alphabétique espagnol — le **Ñ** est inclus juste après le N (27 lettres au total).
  Modifiable dans `data.js` (`LETTER_ORDER`, `VOWELS`).
- **Voix** : la synthèse vocale (jeu des sons) utilise l'espagnol d'Espagne (`es-ES`). Le
  navigateur/l'appareil doit avoir une voix espagnole installée pour un rendu optimal ; sinon il
  utilisera la voix espagnole par défaut disponible.
- **Débloquer un badge** : sur l'écran d'une lettre en cours, bouton "¡He leído mi página!" →
  l'enfant repasse la lettre en pointillés au doigt/souris → badge débloqué automatiquement dès
  qu'il a repassé suffisamment le tracé (~70% du contour).
- **Mini-jeux**, disponibles uniquement pour les lettres déjà validées :
  1. **Dibujar la letra** : même exercice de tracé, en entraînement libre.
  2. **Escuchar el sonido** : la voix de l'appareil prononce le son de la lettre (associée à une
     voyelle pour les consonnes), l'enfant retrouve la bonne lettre parmi des lettres déjà
     validées.
  3. **Ordenar la palabra** : un mot espagnol (composé uniquement de lettres déjà validées) est
     proposé en lettres mélangées, à reconstituer dans l'ordre. Liste de mots modifiable dans
     `data.js` (`WORD_BANK`).
- La progression est sauvegardée dans le navigateur (`localStorage`), donc propre à chaque
  appareil/navigateur utilisé.

## Personnalisation rapide

- Changer l'ordre des lettres ou les animaux associés : `data.js` → `LETTER_ORDER`, `VOWELS`,
  `LETTER_ANIMALS`.
- Ajouter des mots au jeu 3 : `data.js` → `WORD_BANK` (mots espagnols en majuscules, sans accents,
  avec un emoji d'illustration).
- Couleurs et style : `style.css`.
- Textes de l'interface / de la mascotte : directement dans `app.js`.
