import { ErrorBanner } from "@/components/album-list/album-list-states";
import type { AlbumFilter } from "@/lib/album-utils";
import { useRootStore } from "@/stores/root-store";
import { Pressable, Text, View } from "@/tw";

const FILTERS: { value: AlbumFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "not-reviewed", label: "Not reviewed" },
  { value: "reviewed", label: "Reviewed" },
];

type Props = {
  albumCount: number;
  showFilters: boolean;
  showRefreshError: boolean;
  onRetry: () => void;
  className?: string;
};

export function AlbumListHeader({
  albumCount,
  showFilters,
  showRefreshError,
  onRetry,
  className,
}: Props) {
  const filter = useRootStore((state) => state.filter);
  const setFilter = useRootStore((state) => state.setFilter);

  if (!showFilters && !showRefreshError) return null;

  return (
    <View className={`gap-3 pb-2 ${className ?? ""}`}>
      {showRefreshError ? <ErrorBanner onRetry={onRetry} /> : null}
      {showFilters ? (
        <View className="flex-row items-center gap-2">
          {FILTERS.map(({ value, label }) => {
            const isSelected = value === filter;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                className={`rounded-full px-4 py-2 ${isSelected ? "bg-spotify-green active:bg-spotify-green-active" : "bg-background-highlight active:bg-background-hover"}`}
                onPress={() => setFilter(value)}
              >
                <Text className={`text-subhead ${isSelected ? "text-black" : "text-text-base"}`}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {showFilters ? (
        <Text className="self-end text-subhead text-text-active">
          {albumCount === 1 ? "1 album" : `${albumCount} albums`}
        </Text>
      ) : null}
    </View>
  );
}
