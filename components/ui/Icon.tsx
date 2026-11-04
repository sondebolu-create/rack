import { Image as ExpoImage } from 'expo-image';

// Figma SVGs, bundled under assets/icons and drawn by expo-image (no react-native-svg).
// Stroke colours are baked into the files, so there is no tint prop.
const ICONS = {
  search: require('@/assets/icons/search.svg'),
  sliders: require('@/assets/icons/sliders.svg'),
  cart: require('@/assets/icons/cart-button.svg'),
  sparkle: require('@/assets/icons/sparkle.svg'),
  sparkleMuted: require('@/assets/icons/sparkle-muted.svg'),
  arrowUpRight: require('@/assets/icons/arrow-up-right.svg'),
  arrowRight: require('@/assets/icons/arrow-right.svg'),
  chat: require('@/assets/icons/chat.svg'),
  paperclip: require('@/assets/icons/paperclip.svg'),
  camera: require('@/assets/icons/camera.svg'),
  send: require('@/assets/icons/send.svg'),
  x: require('@/assets/icons/x.svg'),
  plus: require('@/assets/icons/plus.svg'),
  pencil: require('@/assets/icons/pencil.svg'),
  // Product detail (M4). "Light" icons are for dark backgrounds, "dark" ones for light backgrounds.
  cartLight: require('@/assets/icons/cart-light.svg'),
  minusCircle: require('@/assets/icons/minus-circle.svg'),
  plusCircle: require('@/assets/icons/plus-circle.svg'),
  chevronRight: require('@/assets/icons/chevron-right.svg'),
  cameraDark: require('@/assets/icons/camera-dark.svg'),
  upload: require('@/assets/icons/upload.svg'),
  personStanding: require('@/assets/icons/person-standing.svg'),
  // Try-on camera (M5), drawn in light strokes for the black screen.
  corner: require('@/assets/icons/corner.svg'),
  arrowLeftLight: require('@/assets/icons/arrow-left-light.svg'),
  cameraLight: require('@/assets/icons/camera-light.svg'),
  uploadLight: require('@/assets/icons/upload-light.svg'),
  check: require('@/assets/icons/check.svg'),
  flipCamera: require('@/assets/icons/flip-camera.svg'),
  // Cart, checkout and order tracking (M6-M9). "Dark" icons are for light backgrounds.
  minusCircleDark: require('@/assets/icons/minus-circle-dark.svg'),
  plusCircleDark: require('@/assets/icons/plus-circle-dark.svg'),
  plusDark: require('@/assets/icons/plus-dark.svg'),
  calendar: require('@/assets/icons/calendar.svg'),
  lock: require('@/assets/icons/lock.svg'),
  mapPin: require('@/assets/icons/map-pin.svg'),
  creditCard: require('@/assets/icons/credit-card.svg'),
  checkBig: require('@/assets/icons/check-big.svg'),
  receipt: require('@/assets/icons/receipt.svg'),
  dotOff: require('@/assets/icons/dot-off.svg'),
  dotOn: require('@/assets/icons/dot-on.svg'),
};

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size: number;
  /** Omit for decorative icons that sit inside an already-labelled control. */
  accessibilityLabel?: string;
  /** Recolours the icon (expo-image tint). For dynamic colours only, such as a check on a product-coloured dot. */
  tintColor?: string;
};

export function Icon({ name, size, accessibilityLabel, tintColor }: IconProps) {
  return (
    <ExpoImage
      source={ICONS[name]}
      contentFit="contain"
      tintColor={tintColor}
      // Dynamic size, so it is the one place a style object is allowed.
      style={{ width: size, height: size }}
      accessible={accessibilityLabel !== undefined}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
