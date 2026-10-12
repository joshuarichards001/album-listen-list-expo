import { useMutation } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import type { RefObject } from "react";
import { Alert, Share } from "react-native";
import type { SearchBarCommands } from "react-native-screens";

import { getRandomAlbum, SORT_FIELDS, type SortField } from "@/lib/album-utils";
import type { Album } from "@/lib/queries/albums";
import { type List, setListVisibilityMutationOptions } from "@/lib/queries/lists";
import { useRootStore } from "@/stores/root-store";

const SORT_LABELS: Record<SortField, { title: string; ascending: string; descending: string }> = {
  time_added: { title: "Recently Added", ascending: "Oldest first", descending: "Newest first" },
  name: { title: "Album Name", ascending: "A to Z", descending: "Z to A" },
  artist_name: { title: "Artist Name", ascending: "A to Z", descending: "Z to A" },
  release_date: { title: "Release Date", ascending: "Oldest first", descending: "Newest first" },
  rating: { title: "Rating", ascending: "Lowest first", descending: "Highest first" },
  review_date: { title: "Date Reviewed", ascending: "Oldest first", descending: "Newest first" },
};

const getListUrl = (listId: number) => `https://albumlistenlist.com/list/${listId}`;

type Props = {
  list: List | null | undefined;
  isOwner: boolean;
  visibleAlbums: Album[];
  searchBarRef: RefObject<SearchBarCommands | null>;
  onSearchChange: (search: string) => void;
};

export function AlbumListToolbar({
  list,
  isOwner,
  visibleAlbums,
  searchBarRef,
  onSearchChange,
}: Props) {
  const sortField = useRootStore((state) => state.sortField);
  const sortAscending = useRootStore((state) => state.sortAscending);
  const sortBy = useRootStore((state) => state.sortBy);
  const viewMode = useRootStore((state) => state.viewMode);
  const setViewMode = useRootStore((state) => state.setViewMode);
  const setVisibility = useMutation(setListVisibilityMutationOptions);

  const openRandomAlbum = () => {
    const album = getRandomAlbum(visibleAlbums);
    if (!album) return;
    router.push({ pathname: "/album/[id]", params: { id: album.id, listId: album.list_id } });
  };

  const shareLink = () => {
    if (!list) return;
    Share.share({ message: `${list.name} on Album Listen List\n${getListUrl(list.id)}` });
  };

  const shareAlbumList = () => {
    if (!list) return;
    const albums = visibleAlbums.map((album) => `${album.name} - ${album.artist_name}`).join("\n");
    Share.share({ message: `${list.name}\n\n${albums}` });
  };

  const toggleVisibility = () => {
    if (!list) return;
    setVisibility.mutate(
      { listId: list.id, isPublic: !list.public },
      {
        onError: (error) => Alert.alert("Couldn't change the list's visibility", error.message),
      },
    );
  };

  return (
    <>
      <Stack.Title>{list?.name ?? ""}</Stack.Title>
      <Stack.SearchBar
        ref={searchBarRef}
        placeholder="Search this list"
        autoCapitalize="none"
        onChangeText={(event) => onSearchChange(event.nativeEvent.text)}
        onCancelButtonPress={() => onSearchChange("")}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          hidden={isOwner || !list}
          onPress={() => router.navigate("/(tabs)/(index)")}
        >
          My List
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          icon="dice"
          accessibilityLabel="Open a random album"
          disabled={visibleAlbums.length === 0}
          onPress={openRandomAlbum}
        />
        <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="List options">
          <Stack.Toolbar.Menu inline title="Sort By">
            {SORT_FIELDS.map((field) => {
              const labels = SORT_LABELS[field];
              const isCurrent = field === sortField;
              return (
                <Stack.Toolbar.MenuAction
                  key={field}
                  isOn={isCurrent}
                  subtitle={
                    isCurrent ? (sortAscending ? labels.ascending : labels.descending) : undefined
                  }
                  onPress={() => sortBy(field)}
                >
                  {labels.title}
                </Stack.Toolbar.MenuAction>
              );
            })}
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              icon="list.bullet"
              isOn={viewMode === "list"}
              onPress={() => setViewMode("list")}
            >
              List View
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="square.grid.2x2"
              isOn={viewMode === "grid"}
              onPress={() => setViewMode("grid")}
            >
              Grid View
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.Menu title="Share" icon="square.and.arrow.up">
              <Stack.Toolbar.MenuAction icon="link" onPress={shareLink}>
                Share Link
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction icon="text.alignleft" onPress={shareAlbumList}>
                Share Album List
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
            <Stack.Toolbar.MenuAction
              icon={list?.public ? "lock" : "globe"}
              hidden={!isOwner}
              subtitle={
                list?.public ? "Anyone with the link can view it" : "Only you can view this list"
              }
              onPress={toggleVisibility}
            >
              {list?.public ? "Make Private" : "Make Public"}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
    </>
  );
}
