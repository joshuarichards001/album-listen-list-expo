Native version of the Album Listen List web app (`~/dev/album-listen-list`, React + Supabase). Both apps share one Supabase project, and users sign in with Spotify. Check the web app when porting a feature.

## Workflow

- Before any Expo, EAS, or React Native work, invoke the matching skill from the `expo` plugin (`expo-overview` if unsure which).
- Add packages with `npx expo install <package>`, never `npm install <package>`.
- After any code change, run `npm run format` then `npm run check` (Prettier check, `expo lint`, `tsc --noEmit`), and fix everything it reports before declaring the task done. Use `npm run lint:fix` for autofixable lint errors.
- Formatting is owned by Prettier (`.prettierrc`) and enforced through ESLint, so don't hand-format or add style rules to `eslint.config.js`.
- `tsconfig.json` enables `noUncheckedIndexedAccess`: array and record lookups are `T | undefined`, so handle the `undefined` case (defaults, guards) rather than using `!`.
- Routes live in `src/app/`. Keep components, hooks, and utils outside it.
- Keep code comments to an absolute minimum. Only comment non-obvious gotchas that would cause a bug if missed (e.g. a deadlock or platform quirk). Don't write comments that explain what code does, restate names, narrate flow, or add JSDoc to simple functions. Put explanations in this file or the README instead.

## Auth & State gotchas

- **Env vars** (`EXPO_PUBLIC_*` in `.env.local`) are inlined at bundle time. Restart with `npx expo start --clear` after changing them.
- **No PKCE**: Spotify sign in (`src/lib/auth.ts`) uses the implicit flow on purpose. Hermes has no `crypto.subtle`, so supabase-js falls back to the `plain` challenge and warns.
- **Spotify tokens**: Supabase only returns `provider_token` and `provider_refresh_token` once, in the sign in redirect, and drops them on session refresh. They live in the store; never expect them on `session`.
- **Store slices** (`src/stores/`): each slice exports a `partialize<Name>Slice` function, spread into the root `partialize` in `root-store.ts`, where `persist` is applied once. Don't persist `session`, since supabase-js persists it.
- **Route protection**: `src/app/_layout.tsx` uses `Stack.Protected` guards on `session`. Don't navigate manually after signing in or out.
- **Redirect URLs**: Supabase never redirects to IP-address hosts, so in Expo Go sign in only works with `npx expo start --tunnel`. Development builds use `albumlistenlistexpo://` and don't need it. Allowed redirect URLs are `exp://**` and `albumlistenlistexpo://**` (a single `*` doesn't match `.` or `/`).
