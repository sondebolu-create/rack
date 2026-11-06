import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckoutBar } from '@/components/product/CheckoutBar';
import { Composer } from '@/components/rackgpt/Composer';
import { EmptyState } from '@/components/rackgpt/EmptyState';
import { ProcessingPanel } from '@/components/rackgpt/ProcessingPanel';
import { ResultsView } from '@/components/rackgpt/ResultsView';
import { UserMessage } from '@/components/rackgpt/UserMessage';
import { useRackgptSession } from '@/components/rackgpt/useRackgptSession';
import { Icon } from '@/components/ui/Icon';
import { KeyboardAvoid } from '@/components/ui/KeyboardAvoid';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useCartTotals } from '@/lib/cart';

/**
 * RackGPT (G1-G4): empty, attachment, analyzing, results. Figma 318:1332, 318:2424, 318:2975, 318:3038, 318:3111.
 * Processing and matches are mock until the vision model and pgvector land in Week 2.
 */
export default function RackGpt() {
  const s = useRackgptSession();
  const router = useRouter();
  const totals = useCartTotals();

  return (
    <Screen back accessibilityLabel="RackGPT">
      <KeyboardAvoid>
        <View className="-mx-4 flex-row items-center justify-between border-b border-line px-4 pb-4 pt-2">
          <Text className="text-xl" accessibilityRole="header">
            RackGPT
          </Text>
          {s.phase === 'results' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit request"
              hitSlop={{ top: 14, bottom: 14, left: 8, right: 8 }}
              onPress={s.editRequest}
              className="flex-row items-center gap-1 border-b border-interactive pb-0.5 pt-1">
              <Icon name="pencil" size={12} />
              <Text className="text-xs text-interactive">Edit Request</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={`pt-4 pb-4 gap-4 ${s.phase === 'compose' ? 'flex-grow justify-center' : ''}`}>
          {s.phase === 'compose' ? <EmptyState /> : null}
          {s.phase === 'analyzing' && s.request ? (
            <>
              <UserMessage request={s.request} />
              <ProcessingPanel step={s.step} hasImage={s.request.attachment !== null} />
            </>
          ) : null}
          {s.phase === 'results' && s.request ? (
            <ResultsView request={s.request} matches={s.matches} />
          ) : null}
        </ScrollView>

        {/* G4: once something is in the cart, results show the running total and a way to check out. */}
        {s.phase === 'results' && totals.count > 0 ? (
          <View className="pb-2">
            <CheckoutBar
              inline
              totalMinor={totals.subtotalMinor}
              currency={totals.currency}
              // Same as Product Detail: the cart, where "Proceed" starts checkout.
              onCheckout={() => router.push('/cart')}
            />
          </View>
        ) : null}

        {s.phase !== 'results' ? (
          <View className="pb-2">
            <Composer
              value={s.draft}
              onChangeText={s.setDraft}
              attachment={s.attachment}
              onAttach={s.attach}
              onRemoveAttachment={s.removeAttachment}
              canSend={s.canSend}
              onSend={s.submit}
              disabled={s.phase === 'analyzing'}
            />
          </View>
        ) : null}
      </KeyboardAvoid>
    </Screen>
  );
}
