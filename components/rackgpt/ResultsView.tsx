import { useState } from 'react';
import { View } from 'react-native';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { OutfitMatch } from '@/lib/types';
import { MatchCard } from './MatchCard';
import { VariantSheet } from './VariantSheet';
import type { Request } from './useRackgptSession';

export type ResultsViewProps = {
  request: Request;
  matches: OutfitMatch[];
};

/** G3: what the shopper asked for, then the matches. */
export function ResultsView({ request, matches }: ResultsViewProps) {
  const n = matches.length;
  const [picking, setPicking] = useState<OutfitMatch | null>(null);
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3 rounded-xl bg-card p-3">
        {request.attachment ? (
          <Image
            source={request.attachment}
            accessibilityLabel="Your uploaded image"
            contentFit="cover"
            className="h-[68px] w-[54px]"
          />
        ) : null}
        <View className="flex-1 gap-1">
          <Text numberOfLines={2}>{request.attachment ? 'Your uploaded image' : request.text}</Text>
          <Text className="text-xs text-primary-hover">
            AI matched {n} similar {n === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      {matches.map((m) => (
        <MatchCard key={m.id} match={m} onAdd={() => setPicking(m)} />
      ))}

      <VariantSheet match={picking} onClose={() => setPicking(null)} />
    </View>
  );
}
