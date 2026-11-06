import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { ImageSource, ProductDetail, Size } from '@/lib/types';
import { CameraStep } from './CameraStep';
import { ResultStep } from './ResultStep';

export type TryOnFlowProps = {
  product: ProductDetail;
  /** Set when the shopper picked "Upload from media" in the sheet, so the flow opens on the result. */
  initialPhoto: ImageSource | null;
  /** The size and colour live on the product screen, so the cart sees what was picked here. */
  size: Size | null;
  color: string | null;
  onSelectSize: (size: Size) => void;
  onSelectColor: (name: string) => void;
  inCart: boolean;
  qty: number;
  /** The product screen's own add-to-cart. */
  onAddToCart: () => void;
  onClose: () => void;
};

/**
 * M5 v0 try-on: camera (Figma 318:4681) then result (318:4736). It covers the product screen as an overlay
 * rather than a second Modal, because iOS cannot present a Modal while the AR Try On sheet is still sliding away.
 */
export function TryOnFlow({
  product,
  initialPhoto,
  size,
  color,
  onSelectSize,
  onSelectColor,
  inCart,
  qty,
  onAddToCart,
  onClose,
}: TryOnFlowProps) {
  const [photo, setPhoto] = useState<ImageSource | null>(initialPhoto);
  const [overlayIndex, setOverlayIndex] = useState(0);

  // Back on the result returns to the camera step, and back on the camera step leaves the flow.
  const back = () => (photo ? setPhoto(null) : onClose());
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      back();
      return true;
    });
    return () => sub.remove();
  });

  const missing = size === null ? 'a size' : color === null ? 'a colour' : null;

  const addToCart = () => {
    onAddToCart();
    // The product screen now shows the stepper and checkout bar, which is the confirmation.
    onClose();
  };

  return (
    <View accessibilityViewIsModal aria-modal className="absolute inset-0 z-50 bg-black">
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">
        {photo ? (
          <ResultStep
            product={product}
            photo={photo}
            overlayIndex={overlayIndex}
            missing={missing}
            inCart={inCart}
            qty={qty}
            onAddToCart={addToCart}
            onBack={back}
          />
        ) : (
          <CameraStep
            product={product}
            size={size}
            color={color}
            onSelectSize={onSelectSize}
            onSelectColor={onSelectColor}
            overlayIndex={overlayIndex}
            onSelectOverlay={setOverlayIndex}
            askForCamera={initialPhoto === null}
            onPhoto={setPhoto}
            onClose={onClose}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
