# Album Listen List (mobile)

Native version of the Album Listen List web app (`~/dev/album-listen-list`, React + Supabase). Both
apps share one Supabase project, and users sign in with Spotify. Check the web app when porting a
feature.

## Workflow

- Work directly on `main`. Don't create feature branches or PRs.
- Before any Expo, EAS, or React Native work, invoke the matching skill from the `expo` plugin
  (`expo-overview` if unsure which).
- Add packages with `npx expo install <package>`, never `npm install <package>`.
- After any code change, run `npm run format` then `npm run check` (Prettier check, `expo lint`,
  `tsc --noEmit`), and fix everything it reports before declaring the task done. Use
  `npm run lint:fix` for autofixable lint errors.
- After changing logic or UI code, also test it in the simulator (see Verification).
- Formatting is owned by Prettier (`.prettierrc`) and enforced through ESLint, so don't hand-format
  or add style rules to `eslint.config.js`.
- `tsconfig.json` enables `noUncheckedIndexedAccess`: array and record lookups are `T | undefined`,
  so handle the `undefined` case (defaults, guards) rather than using `!`.
- Routes live in `src/app/`. Keep components, hooks, and utils outside it.
- Keep code comments to an absolute minimum. Only comment non-obvious gotchas that would cause a bug
  if missed (e.g. a deadlock or platform quirk). Don't write comments that explain what code does,
  restate names, narrate flow, or add JSDoc to simple functions. Put explanations in this file or
  the README instead.

## Verification

Passing `npm run check` doesn't prove a screen works. Test every logic or UI change in the iOS
Simulator.

- Run `npx expo start --ios` in the background (opens the app in Expo Go), or reuse Metro if it's
  already on port 8081. Don't set `CI=1`: it disables reloads.
- Open the simulator panel so the user can watch. Use your simulator tools to tap, type, and
  screenshot.
- After restarting Metro, the app keeps the old bundle. Relaunch it:
  `xcrun simctl terminate booted host.exp.Exponent`, then
  `xcrun simctl openurl booted <exp:// URL from Metro>`.
- Navigate by tapping. Deep links (`<exp:// URL>/--/<route>`) push onto the current tab instead of
  switching tabs.
- SwiftUI controls from `@expo/ui` (e.g. `Toggle`) ignore instant simulator taps. Tap with
  `duration: 0.25`.
- Test the whole flow, not just the first render: loading, error, and empty states, back navigation,
  and long text. Record animations with `xcrun simctl io booted recordVideo <file>.mov`.
- Check the Metro output for errors and warnings.
- If the app is signed out, ask the user to sign in. Never enter credentials yourself.
- Report what you tested, with screenshots, and what you couldn't verify.

## Styling

- Tailwind via NativeWind v5, set up like Expo's `with-tailwindcss` example. Style with `className`,
  not `StyleSheet`.
- `globalClassNamePolyfill` is off, so React Native components ignore `className`. Import them from
  `@/tw`, adding a `useCssElement` wrapper there when you need a new one.
- Design tokens live in `src/global.css` under `@theme static`. Read one in JS (navigation options,
  `ActivityIndicator` color) with `useCSSVariable("--color-…")`.
- Color tokens keep the web app's names (`tailwind.config.js` there), so web classes like
  `bg-background-highlight` or `text-text-subdued` port unchanged. Map web one-offs to tokens:
  `text-yellow-500` → `text-star`, `text-red-500` → `text-danger`, `#666666` → `text-muted`. Never
  hardcode a hex value.
- The font is Gotham Medium (`assets/fonts/Gotham-Medium.otf`, the only weight), loaded with
  `useFonts` in `src/app/_layout.tsx` so it also works in Expo Go. `Text` from `@/tw` applies
  `font-gotham` by default. Other text-rendering components (`TextInput`, navigation options) need
  `font-gotham` or `useCSSVariable("--font-gotham")`. Don't override `--font-sans`, because
  NativeWind resets it per platform.
- For font sizes use the native ramp (`text-subhead`, `text-body`, `text-title`, `text-title-lg`,
  `text-display`) instead of the web's `text-sm`/`text-xl`.
- The app is dark only (`userInterfaceStyle: "dark"`), like the web app. Visual language: pill
  buttons (`rounded-full`), primary actions in `bg-spotify-green` with `text-black`, raised surfaces
  in `bg-background-highlight` with `rounded-lg`.
- `package.json` overrides `lightningcss` to `1.30.1`; newer versions fail to compile `global.css`
  ("expected an object-like struct named Specifier"). `nativewind` and `react-native-css` are a
  pinned prerelease pair; upgrade them together and recheck the override.
- Keep `nativewind-env.d.ts` in the `tsconfig.json` `include` list, even though `**/*.ts` covers it.
  Without it, Metro rewrites and reformats `tsconfig.json` on start.

## Navigation

- Signed-in screens live in `src/app/(tabs)/`, which uses `NativeTabs`
  (`expo-router/unstable-native-tabs`). Native tabs don't render headers, so the tabs share one
  `Stack` through the `(index,search,profile)` group: each tab gets its own stack instance, and a
  screen added there can be pushed from any tab. Each screen sets its title with `<Stack.Title>`.
- To switch tabs in code, use the full group path (`router.navigate("/(tabs)/(search)/search")`). A
  plain `/search` pushes onto the current tab.
- When adding a tab, add it to the group name, `unstable_settings` (without an anchor every tab
  opens on `index`), and a `NativeTabs.Trigger` named `(<route>)`.
- Navigation colors and fonts come from `useNavigationTheme` (`src/hooks/`), passed to
  `ThemeProvider` in the root layout. Set header styling there instead of per-screen
  `screenOptions`.
- Make a tab screen's root a `ScrollView` with `contentInsetAdjustmentBehavior="automatic"` so large
  titles collapse and the tab bar insets correctly.

## Data

- Server data lives in TanStack Query (`src/lib/queries/`), client preferences in Zustand. Export
  `queryOptions`/`mutationOptions` factories, throw on Supabase errors, and update caches
  optimistically with a rollback.
- Supabase types live in `src/lib/database.types.ts`. Regenerate with `npm run gen:types` (needs
  `npx supabase login`) after a schema change. View columns are all nullable, so narrow them (see
  `isAlbum` in `src/lib/queries/albums.ts`).
- Supabase caps responses at 1,000 rows, so lists are fetched in `.range()` chunks ordered by a
  unique key.
- The default list is found by its name, "Listen List", in both apps. Never let it be renamed or
  deleted, or another list take the name.
- FlashList recycles row views, so keep row state out of rows, give covers a `recyclingKey`, and key
  stateful children (like `ReanimatedSwipeable`) by item id.

## Auth & State gotchas

- **Env vars** (`EXPO_PUBLIC_*` in `.env.local`) are inlined at bundle time. Restart with
  `npx expo start --clear` after changing them.
- **No PKCE**: Spotify sign in (`src/lib/auth.ts`) uses the implicit flow on purpose. Hermes has no
  `crypto.subtle`, so supabase-js falls back to the `plain` challenge and warns.
- **Spotify tokens**: Supabase only returns `provider_token` and `provider_refresh_token` once, in
  the sign in redirect, and drops them on session refresh. They live in the store; never expect them
  on `session`.
- **Store slices** (`src/stores/`): each slice exports a `partialize<Name>Slice` function, spread
  into the root `partialize` in `root-store.ts`, where `persist` is applied once. Don't persist
  `session`, since supabase-js persists it.
- **Sync hydration**: `root-store.ts` reads storage with `getItemSync`, so persisted state (like the
  selected list) is there on the first render. Keep it sync.
- **Sign out** clears the query cache (`use-supabase-auth-listener.ts`) and resets signed-in slice
  state in `setSession`.
- **Route protection**: `src/app/_layout.tsx` uses `Stack.Protected` guards on `session`. Don't
  navigate manually after signing in or out.
- **Redirect URLs**: Supabase never redirects to IP-address hosts, so in Expo Go sign in only works
  with `npx expo start --tunnel`. Development builds use `albumlistenlistexpo://` and don't need it.
  Allowed redirect URLs are `exp://**` and `albumlistenlistexpo://**` (a single `*` doesn't match
  `.` or `/`).
