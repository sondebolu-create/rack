import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatPrice } from '@/lib/format';
import type { ImageSource, ProductDetail } from '@/lib/types';
import { BackButton } from './BackButton';
import { Corners } from './Corners';

export type ResultStepProps = {
  product: ProductDetail;
  /** The shopper's photo, taken or uploaded. */
  photo: ImageSource;
  overlayIndex: number;
  /** "a size" or "a colour" while one is still unchosen, otherwise null. */
  missing: string | null;
  inCart: boolean;
  qty: number;
  onAddToCart: () => void;
  onBack: () => void;
};

/**
 * Try-on result (Figma 318:4736). This is a mock: the shopper's photo with the product's photo laid over it.
 * Real garment fitting comes later.
 */
export function ResultStep({ product, photo, overlayIndex, missing, inCart, qty, onAddToCart, onBack }: ResultStepProps) {
  const [triedToAdd, setTriedToAdd] = useState(false);
  const overlay = product.gallery[overlayIndex] ?? product.gallery[0];

  const add = () => {
    if (missing) {
      setTriedToAdd(true);
      return;
    }
    onAddToCart();
  };

  return (
    <View className="flex-1 px-6">
      <BackButton onPress={onBack} />

      <View className="mt-5 flex-1">
        <Corners>
          <Image source={photo} accessibilityLabel="Your photo" contentFit="cover" className="h-full w-full" />
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center p-8">
            <Image
              source={overlay.source}
              accessibilityLabel={`${product.name} shown on your photo (preview only)`}
              contentFit="contain"
              className="h-3/5 w-3/5 rounded-xl opacity-90"
            />
          </View>
        </Corners>
      </View>

      <Text weight="bold" className="mt-6 text-center text-xl text-inverse">
        {formatPrice(product.priceMinor, product.currency)}
      </Text>

      {triedToAdd && missing ? (
        <Text accessibilityLiveRegion="polite" className="mt-2 text-center text-xs text-inverse">
          Select {missing} to add this to your cart. Tap Back to choose.
        </Text>
      ) : null}

      <View className="mb-2 mt-3">
        {inCart ? (
          <Button
            label="In your cart"
            icon="cartLight"
            disabled
            accessibilityLabel={`Already in your cart, quantity ${qty}`}
          />
        ) : (
          <Button label="Add to cart" icon="cartLight" onPress={add} />
        )}
      </View>
    </View>
  );
}
