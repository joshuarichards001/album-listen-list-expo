import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import type { SearchBarCommands } from "react-native-screens";

import { AlbumGridItem } from "@/components/album-list/album-grid-item";
import { AlbumListHeader } from "@/components/album-list/album-list-header";
import { AlbumListSkeleton, MessageState } from "@/components/album-list/album-list-states";
import { AlbumListToolbar } from "@/components/album-list/album-list-toolbar";
import { AlbumRow } from "@/components/album-list/album-row";
import { useVisibleAlbums } from "@/hooks/use-visible-albums";
import { type Album, removeAlbumMutationOptions } from "@/lib/queries/albums";
import { listQueryOptions } from "@/lib/queries/lists";
import { useRootStore } from "@/stores/root-store";
import { FlashList, ScrollView } from "@/tw";

type Props = {
  listId: number;
};

export function AlbumListScreen({ listId }: Props) {
  const queryClient = useQueryClient();
  const userId = useRootStore((state) => state.id);
  const viewMode = useRootStore((state) => state.viewMode);
  const setFilter = useRootStore((state) => state.setFilter);
  const searchBarRef = useRef<SearchBarCommands>(null);
  const [search, setSearch] = useState("");
  const [searchListId, setSearchListId] = useState(listId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (searchListId !== listId) {
    setSearchListId(listId);
    setSearch("");
  }

  useEffect(() => {
    searchBarRef.current?.cancelSearch();
  }, [listId]);

  const listQuery = useQuery(listQueryOptions(listId));
  const { query: albumsQuery, visibleAlbums } = useVisibleAlbums(listId, search);
  const removeAlbum = useMutation(removeAlbumMutationOptions);

  const list = listQuery.data;
  const albums = albumsQuery.data;
  const isOwner = !!list && list.user_id === userId;

  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      albumsQuery.refetch(),
      listQuery.refetch(),
      queryClient.invalidateQueries({ queryKey: ["lists"] }),
    ]);
    setIsRefreshing(false);
  };

  const handleRemove = (album: Album) => {
    removeAlbum.mutate(
      { listId, albumId: album.id },
      { onError: (error) => Alert.alert(`Couldn't remove “${album.name}”`, error.message) },
    );
  };

  const clearSearchAndFilter = () => {
    searchBarRef.current?.cancelSearch();
    setSearch("");
    setFilter("all");
  };

  const toolbar = (
    <AlbumListToolbar
      list={list}
      isOwner={isOwner}
      visibleAlbums={visibleAlbums}
      searchBarRef={searchBarRef}
      onSearchChange={setSearch}
    />
  );

  if (list === null || (list === undefined && listQuery.error)) {
    return (
      <>
        <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
          {list === null ? (
            <MessageState
              icon="lock"
              title="List unavailable"
              message="This list is private or no longer exists."
            />
          ) : (
            <MessageState
              icon="exclamationmark.triangle"
              title="Couldn't load this list"
              message={listQuery.error?.message}
              actionLabel="Try Again"
              onAction={() => listQuery.refetch()}
            />
          )}
        </ScrollView>
        <Stack.Title>{""}</Stack.Title>
      </>
    );
  }

  const emptyState = (() => {
    if (albums === undefined) {
      if (albumsQuery.error) {
        return (
          <MessageState
            icon="exclamationmark.triangle"
            title="Couldn't load albums"
            message={albumsQuery.error.message}
            actionLabel="Try Again"
            onAction={() => albumsQuery.refetch()}
          />
        );
      }
      return <AlbumListSkeleton viewMode={viewMode} />;
    }
    if (albums.length === 0) {
      return (
        <MessageState
          icon="music.note.list"
          title="No albums yet"
          message={isOwner ? "Albums you add will show up here." : "This list is empty."}
          actionLabel={isOwner ? "Add an Album" : undefined}
          onAction={() => router.navigate("/(tabs)/(search)/search")}
        />
      );
    }
    return (
      <MessageState
        icon="magnifyingglass"
        title="No matches"
        message="No albums match your search or filter."
        actionLabel="Clear"
        onAction={clearSearchAndFilter}
      />
    );
  })();

  return (
    <>
      <FlashList
        key={`${listId}-${viewMode}`}
        data={visibleAlbums}
        numColumns={viewMode === "grid" ? 4 : 1}
        keyExtractor={(album) => `${album.id}`}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        className="flex-1"
        contentContainerClassName={viewMode === "grid" ? "px-3 pb-4" : "pb-4"}
        refreshing={isRefreshing}
        onRefresh={refresh}
        ListHeaderComponent={
          <AlbumListHeader
            albumCount={visibleAlbums.length}
            showFilters={!!albums && albums.length > 0}
            showRefreshError={!!albums && albumsQuery.isRefetchError}
            onRetry={() => albumsQuery.refetch()}
            className={viewMode === "grid" ? "px-1" : "px-4"}
          />
        }
        ListEmptyComponent={emptyState}
        renderItem={({ item }) =>
          viewMode === "grid" ? (
            <AlbumGridItem album={item} canRemove={isOwner} onRemove={handleRemove} />
          ) : (
            <AlbumRow album={item} canRemove={isOwner} onRemove={handleRemove} />
          )
        }
      />
      {toolbar}
    </>
  );
}
