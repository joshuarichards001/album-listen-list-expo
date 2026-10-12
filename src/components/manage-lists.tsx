import { List, ListItem, Switch } from "@expo/ui";
import { Alert } from "react-native";

import { getListStatus, isDefaultList, type List as AlbumList } from "@/lib/queries/lists";
import { Host } from "@/tw";

export type ManageListsProps = {
  lists: AlbumList[];
  onRename: (list: AlbumList) => void;
  onDelete: (list: AlbumList) => void;
  onSetPublic: (list: AlbumList, isPublic: boolean) => void;
  onDefaultListPress: () => void;
};

export function ManageLists({
  lists,
  onRename,
  onDelete,
  onSetPublic,
  onDefaultListPress,
}: ManageListsProps) {
  const showActions = (list: AlbumList) =>
    Alert.alert(list.name, undefined, [
      { text: "Rename", onPress: () => onRename(list) },
      { text: "Delete", style: "destructive", onPress: () => onDelete(list) },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <Host className="flex-1">
      <List>
        {lists.map((list) => (
          <ListItem
            key={list.id}
            onPress={isDefaultList(list) ? onDefaultListPress : () => showActions(list)}
            supportingText={getListStatus(list)}
            trailing={
              <Switch value={list.public} onValueChange={(value) => onSetPublic(list, value)} />
            }
          >
            {list.name}
          </ListItem>
        ))}
      </List>
    </Host>
  );
}
