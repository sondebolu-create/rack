import { View } from 'react-native';
import { Image } from '@/components/ui/Image';
import { Text } from '@/components/ui/Text';
import type { OutfitMatch } from '@/lib/types';
import { MatchCard } from './MatchCard';
import type { Request } from './useRackgptSession';

export type ResultsViewProps = {
  request: Request;
  matches: OutfitMatch[];
  added: ReadonlySet<string>;
  onToggleAdded: (id: string) => void;
};

/** G3: what the shopper asked for, then the matches. */
export function ResultsView({ request, matches, added, onToggleAdded }: ResultsViewProps) {
  const n = matches.length;
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
        <MatchCard key={m.id} match={m} added={added.has(m.id)} onToggleAdded={() => onToggleAdded(m.id)} />
      ))}
    </View>
  );
}
