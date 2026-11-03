import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';

export type TryOnMethod = 'capture' | 'upload';

export type TryOnSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Called with the chosen method. The try-on camera and result screens (M5) hook in here. */
  onProceed: (method: TryOnMethod) => void;
};

const OPTIONS: { method: TryOnMethod; title: string; body: string; icon: IconName; iconSize: number }[] = [
  {
    method: 'capture',
    title: 'Capture Image',
    body: 'This allows you preview what the actual product might look like on you',
    icon: 'cameraDark',
    iconSize: 15,
  },
  {
    method: 'upload',
    title: 'Upload from media',
    body: 'You can also upload a picture from your media',
    icon: 'upload',
    iconSize: 15,
  },
];

/** "AR Try On" bottom sheet (Figma 318:4549), opened from "Try it on". */
export function TryOnSheet({ visible, onClose, onProceed }: TryOnSheetProps) {
  const [method, setMethod] = useState<TryOnMethod>('capture');

  return (
    <Sheet visible={visible} title="AR Try On" onClose={onClose}>
      <View className="gap-3 pb-6">
        {/* A tip, not a choice. */}
        <View accessible className="gap-1 px-1">
          <View className="flex-row items-center justify-between">
            <Text>Stand in front of a mirror</Text>
            <Icon name="personStanding" size={17} />
          </View>
          <Text className="text-muted">Images shown are for demonstration, actual sizes may vary.</Text>
        </View>

        <View accessibilityRole="radiogroup" accessibilityLabel="How to add your photo" className="gap-3">
          {OPTIONS.map((o) => {
            const on = o.method === method;
            return (
              <Pressable
                key={o.method}
                accessibilityRole="radio"
                accessibilityLabel={`${o.title}. ${o.body}`}
                accessibilityState={{ checked: on }}
                onPress={() => setMethod(o.method)}
                className={`min-h-11 gap-1 rounded-md border p-3 ${on ? 'border-primary' : 'border-line'}`}>
                <View className="flex-row items-center justify-between">
                  <Text>{o.title}</Text>
                  <Icon name={o.icon} size={o.iconSize} />
                </View>
                <Text className="text-muted">{o.body}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Button label="Proceed" arrow onPress={() => onProceed(method)} />
    </Sheet>
  );
}
