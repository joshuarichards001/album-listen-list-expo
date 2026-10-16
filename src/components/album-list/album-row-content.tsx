import type { ReactNode } from "react";

import { Image, Text, View } from "@/tw";

type Props = {
  coverUrl: string | null;
  recyclingKey: string;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  trailing?: ReactNode;
};

export function AlbumRowContent({
  coverUrl,
  recyclingKey,
  title,
  subtitle,
  badge,
  trailing,
}: Props) {
  return (
    <>
      <Image
        source={coverUrl}
        recyclingKey={recyclingKey}
        transition={150}
        className="size-14 rounded bg-background-highlight"
      />
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text numberOfLines={1} className="shrink text-body text-text-base">
            {title}
          </Text>
          {badge}
        </View>
        <Text numberOfLines={1} className="text-subhead text-text-subdued">
          {subtitle}
        </Text>
      </View>
      {trailing}
    </>
  );
}
