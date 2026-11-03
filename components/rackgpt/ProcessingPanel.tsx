import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { PROCESSING_STEPS } from '@/lib/mock/rackgpt';
import { colors } from '@/theme';
import { STEP_COUNT } from './useRackgptSession';

/**
 * G2: progress card plus the four-step checklist. `step` is the active step (0-3).
 * Done steps get a green tick, the active step a dark numbered circle, pending steps a grey one (Figma 318:2975).
 */
export function ProcessingPanel({ step, hasImage }: { step: number; hasImage: boolean }) {
  const active = Math.min(step, STEP_COUNT - 1);
  // Count the active step as half done so the bar never sits at 0%.
  const percent = Math.min(100, Math.round(((step + 0.5) / STEP_COUNT) * 100));

  return (
    <View className="gap-4">
      <View className="gap-4 rounded-md bg-card px-2 py-4">
        <View className="flex-row items-center justify-center gap-3">
          <ActivityIndicator color={colors.ink} />
          <Text>{hasImage ? 'Analyzing your image' : 'Analyzing your request'}</Text>
        </View>
        <Text className="text-center text-primary-hover">{PROCESSING_STEPS[active]}</Text>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Progress"
          accessibilityValue={{ min: 0, max: 100, now: percent }}
          className="h-2 overflow-hidden rounded-full bg-strong">
          {/* Dynamic width, so a style object is allowed here. */}
          <View className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </View>
        <Text className="text-center text-xs text-primary-hover">{percent}%</Text>
      </View>

      <View accessibilityLiveRegion="polite" className="gap-3">
        {PROCESSING_STEPS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'pending';
          return (
            <View
              key={label}
              accessible
              accessibilityLabel={`${label} ${state === 'done' ? 'done' : state === 'active' ? 'in progress' : 'waiting'}`}
              className={`h-9 flex-row items-center gap-3 rounded-xl pl-3 ${
                state === 'active' ? 'bg-card' : state === 'done' ? 'opacity-50' : 'opacity-30'
              }`}>
              <View
                className={`h-6 w-6 items-center justify-center rounded-full ${
                  state === 'done' ? 'bg-success' : state === 'active' ? 'bg-primary' : 'bg-strong'
                }`}>
                <Text className={`text-xs ${state === 'pending' ? 'text-primary-hover' : 'text-inverse'}`}>
                  {state === 'done' ? '✓' : i + 1}
                </Text>
              </View>
              <Text className="text-xs">{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
