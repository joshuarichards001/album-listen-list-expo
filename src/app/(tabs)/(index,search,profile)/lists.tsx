import { useMutation, useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

import { MessageState } from "@/components/album-list/album-list-states";
import { ManageLists } from "@/components/manage-lists";
import {
  DEFAULT_LIST_NAME,
  deleteListMutationOptions,
  type List,
  listsQueryOptions,
  setListVisibilityMutationOptions,
} from "@/lib/queries/lists";
import { useRootStore } from "@/stores/root-store";
import { useCSSVariable, View } from "@/tw";

export default function ManageListsSheet() {
  const userId = useRootStore((state) => state.id);
  const spinnerColor = useCSSVariable("--color-text-subdued");
  const listsQuery = useQuery(listsQueryOptions(userId));
  const deleteList = useMutation(deleteListMutationOptions);
  const setVisibility = useMutation(setListVisibilityMutationOptions);
  const [listsKey, setListsKey] = useState(0);

  const confirmDelete = (list: List) =>
    Alert.alert(
      `Delete “${list.name}”?`,
      "The list and its albums will be removed. This can't be undone.",
      [
        // SwiftUI hides a row as soon as its destructive swipe action is tapped, so remount to bring it back.
        { text: "Cancel", style: "cancel", onPress: () => setListsKey((key) => key + 1) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteList.mutate(list, {
              onError: (error) => {
                setListsKey((key) => key + 1);
                Alert.alert("Couldn't delete the list", error.message);
              },
            }),
        },
      ],
    );

  const explainDefaultList = () =>
    Alert.alert(
      `“${DEFAULT_LIST_NAME}” can't be renamed or deleted`,
      "It's your default list. You can still make it public or private.",
    );

  const setPublic = (list: List, isPublic: boolean) =>
    setVisibility.mutate(
      { listId: list.id, isPublic },
      { onError: (error) => Alert.alert("Couldn't change the list's visibility", error.message) },
    );

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel="New list"
          onPress={() => router.push("/new-list")}
        />
      </Stack.Toolbar>
      {listsQuery.data ? (
        <ManageLists
          key={listsKey}
          lists={listsQuery.data}
          onRename={(list) =>
            router.push({ pathname: "/rename-list/[id]", params: { id: list.id } })
          }
          onDelete={confirmDelete}
          onDefaultListPress={explainDefaultList}
          onSetPublic={setPublic}
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={spinnerColor} />
        </View>
      )}
    </>
  );
}
