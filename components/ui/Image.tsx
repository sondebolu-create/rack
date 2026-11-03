import type { ComponentType } from 'react';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import { cssInterop } from 'nativewind';

// Lets expo-image take Tailwind classes. Product and photo images always go through this.
cssInterop(ExpoImage, { className: 'style' });

export type ImageProps = Omit<ExpoImageProps, 'style' | 'accessibilityLabel'> & {
  /** Required: every image needs a description. */
  accessibilityLabel: string;
  className?: string;
};

export const Image = ExpoImage as unknown as ComponentType<ImageProps>;
