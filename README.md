# Duelio

Hub de jeux tour par tour en 1v1 sur le meme telephone.

## Jeux inclus

- Morpion
- Puissance 4
- Pendu
- Yatzy

## Developpement

```bash
npm install
npm run dev
```

## APK Android

```bash
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

Le workflow GitHub Actions genere une APK installable quand un tag `v*` est pousse.

## Mises a jour

L'app verifie la derniere release GitHub au lancement. Pour que cette verification fonctionne sans embarquer de token dans l'APK, les releases du depot doivent etre lisibles publiquement, ou l'app doit pointer vers un manifeste de mise a jour public.
