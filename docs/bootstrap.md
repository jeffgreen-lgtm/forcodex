# Bootstrap

This foundation is aligned with the current Expo Router docs checked on July 1, 2026.

## Current state

The mobile workspace now contains an official Expo SDK 57 baseline merged into the CosmoScope scaffold.

The command that succeeded in this environment was effectively:

```bash
pnpm dlx create-expo-app@latest work/expo-baseline-2 --template default@sdk-57 --no-install
```

That baseline was then merged into `apps/mobile`, dependencies were installed, and the workspace was validated with `pnpm typecheck`.

Why this exact shape:

- Expo recommends `create-expo-app` for new Expo Router projects.
- The `default` template is designed for multi-screen apps and includes Expo Router plus TypeScript.
- The current docs note that `default@sdk-57` is the current forward-looking baseline during the SDK 57 transition.

## After baseline merge

1. Keep `@cosmoscope/core` as the shared source of truth for catalog, contracts, and brand copy.
2. Add the next native dependencies only when the corresponding feature is implemented:
   `expo-secure-store`, `expo-linear-gradient`, `expo-haptics`, `react-native-svg`.
3. Create `eas.json` after bundle IDs, environments, and release channels are frozen.
4. Swap Expo template art for real CosmoScope assets before screenshots or TestFlight work.

## Important note

The local environment needed a small `npm` shim because Expo's generator expected `npm` on the path while this runtime exposed `pnpm`. The official template did ultimately generate and merge successfully.
