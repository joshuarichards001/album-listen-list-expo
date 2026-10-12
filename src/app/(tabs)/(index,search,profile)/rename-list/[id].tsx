import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator } from "react-native";

import { ListNameForm } from "@/components/list-name-form";
import { listQueryOptions, renameListMutationOptions } from "@/lib/queries/lists";
import { Pressable, Text, useCSSVariable, View } from "@/tw";

export default function RenameListSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listId = Number(id);
  const hasValidId = Number.isInteger(listId);
  const spinnerColor = useCSSVariable("--color-text-subdued");
  const listQuery = useQuery({ ...listQueryOptions(listId), enabled: hasValidId });
  const renameList = useMutation(renameListMutationOptions);
  const list = listQuery.data;

  if (!list) {
    return (
      <View className="px-6 pt-8 pb-10">
        {hasValidId && listQuery.isPending ? (
          <ActivityIndicator color={spinnerColor} />
        ) : listQuery.error ? (
          <View className="flex-row items-center gap-3">
            <Text className="flex-1 text-body text-text-subdued">Couldn&apos;t load the list.</Text>
            <Pressable hitSlop={8} onPress={() => listQuery.refetch()}>
              <Text className="text-body text-spotify-green">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <Text className="text-body text-text-subdued">List not found.</Text>
        )}
      </View>
    );
  }

  return (
    <ListNameForm
      title="Rename List"
      submitLabel="Save"
      initialName={list.name}
      onSubmit={(name) => renameList.mutateAsync({ list, name })}
    />
  );
}
