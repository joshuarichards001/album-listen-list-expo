import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { AlbumLink } from "@/components/album-list/album-link";
import { AlbumRowContent } from "@/components/album-list/album-row-content";
import { StarRatingBadge } from "@/components/star-rating-badge";
import type { Album } from "@/lib/queries/albums";
import { Pressable, Text } from "@/tw";

type Props = {
  album: Album;
  canRemove: boolean;
  onRemove: (album: Album) => void;
};

export function AlbumRow({ album, canRemove, onRemove }: Props) {
  const row = (
    <AlbumLink album={album} canRemove={canRemove} onRemove={onRemove}>
      <Pressable className="flex-row items-center gap-3 bg-background-base px-4 py-2 active:bg-background-highlight">
        <AlbumRowContent
          coverUrl={album.cover_art}
          recyclingKey={`${album.id}`}
          title={album.name}
          subtitle={album.artist_name}
          badge={album.rating ? <StarRatingBadge rating={album.rating} /> : null}
        />
      </Pressable>
    </AlbumLink>
  );

  if (!canRemove) return row;

  // Keyed by album so a recycled row never shows the previous album's open swipe state.
  return (
    <ReanimatedSwipeable
      key={album.id}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <Pressable
          accessibilityRole="button"
          className="w-24 items-center justify-center bg-danger"
          onPress={() => {
            swipeable.close();
            onRemove(album);
          }}
        >
          <Text className="text-subhead text-text-base">Remove</Text>
        </Pressable>
      )}
    >
      {row}
    </ReanimatedSwipeable>
  );
}
