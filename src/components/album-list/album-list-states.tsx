import { SymbolView, type SymbolViewProps } from "expo-symbols";

import type { ViewMode } from "@/lib/album-utils";
import { Pressable, Text, useCSSVariable, View } from "@/tw";

export function AlbumListSkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === "grid") {
    return (
      <View accessibilityLabel="Loading albums" className="flex-row flex-wrap">
        {Array.from({ length: 24 }, (_, i) => (
          <View key={i} className="w-1/4 p-1">
            <View className="aspect-square rounded bg-background-highlight" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View accessibilityLabel="Loading albums">
      {Array.from({ length: 10 }, (_, i) => (
        <View key={i} className="flex-row items-center gap-3 px-4 py-2">
          <View className="size-14 rounded bg-background-highlight" />
          <View className="flex-1 gap-2">
            <View className="h-4 w-2/3 rounded-full bg-background-highlight" />
            <View className="h-3 w-1/3 rounded-full bg-background-highlight" />
          </View>
        </View>
      ))}
    </View>
  );
}

type MessageStateProps = {
  icon: SymbolViewProps["name"];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function MessageState({ icon, title, message, actionLabel, onAction }: MessageStateProps) {
  const iconColor = useCSSVariable("--color-text-subdued");

  return (
    <View className="items-center gap-3 px-8 py-16">
      <SymbolView name={icon} size={56} tintColor={iconColor} />
      <Text className="text-center text-title text-text-base">{title}</Text>
      {message ? (
        <Text className="text-center text-subhead text-text-subdued">{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          className="mt-3 rounded-full bg-spotify-green px-6 py-3 active:bg-spotify-green-active"
          onPress={onAction}
        >
          <Text className="text-subhead text-black">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type ErrorBannerProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorBanner({
  message = "Couldn't refresh. Showing saved albums.",
  onRetry,
}: ErrorBannerProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-background-highlight px-4 py-3">
      <Text className="flex-1 text-subhead text-text-subdued">{message}</Text>
      <Pressable hitSlop={8} onPress={onRetry}>
        <Text className="text-subhead text-spotify-green">Retry</Text>
      </Pressable>
    </View>
  );
}
