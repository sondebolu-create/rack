import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { cssInterop } from 'nativewind';
import { pickPhoto } from '@/components/rackgpt/pickPhoto';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { ImageSource, ProductDetail, Size } from '@/lib/types';
import { colors } from '@/theme';
import { BackButton } from './BackButton';
import { Corners } from './Corners';
import { DarkColorSwatches, DarkSizeChips } from './DarkPickers';

// Lets CameraView take Tailwind classes.
cssInterop(CameraView, { className: 'style' });

export type CameraStepProps = {
  product: ProductDetail;
  size: Size | null;
  color: string | null;
  onSelectSize: (size: Size) => void;
  onSelectColor: (name: string) => void;
  /** Which product photo is laid over the shopper's photo. */
  overlayIndex: number;
  onSelectOverlay: (index: number) => void;
  /** True when the shopper chose "Capture Image", so the camera permission prompt can show straight away. */
  askForCamera: boolean;
  onPhoto: (photo: ImageSource) => void;
  onClose: () => void;
};

/** Delay so the iOS permission alert does not collide with the AR Try On sheet sliding away. */
const PROMPT_DELAY_MS = 450;

/** Try-on camera (Figma 318:4681): live front camera, photo picker, size and colour, capture. */
export function CameraStep({
  product,
  size,
  color,
  onSelectSize,
  onSelectColor,
  overlayIndex,
  onSelectOverlay,
  askForCamera,
  onPhoto,
  onClose,
}: CameraStepProps) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('front');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = permission?.status;
  useEffect(() => {
    if (!askForCamera || status !== 'undetermined') return;
    const t = setTimeout(() => void requestPermission(), PROMPT_DELAY_MS);
    return () => clearTimeout(t);
  }, [askForCamera, status, requestPermission]);

  // Coming back from Settings does not re-render by itself, so re-read the permission when the app returns.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  const granted = permission?.granted === true;

  const capture = async () => {
    if (!granted || !ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const picture = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
      if (picture) onPhoto({ uri: picture.uri });
      else setError("Couldn't take the photo. Try again.");
    } catch {
      setError("Couldn't take the photo. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    const photo = await pickPhoto('library');
    if (photo) onPhoto(photo);
  };

  const flip = () => {
    setReady(false);
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
  };

  return (
    <View className="flex-1 px-6">
      <BackButton onPress={onClose} />

      <View className="mt-5 flex-1">
        <Corners>
          {permission === null ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.inverse} accessibilityLabel="Checking camera access" />
            </View>
          ) : granted ? (
            <CameraView
              ref={cameraRef}
              facing={facing}
              onCameraReady={() => setReady(true)}
              onMountError={() => setError('The camera could not start. Try Upload instead.')}
              accessibilityLabel={`${facing === 'front' ? 'Front' : 'Back'} camera preview`}
              className="flex-1"
            />
          ) : (
            <PermissionPanel canAskAgain={permission.canAskAgain} onAllow={() => void requestPermission()} onUpload={upload} />
          )}
        </Corners>
      </View>

      <View accessibilityLabel="Product photo to try on" className="mt-5 flex-row justify-center gap-2">
        {product.gallery.map((g, i) => {
          const on = i === overlayIndex;
          return (
            <Pressable
              key={i}
              accessibilityRole="radio"
              accessibilityLabel={`Photo ${i + 1} of ${product.gallery.length}: ${g.alt}`}
              accessibilityState={{ checked: on }}
              onPress={() => onSelectOverlay(i)}
              className={`h-[65px] w-20 overflow-hidden rounded ${on ? 'border border-inverse' : ''}`}>
              <Image source={g.source} accessibilityLabel={g.alt} contentFit="cover" className="h-full w-full" />
              {on ? (
                <View accessible={false} className="absolute inset-0 items-center justify-center bg-black/70">
                  <Icon name="check" size={12} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View className="mt-4 gap-1">
        <Text className="text-xs text-disabled">Select color</Text>
        <DarkColorSwatches colors={product.colors} selected={color} onSelect={onSelectColor} />
        <Text className="text-xs text-disabled">Select size</Text>
        <DarkSizeChips sizes={product.sizes} selected={size} onSelect={onSelectSize} />
      </View>

      {error ? (
        <Text accessibilityLiveRegion="polite" className="mt-2 text-center text-xs text-inverse">
          {error}
        </Text>
      ) : null}

      <View className="mb-2 mt-3 flex-row items-start justify-between">
        <RoundAction icon="uploadLight" iconSize={24} label="Upload" accessibilityLabel="Upload from media" onPress={upload} />
        <RoundAction
          icon="cameraLight"
          iconSize={24}
          label="Tap to save photo"
          accessibilityLabel={granted ? 'Take photo' : 'Take photo, unavailable until camera access is allowed'}
          disabled={!granted || !ready || busy}
          onPress={capture}
        />
        <RoundAction
          icon="flipCamera"
          iconSize={20}
          label="Flip"
          accessibilityLabel={`Switch to ${facing === 'front' ? 'back' : 'front'} camera`}
          disabled={!granted}
          onPress={flip}
        />
      </View>
    </View>
  );
}

/** 56pt round button with a caption under it (Figma 318:4724, 318:4726). */
function RoundAction({
  icon,
  iconSize,
  label,
  accessibilityLabel,
  disabled = false,
  onPress,
}: {
  icon: IconName;
  iconSize: number;
  label: string;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View className="w-14 items-center gap-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className={`h-14 w-14 items-center justify-center rounded-full border-[0.5px] border-cam-line bg-cam-button ${disabled ? 'opacity-50' : ''}`}>
        <Icon name={icon} size={iconSize} />
      </Pressable>
      <Text accessible={false} className="w-24 text-center text-xs text-muted">
        {label}
      </Text>
    </View>
  );
}

/** Shown in the viewfinder until camera access is granted. Upload still works without it. */
function PermissionPanel({
  canAskAgain,
  onAllow,
  onUpload,
}: {
  canAskAgain: boolean;
  onAllow: () => void;
  onUpload: () => void;
}) {
  return (
    <View accessible accessibilityLiveRegion="polite" className="flex-1 items-center justify-center gap-3 px-4">
      <Text weight="medium" className="text-center text-base text-inverse">
        {canAskAgain ? 'Allow camera access' : 'Camera access is off'}
      </Text>
      <Text className="text-center text-inverse">
        {canAskAgain
          ? 'Rack needs your camera to show how this piece looks on you.'
          : 'Turn on camera access for Rack in Settings, or upload a photo from your media instead.'}
      </Text>
      {canAskAgain ? (
        <Button label="Allow camera" fullWidth={false} onPress={onAllow} />
      ) : (
        <Button label="Open Settings" fullWidth={false} onPress={() => void Linking.openSettings()} />
      )}
      <Button label="Upload from media" variant="secondary" fullWidth={false} onPress={onUpload} />
    </View>
  );
}
