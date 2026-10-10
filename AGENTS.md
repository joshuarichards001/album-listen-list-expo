This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

It is the native version of the Album Listen List web app (`~/dev/album-listen-list`, React + Supabase). Both apps share one Supabase project, and users sign in with Spotify. Check the web app when porting a feature.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo start --tunnel     # start the dev server for testing Spotify sign in on a device (see Auth)
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Auth & State

- **Supabase client**: `src/lib/supabase.ts`. Sessions are stored with `expo-sqlite/localStorage`, and auto refresh is tied to `AppState`. Env vars are `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. They are inlined at bundle time, so restart with `npx expo start --clear` after changing them.
- **Spotify sign in**: `src/lib/auth.ts`. It uses `signInWithOAuth({ skipBrowserRedirect: true })`, then `WebBrowser.openAuthSessionAsync`, then `setSession` with the tokens from the redirect URL fragment (implicit flow). Don't switch to PKCE: Hermes has no `crypto.subtle`, so supabase-js falls back to the `plain` challenge and warns.
- **Spotify tokens**: Supabase only returns `provider_token` and `provider_refresh_token` once, in the sign in redirect, and drops them on session refresh. Read them from the redirect URL and keep them in the store; never expect them on `session`.
- **Store**: Zustand, in `src/stores/`, with one slice per domain combined in `root-store.ts`. `user-slice.ts` mirrors the Supabase session through `useSupabaseAuthListener` (`onAuthStateChange`, which also fires `INITIAL_SESSION` on start). `persist` is applied once in `root-store.ts`. Each slice exports a `partialize<Name>Slice` function that picks the fields to save, and the root `partialize` spreads them together. Don't persist `session`, since supabase-js persists it.
- **Route protection**: `src/app/_layout.tsx` uses `Stack.Protected` guards on `session`. Signing in or out swaps screens automatically, so don't navigate manually after auth changes. The splash screen stays up until `isAuthLoaded`.
- **Redirect URLs**: Supabase never redirects to IP-address hosts, even allow-listed ones, and falls back to the Site URL (`localhost`). Expo Go on LAN uses `exp://<LAN IP>:8081`, so sign in only works in Expo Go with `--tunnel` (`*.exp.direct` hostname). Development builds use `albumlistenlistexpo://`. Allowed redirect URLs: `exp://**` and `albumlistenlistexpo://**` (a single `*` doesn't match `.` or `/`).

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Keep code comments to an absolute minimum. Only comment non-obvious gotchas that would cause a bug if missed (e.g. a deadlock or platform quirk). Don't write comments that explain what code does, restate names, narrate flow, or add JSDoc to simple functions. Put explanations in this file or the README instead.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
