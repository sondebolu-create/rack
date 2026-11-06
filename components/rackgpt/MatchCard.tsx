import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SizePills } from '@/components/product/SizePills';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import type { OutfitMatch } from '@/lib/types';

export type MatchCardProps = {
  match: OutfitMatch;
  /** Add needs a size and colour, so the parent opens a picker. */
  onAdd: () => void;
};

/** G3/G4: one matched product. "Added" means it is in the cart; Remove takes every variant of it out. */
export function MatchCard({ match, onAdd }: MatchCardProps) {
  const router = useRouter();
  const added = useCartStore((s) => s.items.some((i) => i.product.id === match.id));
  const removeProduct = useCartStore((s) => s.removeProduct);
  const price = formatPrice(match.priceMinor, match.currency);

  const openProduct = () => router.push(`/product/${match.id}`);

  // The card is a plain View, not a Pressable: it holds other buttons (store, Remove, Add), and a button inside
  // a button is invalid HTML on web. The photo and the name are the two ways into the product page.
  return (
    <View className="flex-row gap-3 rounded-xl border border-line bg-card p-3">
      {/* Pointer-only duplicate of the name link below, so it stays out of the keyboard and screen-reader order. */}
      <Pressable
        aria-hidden
        tabIndex={-1}
        accessible={false}
        importantForAccessibility="no"
        onPress={openProduct}
        className="h-[99px] w-24">
        <Image
          source={match.image}
          accessibilityLabel={match.imageAlt}
          contentFit="cover"
          className="h-full w-full rounded-xl"
        />
        {/* Figma uses a pale green badge; this one is dark so the white text stays readable on photos. */}
        <View className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/60 px-1.5 py-0.5">
          <Text className="text-[10px] leading-[15px] text-inverse">{match.matchPercent}% match</Text>
        </View>
      </Pressable>

      <View className="flex-1 justify-between gap-2">
        <View className="gap-1">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${match.vendorName} store`}
            hitSlop={{ top: 14, bottom: 6, left: 8, right: 24 }}
            onPress={() => router.push(`/store/${match.vendorId}`)}
            className="self-start">
            <Text weight="medium" className="text-xs text-primary-hover underline">
              {match.vendorName}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${match.name} by ${match.vendorName}, ${price}, ${match.matchPercent}% match`}
            onPress={openProduct}
            className="self-start">
            <Text weight="medium">{match.name}</Text>
          </Pressable>
          <SizePills sizes={match.sizes} roomy />
        </View>

        <View className="flex-row items-center justify-between">
          <Text weight="medium" className="text-base">
            {price}
          </Text>
          <View className="flex-row items-center gap-3">
            {added ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${match.name}`}
                hitSlop={14}
                onPress={() => removeProduct(match.id)}>
                <Text className="text-xs text-danger">Remove</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={added ? `${match.name} added` : `Add ${match.name}`}
              accessibilityState={{ disabled: added }}
              disabled={added}
              hitSlop={10}
              onPress={onAdd}
              className={`flex-row items-center gap-1 rounded-xl px-3 py-1 ${added ? 'bg-strong' : 'bg-primary'}`}>
              {added ? null : <Icon name="plus" size={12} />}
              <Text className={`text-xs ${added ? 'text-ink' : 'text-inverse'}`}>
                {added ? '✓ Added' : 'Add'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
