import { useQuery } from "@tanstack/react-query";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SearchBarCommands } from "react-native-screens";

import { AlbumListSkeleton, MessageState } from "@/components/album-list/album-list-states";
import { SearchResults } from "@/components/album-search/search-results";
import { ListSwitcher } from "@/components/list-switcher";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { findSelectedList, listsQueryOptions } from "@/lib/queries/lists";
import { normaliseSearchQuery } from "@/lib/queries/search";
import { useRootStore } from "@/stores/root-store";
import { ScrollView } from "@/tw";

const SEARCH_DEBOUNCE_MS = 300;
const SHEET_DISMISS_MS = 600;

export function AlbumSearchScreen() {
  const userId = useRootStore((state) => state.id);
  const selectedListId = useRootStore((state) => state.selectedListId);
  const addRecentSearch = useRootStore((state) => state.addRecentSearch);
  const listsQuery = useQuery(listsQueryOptions(userId));
  const lists = listsQuery.data;
  const list = lists && findSelectedList(lists, selectedListId);

  const searchBarRef = useRef<SearchBarCommands>(null);
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useDebouncedValue(text, SEARCH_DEBOUNCE_MS);
  const isIdle = normaliseSearchQuery(text) === "";
  const isIdleRef = useRef(isIdle);
  const [wasIdle, setWasIdle] = useState(isIdle);
  const [searchSession, setSearchSession] = useState(0);
  const [headerRefresh, setHeaderRefresh] = useState(false);

  if (wasIdle !== isIdle) {
    setWasIdle(isIdle);
    if (!isIdle) setSearchSession(searchSession + 1);
  }

  useEffect(() => {
    isIdleRef.current = isIdle;
  }, [isIdle]);

  useFocusEffect(
    useCallback(() => {
      const refreshHeader = () => setHeaderRefresh((refresh) => !refresh);
      refreshHeader();
      const timeout = setTimeout(refreshHeader, SHEET_DISMISS_MS);
      if (isIdleRef.current) searchBarRef.current?.focus();
      return () => clearTimeout(timeout);
    }, []),
  );

  const changeText = (value: string) => {
    setText(value);
    if (normaliseSearchQuery(value) === "") setDebouncedText(value);
  };

  const submit = () => {
    setDebouncedText(text);
    addRecentSearch(text);
  };

  const selectRecentSearch = (search: string) => {
    searchBarRef.current?.setText(search);
    searchBarRef.current?.blur();
    setText(search);
    setDebouncedText(search);
    addRecentSearch(search);
  };

  if (!lists || !list) {
    return (
      <>
        <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
          {lists ? (
            <MessageState
              icon="music.note.list"
              title="No lists yet"
              message="Create a list to start adding albums."
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
            <AlbumListSkeleton viewMode="list" />
          )}
        </ScrollView>
        <Stack.Title>Search</Stack.Title>
      </>
    );
  }

  return (
    <>
      {/* Remounting while scrolled leaves the large title half collapsed, so only start a new
          list (and drop the last search's placeholder results) when a search begins from idle. */}
      <SearchResults
        key={`results-${searchSession}`}
        isIdle={isIdle}
        query={normaliseSearchQuery(debouncedText)}
        searchText={debouncedText}
        list={list}
        lists={lists}
        onSelectRecentSearch={selectRecentSearch}
      />
      {/* While search is active, sheets present over the search controller and react-native-screens
          drops header updates made meanwhile, including during a programmatic dismiss. Changing the
          title on focus, and again once the dismiss animation ends, makes it reapply them. */}
      <Stack.Title>{`Add to ${list.name}${headerRefresh ? "\u200B" : ""}`}</Stack.Title>
      <Stack.SearchBar
        ref={searchBarRef}
        placeholder="Albums or artists"
        autoCapitalize="none"
        hideNavigationBar={false}
        obscureBackground={false}
        onChangeText={(event) => changeText(event.nativeEvent.text)}
        onSearchButtonPress={submit}
        onCancelButtonPress={() => changeText("")}
      />
      <ListSwitcher lists={lists} currentListId={list.id} />
    </>
  );
}
