import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Linking } from "react-native";

import { AlbumRowContent } from "@/components/album-list/album-row-content";
import { getSpotifyAlbumUrl } from "@/lib/album-utils";
import type { List } from "@/lib/queries/lists";
import type { SpotifyAlbum } from "@/lib/spotify";
import { Pressable, Text, useCSSVariable, View } from "@/tw";

export type SearchResultStatus = "idle" | "pending" | "added";

const ALBUM_TYPE_LABELS: Record<string, string> = {
  single: "Single",
  compilation: "Compilation",
};

const getSubtitle = (album: SpotifyAlbum) => {
  const typeLabel = ALBUM_TYPE_LABELS[album.albumType];
  return [album.artistName, album.releaseYear, typeLabel].filter(Boolean).join(" · ");
};

type Props = {
  album: SpotifyAlbum;
  status: SearchResultStatus;
  otherLists: List[];
  onAdd: (album: SpotifyAlbum) => void;
  onAddToList: (album: SpotifyAlbum, list: List) => void;
};

export function SearchResultRow({ album, status, otherLists, onAdd, onAddToList }: Props) {
  const iconColor = useCSSVariable("--color-text-subdued");
  const spotifyUrl = getSpotifyAlbumUrl(album.id);

  const trailing =
    status === "added" ? (
      <View className="rounded-full bg-background-highlight px-3 py-1">
        <Text className="text-subhead text-text-subdued">Added</Text>
      </View>
    ) : status === "pending" ? (
      <View className="size-7 items-center justify-center">
        <ActivityIndicator color={iconColor} />
      </View>
    ) : (
      <SymbolView name="plus.circle" size={28} tintColor={iconColor} />
    );

  return (
    <Link
      href={spotifyUrl}
      asChild
      onPress={(event) => {
        event.preventDefault();
        if (status === "idle") onAdd(album);
      }}
    >
      <Link.Trigger>
        <Pressable
          accessibilityLabel={`${album.name} by ${album.artistName}`}
          accessibilityHint={status === "idle" ? "Adds the album to the list" : undefined}
          accessibilityState={{ disabled: status !== "idle", busy: status === "pending" }}
          disabled={status !== "idle"}
          className={`flex-row items-center gap-3 bg-background-base px-4 py-2 active:bg-background-highlight ${status === "added" ? "opacity-50" : ""}`}
        >
          <AlbumRowContent
            coverUrl={album.coverUrl}
            recyclingKey={album.id}
            title={album.name}
            subtitle={getSubtitle(album)}
            trailing={trailing}
          />
        </Pressable>
      </Link.Trigger>
      <Link.Menu>
        <Link.MenuAction
          title="Open in Spotify"
          icon="arrow.up.right"
          onPress={() => Linking.openURL(spotifyUrl)}
        />
        {otherLists.length > 0 ? (
          <Link.Menu title="Add to…" icon="text.badge.plus">
            {otherLists.map((list) => (
              <Link.MenuAction
                key={list.id}
                title={list.name}
                onPress={() => onAddToList(album, list)}
              />
            ))}
          </Link.Menu>
        ) : null}
      </Link.Menu>
    </Link>
  );
}
