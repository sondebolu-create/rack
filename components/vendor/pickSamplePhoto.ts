import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '@/components/vendor/compressImage';

/**
 * Picks one sample photo from the library, shrinks it to at most 1280px on the long edge and re-encodes it as JPEG.
 * Resolves to a local uri, or null if cancelled or denied.
 */
export async function pickSamplePhoto(maxEdge = 1280): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Photo access needed', 'Allow photo access in Settings to add sample photos.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  const asset = result.assets?.[0];
  if (result.canceled || !asset) return null;
  return compressImage(asset.uri, asset.width, asset.height, maxEdge);
}
