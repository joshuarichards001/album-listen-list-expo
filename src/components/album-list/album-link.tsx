import { Link } from "expo-router";
import type { ReactNode } from "react";
import { Linking } from "react-native";

import { getSpotifyAlbumUrl } from "@/lib/album-utils";
import type { Album } from "@/lib/queries/albums";

type Props = {
  album: Album;
  canRemove: boolean;
  onRemove: (album: Album) => void;
  children: ReactNode;
};

export function AlbumLink({ album, canRemove, onRemove, children }: Props) {
  const spotifyId = album.spotify_id;

  return (
    <Link
      href={{ pathname: "/album/[id]", params: { id: album.id, listId: album.list_id } }}
      asChild
    >
      <Link.Trigger>{children}</Link.Trigger>
      <Link.Menu>
        <Link.MenuAction
          title="Open in Spotify"
          icon="arrow.up.right"
          hidden={!spotifyId}
          onPress={() => spotifyId && Linking.openURL(getSpotifyAlbumUrl(spotifyId))}
        />
        <Link.MenuAction
          title="Remove from List"
          icon="trash"
          destructive
          hidden={!canRemove}
          onPress={() => onRemove(album)}
        />
      </Link.Menu>
    </Link>
  );
}
