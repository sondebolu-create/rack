import { Fragment } from 'react';
import { Linking, View } from 'react-native';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import type { LegalBlock, LegalDoc } from '@/lib/legal/types';

const EMAIL = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/;

/** One run of plain text, with any email address turned into a tap-to-email link. */
function WithLinks({ text, bold }: { text: string; bold: boolean }) {
  return (
    <>
      {text.split(EMAIL).map((part, i) =>
        i % 2 === 1 ? (
          <Text
            key={i}
            accessibilityRole="link"
            weight={bold ? 'bold' : 'regular'}
            className="underline"
            onPress={() => void Linking.openURL(`mailto:${part}`)}>
            {part}
          </Text>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Text with **bold** runs and email links. Nests inside a Text so it wraps as one paragraph. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('**').map((chunk, i) =>
        i % 2 === 1 ? (
          <Text key={i} weight="bold">
            <WithLinks text={chunk} bold />
          </Text>
        ) : (
          <WithLinks key={i} text={chunk} bold={false} />
        ),
      )}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('p' in block) {
    return (
      <Text>
        <Rich text={block.p} />
      </Text>
    );
  }
  if ('ul' in block) {
    return (
      <View className="gap-1.5">
        {block.ul.map((item, i) => (
          <View key={i} className="flex-row gap-2 pl-1">
            <Text accessible={false}>•</Text>
            <Text className="flex-1">
              <Rich text={item} />
            </Text>
          </View>
        ))}
      </View>
    );
  }
  // Tables stack into one card per row: the app is phone-width everywhere, so side-by-side columns don't fit.
  const { head, rows } = block.table;
  return (
    <View className="gap-2">
      {rows.map((row, r) => (
        <View key={r} accessible className="gap-1 rounded-lg bg-card p-3">
          <Text weight="medium">{row[0]}</Text>
          {row.slice(1).map((cell, c) => (
            <Text key={c} className="text-primary-hover">
              <Text weight="medium" className="text-primary-hover">
                {head[c + 1]}:{' '}
              </Text>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Layout for Terms and Privacy: title, "Last updated", then the numbered sections as h2 headings. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <Screen back scroll accessibilityLabel={doc.title}>
      <View className="gap-5 pt-2">
        <View className="gap-1">
          <Text weight="medium" accessibilityRole="header" aria-level={1} className="text-xl">
            {doc.title}
          </Text>
          <Text className="text-primary-hover">Last updated: {doc.updated}</Text>
        </View>
        {doc.intro?.map((p, i) => (
          <Text key={i}>
            <Rich text={p} />
          </Text>
        ))}
        {doc.sections.map((s) => (
          <View key={s.heading} className="gap-2">
            <Text weight="medium" accessibilityRole="header" aria-level={2} className="text-lg">
              {s.heading}
            </Text>
            {s.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </View>
        ))}
        <LegalFooter />
      </View>
    </Screen>
  );
}
