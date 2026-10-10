# Album Listen List (mobile)

Native iOS/Android version of [Album Listen List](https://albumlistenlist.com), built with [Expo](https://expo.dev) and Expo Router. It shares the web app's Supabase project, and users sign in with Spotify.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key (Supabase dashboard → Project Settings → API Keys).

3. In the Supabase dashboard under **Authentication → URL Configuration → Redirect URLs**, make sure these are allowed:

   - `exp://**`: Expo Go
   - `albumlistenlistexpo://**`: development and production builds

## Running the app

```bash
npx expo start --tunnel
```

Scan the QR code with Expo Go on your phone.

Use `--tunnel` whenever you test Spotify sign in. Without it, Expo Go's redirect URL uses your machine's LAN IP (`exp://192.168.x.x:8081`), and Supabase never redirects to IP-address hosts, even allow-listed ones. It falls back to the Site URL (`localhost`) and sign in fails. The tunnel gives Metro a hostname (`*.exp.direct`) that Supabase accepts. Plain `npx expo start` is fine for work that doesn't involve signing in.

Development builds use the `albumlistenlistexpo://` scheme instead, so they don't need the tunnel.

## Project structure

```
src/
├── app/          # Expo Router routes (welcome, login, home) and the root layout
├── constants/    # Shared values such as colors
├── hooks/        # React hooks
├── lib/          # Supabase client and auth helpers
└── stores/       # Zustand store, split into slices
```

## Scripts

```bash
npx expo lint     # lint
npx tsc --noEmit  # typecheck
npx expo-doctor   # check dependency and config issues
```
