import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import type { Request } from './useRackgptSession';
import { AttachmentChip } from './AttachmentChip';

/** The shopper's own request, shown as a right-aligned bubble while it is processed. */
export function UserMessage({ request }: { request: Request }) {
  return (
    <View
      accessible
      accessibilityLabel={`Your request: ${request.text || 'photo only'}`}
      className="max-w-[85%] gap-2.5 self-end rounded-bl-lg rounded-t-lg border border-line bg-card px-3 py-2">
      {request.attachment ? <AttachmentChip source={request.attachment} /> : null}
      {request.text ? <Text className="text-base">{request.text}</Text> : null}
    </View>
  );
}
