# Duelio

Hub de jeux tour par tour en 1v1 sur le meme telephone, genere en APK Android via Capacitor.

## Jeux inclus

- Morpion
- Puissance 4
- Pendu
- Yatzy
- Reversi
- Allumettes
- Mastermind
- Bataille navale
- Dames
- Dominos
- Awale
- Quarto
- Memory

## Developpement

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Release Android

Les APK release sont signes par GitHub Actions avec des secrets, pas avec une cle stockee dans le repo.

Secrets requis dans `Settings > Secrets and variables > Actions` :

- `ANDROID_KEYSTORE_BASE64` : contenu du keystore encode en base64.
- `ANDROID_KEYSTORE_PASSWORD` : mot de passe du keystore.
- `ANDROID_KEY_ALIAS` : alias de la cle.
- `ANDROID_KEY_PASSWORD` : mot de passe de la cle.

Le workflow GitHub Actions lance les tests, construit l'app, signe `Duelio.apk`, l'attache a la release taguee, puis publie `update-manifest.json` via GitHub Pages pour que l'app puisse verifier les mises a jour sans lire l'API d'un depot prive.
