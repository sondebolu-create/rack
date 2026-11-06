import type { ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Keeps shopper screens at phone width (max 480pt), centred on a neutral page background.
 * It does nothing on a phone, where the screen is already narrower than that.
 * Wide layouts (vendor area) use `SidebarLayout` instead and sit outside this frame.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 items-center bg-strong">
      <View className="w-full max-w-[480px] flex-1 bg-surface shadow-sm-strong">{children}</View>
    </View>
  );
}
