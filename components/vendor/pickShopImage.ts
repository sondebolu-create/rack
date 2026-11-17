import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '@/components/vendor/compressImage';
import type { ShopImageKind } from '@/lib/shop';

/** Logo is square; the banner is wide. Same ratios as the web version, which crops to them. */
export const ASPECT: Record<ShopImageKind, [number, number]> = { logo: [1, 1], banner: [8, 3] };

/** Long edge in pixels after compression: a 512 square logo, a 1600 wide banner. */
const MAX_EDGE: Record<ShopImageKind, number> = { logo: 512, banner: 1600 };

/**
 * Picks a photo and lets the vendor crop it to the right shape with the system editor, then shrinks it and
 * re-encodes it as JPEG. Resolves to a local uri, or null if cancelled or denied.
 */
export async function pickShopImage(kind: ShopImageKind): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Photo access needed', 'Allow photo access in Settings to add your shop images.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: ASPECT[kind],
    quality: 1, // compressed once, below, not twice
  });
  const asset = result.assets?.[0];
  if (result.canceled || !asset) return null;
  return compressImage(asset.uri, asset.width, asset.height, MAX_EDGE[kind]);
}
