import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Linking } from "react-native";

import { MessageState } from "@/components/album-list/album-list-states";
import { StarRatingBadge } from "@/components/star-rating-badge";
import { getSpotifyAlbumUrl } from "@/lib/album-utils";
import { albumsQueryOptions } from "@/lib/queries/albums";
import { Image, Pressable, ScrollView, Text, useCSSVariable, View } from "@/tw";

export default function AlbumSheet() {
  const params = useLocalSearchParams<{ id: string; listId: string }>();
  const albumId = Number(params.id);
  const listId = Number(params.listId);
  const hasValidParams = Number.isInteger(albumId) && Number.isInteger(listId);
  const spinnerColor = useCSSVariable("--color-text-subdued");
  const albumQuery = useQuery({
    ...albumsQueryOptions(listId),
    select: (albums) => albums.find((a) => a.id === albumId),
    enabled: hasValidParams,
  });
  const album = albumQuery.data;

  if (!album) {
    return (
      <ScrollView className="flex-1">
        {hasValidParams && albumQuery.isPending ? (
          <View className="items-center py-16">
            <ActivityIndicator color={spinnerColor} />
          </View>
        ) : albumQuery.error ? (
          <MessageState
            icon="exclamationmark.triangle"
            title="Couldn't load this album"
            message={albumQuery.error.message}
            actionLabel="Try Again"
            onAction={() => albumQuery.refetch()}
          />
        ) : (
          <MessageState icon="questionmark" title="Album not found" />
        )}
      </ScrollView>
    );
  }

  const spotifyId = album.spotify_id;
  const releaseYear = album.release_date?.slice(0, 4);

  return (
    <ScrollView className="flex-1" contentContainerClassName="items-center gap-4 px-6 pt-10 pb-12">
      <Image
        source={album.cover_art}
        className="aspect-square w-3/4 rounded-lg bg-background-highlight"
      />
      <View className="items-center gap-1">
        <Text selectable className="text-center text-title text-text-base">
          {album.name}
        </Text>
        <Text selectable className="text-center text-body text-text-subdued">
          {releaseYear ? `${album.artist_name} · ${releaseYear}` : album.artist_name}
        </Text>
      </View>
      {album.rating ? <StarRatingBadge rating={album.rating} /> : null}
      {album.note ? (
        <Text
          selectable
          className="w-full rounded-lg bg-background-highlight p-4 text-body text-text-base"
        >
          {album.note}
        </Text>
      ) : null}
      {spotifyId ? (
        <Pressable
          className="rounded-full bg-spotify-green px-6 py-3 active:bg-spotify-green-active"
          onPress={() => Linking.openURL(getSpotifyAlbumUrl(spotifyId))}
        >
          <Text className="text-subhead text-black">Open in Spotify</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
