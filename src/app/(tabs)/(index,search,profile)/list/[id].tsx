import { Stack, useLocalSearchParams } from "expo-router";

import { AlbumListScreen } from "@/components/album-list/album-list-screen";
import { MessageState } from "@/components/album-list/album-list-states";
import { ScrollView } from "@/tw";

export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listId = Number(id);

  if (!Number.isInteger(listId)) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
        <Stack.Title>{""}</Stack.Title>
        <MessageState icon="questionmark" title="List not found" />
      </ScrollView>
    );
  }

  return <AlbumListScreen listId={listId} />;
}
