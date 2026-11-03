import { View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';

/** G1: illustration plus a one-line hint, centred above the composer. */
export function EmptyState() {
  return (
    <View className="gap-3">
      <Image
        source={require('@/assets/images/rackgpt-empty.svg')}
        accessibilityLabel="A robot hands a parcel to a woman sitting on a bench"
        contentFit="contain"
        className="aspect-[351/207] w-full"
      />
      <View className="flex-row items-center gap-1.5 rounded-lg border border-line bg-card p-1.5">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-strong" accessible={false}>
          <Icon name="sparkleMuted" size={16} />
        </View>
        <Text className="flex-1 text-base leading-[18px] text-primary-hover">
          You can describe, upload or take a picture of any outfit your choice.
        </Text>
      </View>
    </View>
  );
}
