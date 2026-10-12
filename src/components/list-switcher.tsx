import { router, Stack } from "expo-router";

import type { List } from "@/lib/queries/lists";
import { useRootStore } from "@/stores/root-store";

type Props = {
  lists: List[];
  currentListId: number | undefined;
};

export function ListSwitcher({ lists, currentListId }: Props) {
  const setSelectedListId = useRootStore((state) => state.setSelectedListId);

  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Menu icon="list.bullet" accessibilityLabel="Switch list">
        <Stack.Toolbar.Menu inline>
          {lists.map((list) => (
            <Stack.Toolbar.MenuAction
              key={list.id}
              isOn={list.id === currentListId}
              onPress={() => setSelectedListId(list.id)}
            >
              {list.name}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
        <Stack.Toolbar.Menu inline>
          <Stack.Toolbar.MenuAction icon="plus" onPress={() => router.push("/new-list")}>
            New List…
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="gearshape" onPress={() => router.push("/lists")}>
            Manage Lists…
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
