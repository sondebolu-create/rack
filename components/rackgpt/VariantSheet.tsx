import { useState } from 'react';
import { View } from 'react-native';
import { ColorSwatches } from '@/components/product/ColorSwatches';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { track } from '@/lib/analytics';
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { useProduct } from '@/lib/queries/products';
import { Skeleton } from '@/components/ui/Skeleton';
import type { OutfitMatch, Size } from '@/lib/types';

/**
 * Size and colour picker for RackGPT's Add. A cart line is one variant, and the match cards show neither,
 * so Add asks here first. It is not in Figma; it reuses the sheet, size chips and colour dots from Product Detail.
 */
export function VariantSheet({ match, onClose }: { match: OutfitMatch | null; onClose: () => void }) {
  // Keyed on the match, so choices do not carry over from one product to the next.
  return match ? <Picker key={match.id} match={match} onClose={onClose} /> : null;
}

function Picker({ match, onClose }: { match: OutfitMatch; onClose: () => void }) {
  const add = useCartStore((s) => s.add);
  // The real variants: sizes, colours and what is in stock for each pair.
  const detail = useProduct(match.id).data;
  const colors = detail?.colors ?? [];
  const variants = detail?.variants ?? [];
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const stockFor = (sz: Size, c: string) => variants.find((v) => v.size === sz && v.color === c)?.stock ?? 0;
  const sizeOut = (sz: Size) => !(color ? stockFor(sz, color) > 0 : variants.some((v) => v.size === sz && v.stock > 0));
  const colorOut = (c: string) => !(size ? stockFor(size, c) > 0 : variants.some((v) => v.color === c && v.stock > 0));
  const pickSize = (next: Size) => {
    setSize(next);
    if (color && stockFor(next, color) <= 0) setColor(null);
  };
  const pickColor = (next: string) => {
    setColor(next);
    if (size && stockFor(size, next) <= 0) setSize(null);
  };
  const [tried, setTried] = useState(false);
  const missing = size === null ? 'a size' : color === null ? 'a colour' : null;

  const confirm = () => {
    if (!size || !color) {
      setTried(true);
      return;
    }
    const variant = variants.find((v) => v.size === size && v.color === color);
    if (!variant || variant.stock <= 0) return;
    add(match, variant.id, size, color, 1, variant.stock);
    track('add_to_cart', { source: 'rackgpt' });
    onClose();
  };

  return (
    <Sheet visible title={match.name} onClose={onClose}>
      <View className="gap-4 pb-6">
        <Text className="text-center text-muted">
          {match.vendorName} · {formatPrice(match.priceMinor, match.currency)}
        </Text>
        <View className="gap-1">
          <Text className="text-xs text-primary-hover">Select size</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Select size" className="flex-row flex-wrap gap-2">
            {detail ? (
              (detail.allSizes ?? []).map((s) => (
                <Chip key={s} label={s} accessibilityLabel={sizeOut(s) ? `Size ${s}, sold out` : `Size ${s}`} selected={s === size} disabled={sizeOut(s)} onPress={() => pickSize(s)} />
              ))
            ) : (
              <Skeleton className="h-11 w-40 rounded-full" />
            )}
          </View>
        </View>
        <View className="gap-1">
          <Text className="text-xs text-primary-hover">Select color</Text>
          <ColorSwatches colors={colors} selected={color} onSelect={pickColor} isDisabled={colorOut} />
        </View>
        {tried && missing ? (
          <Text weight="medium" accessibilityLiveRegion="polite" className="text-xs">
            Select {missing} to add this to your cart.
          </Text>
        ) : null}
      </View>
      <Button label="Add to cart" icon="cartLight" onPress={confirm} />
    </Sheet>
  );
}
