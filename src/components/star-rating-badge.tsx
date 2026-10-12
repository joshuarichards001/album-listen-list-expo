import { SymbolView } from "expo-symbols";

import { useCSSVariable, View } from "@/tw";

type Props = {
  rating: number;
  className?: string;
};

export function StarRatingBadge({ rating, className }: Props) {
  const starColor = useCSSVariable("--color-star");
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View
      accessibilityLabel={`Rated ${rating} out of 5`}
      className={`flex-row items-center gap-px rounded-full bg-background-highlight px-1.5 py-1 ${className ?? ""}`}
    >
      {Array.from({ length: fullStars }, (_, i) => (
        <SymbolView key={i} name="star.fill" size={9} tintColor={starColor} />
      ))}
      {hasHalfStar ? (
        <SymbolView name="star.leadinghalf.filled" size={9} tintColor={starColor} />
      ) : null}
    </View>
  );
}
