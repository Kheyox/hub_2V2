# Hub 2V2

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

Le workflow GitHub Actions genere une APK de release quand un tag `v*` est pousse.
