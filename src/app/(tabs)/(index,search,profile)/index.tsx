import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

import { AlbumListScreen } from "@/components/album-list/album-list-screen";
import { AlbumListSkeleton, MessageState } from "@/components/album-list/album-list-states";
import { ListSwitcher } from "@/components/list-switcher";
import { albumsQueryOptions } from "@/lib/queries/albums";
import { findDefaultList, listsQueryOptions } from "@/lib/queries/lists";
import { useRootStore } from "@/stores/root-store";
import { ScrollView } from "@/tw";

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const userId = useRootStore((state) => state.id);
  const selectedListId = useRootStore((state) => state.selectedListId);
  const viewMode = useRootStore((state) => state.viewMode);
  const listsQuery = useQuery(listsQueryOptions(userId));
  const lists = listsQuery.data;

  useEffect(() => {
    if (selectedListId !== null) queryClient.prefetchQuery(albumsQueryOptions(selectedListId));
  }, [queryClient, selectedListId]);

  const list =
    lists && (lists.find((l) => l.id === selectedListId) ?? findDefaultList(lists) ?? lists[0]);

  if (list) {
    return (
      <>
        <AlbumListScreen listId={list.id} />
        <ListSwitcher lists={lists} currentListId={list.id} />
      </>
    );
  }

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1"
        contentContainerClassName={viewMode === "grid" ? "px-3" : undefined}
      >
        {lists ? (
          <MessageState
            icon="music.note.list"
            title="No lists yet"
            message="Create a list to start collecting albums."
            actionLabel="New List"
            onAction={() => router.push("/new-list")}
          />
        ) : listsQuery.error ? (
          <MessageState
            icon="exclamationmark.triangle"
            title="Couldn't load your lists"
            message={listsQuery.error.message}
            actionLabel="Try Again"
            onAction={() => listsQuery.refetch()}
          />
        ) : (
          <AlbumListSkeleton viewMode={viewMode} />
        )}
      </ScrollView>
      <Stack.Title>{""}</Stack.Title>
      {lists ? <ListSwitcher lists={lists} currentListId={undefined} /> : null}
    </>
  );
}
