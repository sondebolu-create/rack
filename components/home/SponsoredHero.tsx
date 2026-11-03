import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SizePills } from '@/components/product/SizePills';
import { Icon } from '@/components/ui/Icon';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import { formatPrice } from '@/lib/format';
import type { SponsoredLook } from '@/lib/types';

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-muted">{label}</Text>
      {children}
    </View>
  );
}

/** Sponsored look: big photo card on the left, quick facts and "Go to Product" on the right. */
export function SponsoredHero({ look }: { look: SponsoredLook }) {
  const router = useRouter();
  return (
    <View className="flex-row gap-3">
      <View className="flex-1 rounded-md border border-line bg-card p-2">
        <View>
          <Image
            source={look.image}
            accessibilityLabel={look.imageAlt}
            contentFit="cover"
            className="aspect-square w-full rounded-xl"
          />
          <View className="absolute left-2.5 top-2.5 flex-row items-center gap-1 rounded-md border border-line bg-ink/40 px-2 py-1">
            <Text className="text-xs text-inverse">Sponsored</Text>
            <Icon name="sparkle" size={12} />
          </View>
          <View className="absolute bottom-2.5 left-2.5 rounded-md border border-line bg-ink/50 px-2 py-1">
            <Text className="text-lg text-inverse">{formatPrice(look.priceMinor, look.currency)}</Text>
          </View>
        </View>
      </View>

      <View className="w-[100px] justify-between">
        <Fact label="Brand">
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${look.vendorName} store`}
            hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
            onPress={() => router.push(`/store/${look.vendorId}`)}
            className="self-start">
            <Text weight="medium" className="text-xs underline">
              {look.vendorName}
            </Text>
          </Pressable>
        </Fact>
        <Fact label="Dress Type">
          <Text className="text-xs text-primary-hover">{look.dressType}</Text>
        </Fact>
        <Fact label="Available Sizes">
          <SizePills sizes={look.sizes} />
        </Fact>
        <Fact label="Location">
          <Text className="text-xs text-primary-hover">{look.location}</Text>
        </Fact>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Go to product: ${look.name}`}
          onPress={() => router.push(`/product/${look.id}`)}
          className="min-h-11 flex-row items-center self-stretch border-b border-ink">
          <Text className="text-base">Go to Product</Text>
          <Icon name="arrowUpRight" size={16} />
        </Pressable>
      </View>
    </View>
  );
}
