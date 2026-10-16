import { useInfiniteQuery, useMutation, useMutationState, useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ActivityIndicator, Alert } from "react-native";

import {
  AlbumListSkeleton,
  ErrorBanner,
  MessageState,
} from "@/components/album-list/album-list-states";
import { RecentSearches } from "@/components/album-search/recent-searches";
import {
  SearchResultRow,
  type SearchResultStatus,
} from "@/components/album-search/search-result-row";
import {
  addAlbumMutationKey,
  addAlbumMutationOptions,
  type AddAlbumVariables,
  type Album,
  albumsQueryOptions,
} from "@/lib/queries/albums";
import type { List } from "@/lib/queries/lists";
import { searchAlbumsInfiniteQueryOptions } from "@/lib/queries/search";
import type { SpotifyAlbum } from "@/lib/spotify";
import { useRootStore } from "@/stores/root-store";
import { FlashList, useCSSVariable, View } from "@/tw";

const selectSpotifyIds = (albums: Album[]) =>
  new Set(albums.flatMap((album) => album.spotify_id ?? []));

type Props = {
  isIdle: boolean;
  query: string;
  searchText: string;
  list: List;
  lists: List[];
  onSelectRecentSearch: (search: string) => void;
};

export function SearchResults({
  isIdle,
  query,
  searchText,
  list,
  lists,
  onSelectRecentSearch,
}: Props) {
  const spinnerColor = useCSSVariable("--color-text-subdued");
  const addRecentSearch = useRootStore((state) => state.addRecentSearch);
  const searchQuery = useInfiniteQuery(searchAlbumsInfiniteQueryOptions(isIdle ? "" : query));
  const { data: addedIds } = useQuery({ ...albumsQueryOptions(list.id), select: selectSpotifyIds });
  const pendingAdds = useMutationState({
    filters: { mutationKey: addAlbumMutationKey, status: "pending" },
    select: (mutation) => mutation.state.variables as AddAlbumVariables | undefined,
  });
  const addAlbum = useMutation({
    ...addAlbumMutationOptions,
    onSuccess: (...args) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return addAlbumMutationOptions.onSuccess?.(...args);
    },
    onError: (error, { spotifyAlbum }) =>
      Alert.alert(`Couldn't add “${spotifyAlbum.name}”`, error.message),
  });

  const pendingIds = new Set(
    pendingAdds.flatMap((variables) =>
      variables?.listId === list.id ? [variables.spotifyAlbum.id] : [],
    ),
  );
  const otherLists = lists.filter((l) => l.id !== list.id);
  const isPausedOffline = searchQuery.isPlaceholderData && searchQuery.fetchStatus === "paused";
  const albums = isIdle || isPausedOffline ? undefined : searchQuery.data;

  const getStatus = (album: SpotifyAlbum): SearchResultStatus => {
    if (addedIds?.has(album.id)) return "added";
    if (pendingIds.has(album.id)) return "pending";
    return "idle";
  };

  const add = (album: SpotifyAlbum, target: List) => {
    addRecentSearch(searchText);
    addAlbum.mutate({ listId: target.id, spotifyAlbum: album });
  };

  const loadMore = () => {
    if (
      !isIdle &&
      searchQuery.hasNextPage &&
      !searchQuery.isFetching &&
      !searchQuery.isFetchNextPageError
    ) {
      searchQuery.fetchNextPage();
    }
  };

  const emptyState = (() => {
    if (isIdle) return <RecentSearches listName={list.name} onSelect={onSelectRecentSearch} />;
    if (searchQuery.isError) {
      return (
        <MessageState
          icon="exclamationmark.triangle"
          title="Couldn't search Spotify"
          message={searchQuery.error.message}
          actionLabel="Try Again"
          onAction={() => searchQuery.refetch()}
        />
      );
    }
    if (searchQuery.fetchStatus === "paused") {
      return (
        <MessageState
          icon="wifi.slash"
          title="You're offline"
          message="Your search will run when you're back online."
        />
      );
    }
    if (!albums) return <AlbumListSkeleton viewMode="list" />;
    return (
      <MessageState
        icon="magnifyingglass"
        title="No albums found"
        message={`No albums found for “${searchText.trim()}”.`}
      />
    );
  })();

  const footer = isIdle ? null : searchQuery.isFetchingNextPage ? (
    <View className="py-4">
      <ActivityIndicator color={spinnerColor} />
    </View>
  ) : searchQuery.isFetchNextPageError ? (
    <View className="px-4 py-2">
      <ErrorBanner
        message="Couldn't load more results."
        onRetry={() => searchQuery.fetchNextPage()}
      />
    </View>
  ) : null;

  return (
    <FlashList
      data={albums ?? []}
      extraData={[addedIds, pendingIds, otherLists]}
      keyExtractor={(album) => album.id}
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      className="flex-1"
      contentContainerClassName="pb-4"
      onEndReached={loadMore}
      ListHeaderComponent={
        isIdle ? null : (
          <View className="h-6 items-center justify-center">
            {searchQuery.isPlaceholderData ? (
              <ActivityIndicator size="small" color={spinnerColor} />
            ) : null}
          </View>
        )
      }
      ListEmptyComponent={emptyState}
      ListFooterComponent={footer}
      renderItem={({ item }) => (
        <SearchResultRow
          album={item}
          status={getStatus(item)}
          otherLists={otherLists}
          onAdd={(album) => add(album, list)}
          onAddToList={add}
        />
      )}
    />
  );
}
