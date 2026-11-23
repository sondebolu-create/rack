import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
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
import { NotFound } from '@/components/ui/NotFound';
import { Text } from '@/components/ui/Text';
import { maxQtyFor, useCartItem, useCartStore, useCartTotals } from '@/lib/cart';
import { useProduct } from '@/lib/queries/products';
import { formatPrice } from '@/lib/format';
import type { ImageSource, ProductDetail, Size } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { productMetadata } from '@/lib/server/share';
import { ComingSoonSheet } from '@/components/ui/ComingSoon';
import { track } from '@/lib/analytics';
import { REPORT_EMAIL } from '@/lib/config';
import { TRYON_ENABLED } from '@/lib/flags';
import { QueryState } from '@/components/ui/QueryState';

/** Share-preview tags (title, description, image) for link crawlers. Runs on the web server for each request. */
export async function generateMetadata(_request: unknown, params: Record<string, string>) {
  return productMetadata(params.id);
}

export default function Product() {
  return <ProductLoader />;
}

function ProductLoader() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = useProduct(id);
  if (q.isLoading) {
    return (
      <Screen back accessibilityLabel="Loading product">
        <View className="gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </View>
      </Screen>
    );
  }
  if (q.isError) {
    return (
      <Screen back accessibilityLabel="Product">
        <View className="pt-4">
          <QueryState isLoading={false} isError onRetry={() => void q.refetch()} isEmpty={false} skeleton={null} emptyText="">
            {null}
          </QueryState>
        </View>
      </Screen>
    );
  }
  if (!q.data) return <NotFound title="Product not found" body="It may have been removed, or the link is wrong." />;
  return <ProductView product={q.data} />;
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
  const [soonOpen, setSoonOpen] = useState(false);
  // The try-on flow (M5) shares size, colour and qty with this screen, so "Add to cart" there is the same cart.
  const [tryOn, setTryOn] = useState<{ photo: ImageSource | null } | null>(null);

  const missing = size === null ? 'a size' : color === null ? 'a colour' : null;
  const addItem = useCartStore((s) => s.add);
  const setLineQty = useCartStore((s) => s.setQty);
  const totals = useCartTotals();
  // Real stock for database products. Mock products have no variants and are always available.
  const stockFor = (sz: Size, c: string) =>
    product.variants ? (product.variants.find((v) => v.size === sz && v.color === c)?.stock ?? 0) : Infinity;
  const sizeSoldOut = (sz: Size) =>
    !!product.variants && !(color ? stockFor(sz, color) > 0 : product.variants.some((v) => v.size === sz && v.stock > 0));
  const colorSoldOut = (c: string) =>
    !!product.variants && !(size ? stockFor(size, c) > 0 : product.variants.some((v) => v.color === c && v.stock > 0));
  const pickSize = (next: Size) => {
    setSize(next);
    // Drop a colour that this size doesn't come in, rather than leave a sold-out pair selected.
    if (color && stockFor(next, color) <= 0) setColor(null);
  };
  const pickColor = (next: string) => {
    setColor(next);
    if (size && stockFor(size, next) <= 0) setSize(null);
  };
  const available = size && color ? stockFor(size, color) : Infinity;
  const variant = size && color ? product.variants?.find((v) => v.size === size && v.color === color) : undefined;
  const lineId = variant?.id ?? null;
  const qty = useCartItem(lineId)?.qty ?? 0;
  const inCart = qty > 0;

  const addToCart = () => {
    if (missing || !size || !color) {
      setTriedToAdd(true);
      return;
    }
    if (available <= 0) return; // sold out: the pills and swatches are disabled, this is the backstop
    if (!variant) return;
    addItem(product, variant.id, size, color, 1, variant.stock);
    track('add_to_cart', { category: product.category ?? 'unknown' });
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
        // aria-hidden covers web; the other two are the iOS and Android equivalents.
        aria-hidden={tryOn !== null}
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
                  onPress={() => (TRYON_ENABLED ? setTryOnOpen(true) : setSoonOpen(true))}
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
                  <SizePills sizes={product.allSizes ?? product.sizes} selected={size} onSelect={pickSize} isDisabled={sizeSoldOut} />
                </View>
                <View className="items-end">
                  <Text className="text-xs text-primary-hover">Select color</Text>
                  <ColorSwatches colors={product.colors} selected={color} onSelect={pickColor} isDisabled={colorSoldOut} />
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
                <QuantityStepper value={qty} max={maxQtyFor({ stock: variant?.stock })} onChange={setQty} />
              ) : (
                <Button label="Add to cart" icon="cartLight" fullWidth={false} onPress={addToCart} />
              )}
            </View>

            <View className="pt-4">
              <SimilarProducts product={product} />
            </View>
            <ReportListing product={product} />
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

      <ComingSoonSheet feature="tryon" visible={soonOpen} onClose={() => setSoonOpen(false)} />

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
          onSelectSize={pickSize}
          onSelectColor={pickColor}
          inCart={inCart}
          qty={qty}
          onAddToCart={addToCart}
          onClose={() => setTryOn(null)}
        />
      ) : null}
    </View>
  );
}

/** "Report this listing": opens the shopper's email app addressed to Rack, with the product named in the subject. */
function ReportListing({ product }: { product: ProductDetail }) {
  if (!REPORT_EMAIL) return null;
  const subject = encodeURIComponent(`Report listing: ${product.name} (${product.id})`);
  const body = encodeURIComponent(`Listing: ${product.name} by ${product.vendorName}\nProduct id: ${product.id}\n\nWhat is wrong with it?\n`);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Report the listing ${product.name}`}
      onPress={() => void Linking.openURL(`mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`)}
      className="min-h-11 items-center justify-center">
      <Text className="text-xs text-primary-hover underline">Report this listing</Text>
    </Pressable>
  );
}
