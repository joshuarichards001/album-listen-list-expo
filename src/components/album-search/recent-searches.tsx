import { SymbolView } from "expo-symbols";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { MessageState } from "@/components/album-list/album-list-states";
import { useRootStore } from "@/stores/root-store";
import { Pressable, Text, useCSSVariable, View } from "@/tw";

type Props = {
  listName: string;
  onSelect: (search: string) => void;
};

export function RecentSearches({ listName, onSelect }: Props) {
  const recentSearches = useRootStore((state) => state.recentSearches);
  const removeRecentSearch = useRootStore((state) => state.removeRecentSearch);
  const clearRecentSearches = useRootStore((state) => state.clearRecentSearches);
  const iconColor = useCSSVariable("--color-text-subdued");

  if (recentSearches.length === 0) {
    return (
      <MessageState
        icon="magnifyingglass"
        title="Find albums"
        message={`Search Spotify for albums to add to ${listName}.`}
      />
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-body text-text-base">Recent Searches</Text>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={clearRecentSearches}>
          <Text className="text-subhead text-spotify-green">Clear</Text>
        </Pressable>
      </View>
      {recentSearches.map((search) => (
        <ReanimatedSwipeable
          key={search}
          friction={2}
          rightThreshold={40}
          overshootRight={false}
          renderRightActions={() => (
            <Pressable
              accessibilityRole="button"
              className="w-24 items-center justify-center bg-danger"
              onPress={() => removeRecentSearch(search)}
            >
              <Text className="text-subhead text-text-base">Remove</Text>
            </Pressable>
          )}
        >
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 bg-background-base px-4 py-3 active:bg-background-highlight"
            onPress={() => onSelect(search)}
          >
            <SymbolView name="clock.arrow.circlepath" size={20} tintColor={iconColor} />
            <Text numberOfLines={1} className="flex-1 text-body text-text-base">
              {search}
            </Text>
            <SymbolView name="arrow.up.left" size={16} tintColor={iconColor} />
          </Pressable>
        </ReanimatedSwipeable>
      ))}
    </View>
  );
}
