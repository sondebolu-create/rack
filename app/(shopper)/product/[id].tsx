import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ColorSwatches } from '@/components/product/ColorSwatches';
import { CheckoutBar } from '@/components/product/CheckoutBar';
import { Gallery } from '@/components/product/Gallery';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { SimilarProducts } from '@/components/product/SimilarProducts';
import { SizePills } from '@/components/product/SizePills';
import { TryOnSheet, type TryOnMethod } from '@/components/product/TryOnSheet';
import { pickPhoto } from '@/components/rackgpt/pickPhoto';
import { TryOnFlow } from '@/components/tryon/TryOnFlow';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { ScreenPlaceholder } from '@/components/ui/ScreenPlaceholder';
import { Text } from '@/components/ui/Text';
import { MAX_QTY, cartItemId, useCartItem, useCartStore, useCartTotals } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { getProduct } from '@/lib/mock/product';
import type { ImageSource, ProductDetail, Size } from '@/lib/types';

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  if (!product) return <ScreenPlaceholder name="Product not found" req="M4" back />;
  return <ProductView product={product} />;
}

/**
 * M4 Product detail. Figma 318:4068 (not in cart) and 318:4165 (in cart: stepper + checkout bar).
 * "In cart" means the chosen size and colour are in the cart store (M6), the same cart as Cart and the try-on.
 */
function ProductView({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const [size, setSize] = useState<Size | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [triedToAdd, setTriedToAdd] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  // The try-on flow (M5) shares size, colour and qty with this screen, so "Add to cart" there is the same cart.
  const [tryOn, setTryOn] = useState<{ photo: ImageSource | null } | null>(null);

  const missing = size === null ? 'a size' : color === null ? 'a colour' : null;
  const addItem = useCartStore((s) => s.add);
  const setLineQty = useCartStore((s) => s.setQty);
  const totals = useCartTotals();
  const lineId = size && color ? cartItemId(product.id, size, color) : null;
  const qty = useCartItem(lineId)?.qty ?? 0;
  const inCart = qty > 0;

  const addToCart = () => {
    if (missing || !size || !color) {
      setTriedToAdd(true);
      return;
    }
    addItem(product, size, color);
  };
  const setQty = (next: number) => {
    if (lineId) setLineQty(lineId, next);
  };

  const startTryOn = async (method: TryOnMethod) => {
    if (method === 'capture') {
      setTryOnOpen(false);
      setTryOn({ photo: null });
      return;
    }
    // Pick while the sheet is still up: iOS cannot present the picker while the sheet is sliding away.
    const photo = await pickPhoto('library');
    setTryOnOpen(false);
    if (photo) setTryOn({ photo });
  };

  return (
    <View className="flex-1 bg-surface">
      <View
        className="flex-1"
        accessibilityElementsHidden={tryOn !== null}
        importantForAccessibility={tryOn !== null ? 'no-hide-descendants' : 'auto'}>
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
      </View>

      {inCart ? (
        <CheckoutBar
          // The whole cart, not just this item. Figma does not link the bar anywhere, so it opens the cart,
          // where "Proceed" starts checkout.
          totalMinor={totals.subtotalMinor}
          currency={totals.currency}
          onCheckout={() => router.push('/cart')}
        />
      ) : null}

      <TryOnSheet
        visible={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        onProceed={startTryOn}
      />

      {tryOn ? (
        <TryOnFlow
          product={product}
          initialPhoto={tryOn.photo}
          size={size}
          color={color}
          onSelectSize={setSize}
          onSelectColor={setColor}
          inCart={inCart}
          qty={qty}
          onAddToCart={addToCart}
          onClose={() => setTryOn(null)}
        />
      ) : null}
    </View>
  );
}
