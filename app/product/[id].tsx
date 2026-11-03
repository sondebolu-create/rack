import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ColorSwatches } from '@/components/product/ColorSwatches';
import { CheckoutBar } from '@/components/product/CheckoutBar';
import { Gallery } from '@/components/product/Gallery';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { SimilarProducts } from '@/components/product/SimilarProducts';
import { SizePills } from '@/components/product/SizePills';
import { TryOnSheet } from '@/components/product/TryOnSheet';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { Text } from '@/components/ui/Text';
import { formatPrice } from '@/lib/format';
import { getProduct } from '@/lib/mock/product';
import type { ProductDetail, Size } from '@/lib/types';

const MAX_QTY = 10;

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  if (!product) return <ScreenPlaceholder name="Product not found" req="M4" back />;
  return <ProductView product={product} />;
}

/**
 * M4 Product detail. Figma 318:4068 (not in cart) and 318:4165 (in cart: stepper + checkout bar).
 * The cart is local state until M6 adds a real one.
 */
function ProductView({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(0);
  const [triedToAdd, setTriedToAdd] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  const missing = size === null ? 'a size' : color === null ? 'a colour' : null;
  const inCart = qty > 0;

  const addToCart = () => {
    if (missing) {
      setTriedToAdd(true);
      return;
    }
    setQty(1);
  };

  return (
    <View className="flex-1 bg-surface">
      <Screen back scroll accessibilityLabel={product.name}>
        <View className="gap-4 pt-2">
          <View className="gap-1">
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`${product.vendorName} store`}
              hitSlop={{ top: 14, bottom: 14, right: 16 }}
              onPress={() => router.push(`/store/${product.vendorId}`)}
              className="self-start">
              <Text weight="medium" className="text-xs underline">
                {product.vendorName}
              </Text>
            </Pressable>
            <View className="flex-row items-center justify-between">
              <Text weight="medium" accessibilityRole="header" className="flex-1 text-xl">
                {product.name}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Try it on"
                hitSlop={8}
                onPress={() => setTryOnOpen(true)}
                className="min-h-8 flex-row items-center gap-0.5 rounded-lg bg-card px-2 py-1">
                <Icon name="cameraDark" size={12} />
                <Text weight="medium">Try it on</Text>
                <Icon name="chevronRight" size={12} />
              </Pressable>
            </View>
          </View>

          <Gallery images={product.gallery} />

          <View className="gap-1 rounded-xl bg-card px-4 py-3">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-xs text-primary-hover">Select size</Text>
                <SizePills sizes={product.sizes} selected={size} onSelect={setSize} />
              </View>
              <View className="items-end">
                <Text className="text-xs text-primary-hover">Select color</Text>
                <ColorSwatches colors={product.colors} selected={color} onSelect={setColor} />
              </View>
            </View>
            {triedToAdd && missing ? (
              <Text weight="medium" accessibilityLiveRegion="polite" className="text-xs">
                Select {missing} to add this to your cart.
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center justify-between px-1">
            <Text className="text-lg">{formatPrice(product.priceMinor, product.currency)}</Text>
            {inCart ? (
              <QuantityStepper value={qty} max={MAX_QTY} onChange={setQty} />
            ) : (
              <Button label="Add to cart" icon="cartLight" fullWidth={false} onPress={addToCart} />
            )}
          </View>

          <View className="pt-4">
            <SimilarProducts product={product} />
          </View>
          {/* Keeps the last row clear of the floating checkout bar. */}
          {inCart ? <View className="h-20" /> : null}
        </View>
      </Screen>

      {inCart ? (
        <CheckoutBar
          totalMinor={product.priceMinor * qty}
          currency={product.currency}
          // The checkout flow (M7) does not exist yet, so this lands on the cart tab.
          onCheckout={() => router.push('/cart')}
        />
      ) : null}

      <TryOnSheet
        visible={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        // The try-on camera and result screens come in the next task.
        onProceed={() => setTryOnOpen(false)}
      />
    </View>
  );
}
