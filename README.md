# Album Listen List (mobile)

Native iOS/Android version of [Album Listen List](https://albumlistenlist.com), built with
[Expo](https://expo.dev) and Expo Router. It shares the web app's Supabase project, and users sign
in with Spotify.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key
   (Supabase dashboard → Project Settings → API Keys).

3. In the Supabase dashboard under **Authentication → URL Configuration → Redirect URLs**, make sure
   these are allowed:

   - `exp://**`: Expo Go
   - `albumlistenlistexpo://**`: development and production builds

## Running the app

```bash
npx expo start --tunnel
```

Scan the QR code with Expo Go on your phone.

Development builds use the `albumlistenlistexpo://` scheme instead, so they don't need the tunnel.

## Project structure

```text
src/
├── app/          # Expo Router routes and layouts
├── components/   # Shared components (album list, list management)
├── global.css    # Tailwind entry point and design tokens (@theme)
├── hooks/        # React hooks
├── lib/          # Supabase client, auth, generated types, query/mutation factories
├── stores/       # Zustand store, split into slices
└── tw/           # className-aware wrappers around React Native components
supabase/
└── functions/    # Edge functions (Deno), e.g. spotify-token for album search
```

Styling uses [Tailwind CSS](https://tailwindcss.com) through
[NativeWind v5](https://www.nativewind.dev/v5).

## Scripts

```bash
npm run format      # format with Prettier
npm run lint        # lint with ESLint (includes Prettier check)
npm run lint:fix    # lint and autofix
npm run typecheck   # tsc --noEmit
npm run check       # format check + lint + typecheck
npm run gen:types   # regenerate Supabase types (needs `npx supabase login`)
npx expo-doctor     # check dependency and config issues
```

## Edge functions

Album search gets a Spotify app token from the `spotify-token` edge function. Deploy it to the
shared Supabase project with:

```bash
npx supabase functions deploy spotify-token --project-ref mkzfxxmdeoxrjdcsemmy
```
