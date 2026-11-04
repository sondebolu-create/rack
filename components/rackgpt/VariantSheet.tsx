import { useState } from 'react';
import { View } from 'react-native';
import { ColorSwatches } from '@/components/product/ColorSwatches';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { getProduct } from '@/lib/mock/product';
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
  const colors = getProduct(match.id)?.colors ?? [];
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const missing = size === null ? 'a size' : color === null ? 'a colour' : null;

  const confirm = () => {
    if (!size || !color) {
      setTried(true);
      return;
    }
    add(match, size, color);
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
            {match.sizes.map((s) => (
              <Chip key={s} label={s} accessibilityLabel={`Size ${s}`} selected={s === size} onPress={() => setSize(s)} />
            ))}
          </View>
        </View>
        <View className="gap-1">
          <Text className="text-xs text-primary-hover">Select color</Text>
          <ColorSwatches colors={colors} selected={color} onSelect={setColor} />
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
