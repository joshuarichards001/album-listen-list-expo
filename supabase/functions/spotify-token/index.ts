import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

type SpotifyToken = { accessToken: string; expiresAt: number };

const MIN_LIFETIME_MS = 10 * 60 * 1000;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ??
    Deno.env.get("SUPABASE_ANON_KEY") ??
    "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

let cachedToken: SpotifyToken | null = null;
let pendingToken: Promise<SpotifyToken> | null = null;

class MissingConfigError extends Error {}

const isSignedInUser = async (req: Request) => {
  const jwt = req.headers.get("Authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!jwt) return false;
  // @supabase/server's "user" mode rejects this project's legacy HS256 session JWTs, so verify with
  // getClaims, which asks the Auth server about HS256 tokens and verifies asymmetric ones locally.
  const { data, error } = await supabase.auth.getClaims(jwt);
  return !error && !!data?.claims.sub;
};

const requestToken = async (): Promise<SpotifyToken> => {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new MissingConfigError("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not set.");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error("Spotify token request failed", response.status, await response.text());
    throw new Error(`Spotify returned ${response.status}.`);
  }

  const body = await response.json();
  if (typeof body.access_token !== "string" || typeof body.expires_in !== "number") {
    throw new Error("Spotify returned an unexpected token response.");
  }

  return { accessToken: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
};

const getToken = (): Promise<SpotifyToken> => {
  if (cachedToken && cachedToken.expiresAt - Date.now() > MIN_LIFETIME_MS) {
    return Promise.resolve(cachedToken);
  }

  pendingToken ??= requestToken()
    .then((token) => (cachedToken = token))
    .finally(() => (pendingToken = null));
  return pendingToken;
};

Deno.serve(async (req) => {
  if (!(await isSignedInUser(req))) {
    return Response.json({ error: "Sign in to search Spotify." }, { status: 401 });
  }

  try {
    return Response.json(await getToken(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(error);
    return error instanceof MissingConfigError
      ? Response.json({ error: "Spotify isn't configured." }, { status: 500 })
      : Response.json({ error: "Couldn't get a token from Spotify." }, { status: 502 });
  }
});
