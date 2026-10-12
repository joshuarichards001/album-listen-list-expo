import { AlbumLink } from "@/components/album-list/album-link";
import { StarRatingBadge } from "@/components/star-rating-badge";
import type { Album } from "@/lib/queries/albums";
import { Image, Pressable } from "@/tw";

type Props = {
  album: Album;
  canRemove: boolean;
  onRemove: (album: Album) => void;
};

export function AlbumGridItem({ album, canRemove, onRemove }: Props) {
  return (
    <AlbumLink album={album} canRemove={canRemove} onRemove={onRemove}>
      <Pressable
        accessibilityLabel={`${album.name} by ${album.artist_name}`}
        className="m-1 active:opacity-70"
      >
        <Image
          source={album.cover_art}
          recyclingKey={`${album.id}`}
          transition={150}
          className="aspect-square w-full rounded bg-background-highlight"
        />
        {album.rating ? (
          <StarRatingBadge rating={album.rating} className="absolute right-1 bottom-1" />
        ) : null}
      </Pressable>
    </AlbumLink>
  );
}
