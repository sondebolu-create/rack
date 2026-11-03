import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ImageSource } from '@/lib/types';

export type PhotoSource = 'library' | 'camera';

/**
 * Lets the shopper choose a photo from the library or take one with the system camera.
 * (This is the OS camera sheet, not a live in-app camera, which is out of the MVP.)
 * Resolves to null when they cancel or deny access.
 */
export async function pickPhoto(from: PhotoSource): Promise<ImageSource | null> {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };

  if (from === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Allow camera access in Settings to take a photo for RackGPT.');
      return null;
    }
  }

  const result =
    from === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets[0]) return null;
  return { uri: result.assets[0].uri };
}
