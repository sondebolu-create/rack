import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AddressSheet } from '@/components/checkout/AddressSheet';
import { CardForm } from '@/components/checkout/CardForm';
import { FlowScreen } from '@/components/checkout/FlowScreen';
import { IconBadge } from '@/components/checkout/PinBadge';
import { RadioRow } from '@/components/checkout/Radio';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { internationalDigits } from '@/lib/phone';
import { useProfile } from '@/lib/queries/profile';
import { RESERVE_NOTE } from '@/lib/copy';
import { PAYMENTS_ENABLED } from '@/lib/flags';
import { Text } from '@/components/ui/Text';
import { summariseCard, validateCard, type CardErrors, type CardFields } from '@/lib/card';
import { useCartStore } from '@/lib/cart';
import { useCheckoutStore, useSelectedAddress } from '@/lib/checkout';

const EMPTY_CARD: CardFields = { name: '', number: '', expiry: '', cvv: '' };

/** M7 Checkout. Figma 318:4303 (no address yet) and 318:4342 (address chosen). Payment is mock. */
export default function Checkout() {
  const router = useRouter();
  const hasItems = useCartStore((s) => s.items.length > 0);
  const { delivery, payment, setDelivery, setPayment, setCard, contactName, contactPhone, setContact } = useCheckoutStore();
  const profile = useProfile();
  const [contactErrors, setContactErrors] = useState<{ name?: string; phone?: string }>({});
  // Prefill name and phone from the profile once, and never over something the shopper already typed.
  useEffect(() => {
    const p = profile.data;
    if (p && !contactName && !contactPhone) setContact({ name: p.full_name ?? '', phone: p.phone ?? '' });
  }, [profile.data, contactName, contactPhone, setContact]);
  const address = useSelectedAddress();

  const [sheetOpen, setSheetOpen] = useState(false);
  // The full card number and CVV live here only. They are not put in a store or in the order.
  const [card, setCardFields] = useState<CardFields>(EMPTY_CARD);
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [tried, setTried] = useState(false);

  const needsAddress = delivery === 'delivery' && address === null;

  const review = () => {
    setTried(true);
    const errors = PAYMENTS_ENABLED && payment === 'card' ? validateCard(card) : {};
    setCardErrors(errors);
    const contact: { name?: string; phone?: string } = {};
    if (contactName.trim().length < 2) contact.name = 'Enter the name for this order.';
    if (!internationalDigits(contactPhone)) contact.phone = 'Enter a phone number the seller can call, like 0803 123 4567.';
    setContactErrors(contact);
    if (needsAddress || Object.keys(errors).length > 0 || Object.keys(contact).length > 0) return;
    setCard(PAYMENTS_ENABLED && payment === 'card' ? summariseCard(card) : null);
    router.push('/review');
  };

  if (!hasItems) {
    return (
      <FlowScreen title={PAYMENTS_ENABLED ? 'Checkout' : 'Reserve'}>
        <Text>Your cart is empty. Add something before you reserve.</Text>
      </FlowScreen>
    );
  }

  return (
    <FlowScreen
      title={PAYMENTS_ENABLED ? 'Checkout' : 'Reserve'}
      subtitle={PAYMENTS_ENABLED ? undefined : RESERVE_NOTE}
      cta={{ label: PAYMENTS_ENABLED ? 'Review Order' : 'Review Reservation', onPress: review }}>
      {/* Not in Figma: place_order needs a name and a phone number, and the seller calls or WhatsApps it to arrange delivery. */}
      <View className="gap-3">
        <Text weight="medium">Contact</Text>
        <Input
          label="Full name"
          value={contactName}
          onChangeText={(name) => {
            setContact({ name });
            setContactErrors({});
          }}
          error={contactErrors.name}
          autoComplete="name"
          textContentType="name"
        />
        <Input
          label="Phone number"
          value={contactPhone}
          onChangeText={(phone) => {
            setContact({ phone });
            setContactErrors({});
          }}
          error={contactErrors.phone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
      </View>

      <View className="gap-2">
        <Text weight="medium">Delivery method</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Delivery method" className="rounded-md bg-card px-4 py-1">
          <RadioRow label="Store pick-up" checked={delivery === 'pickup'} onPress={() => setDelivery('pickup')} />
          <RadioRow label="Door-step delivery" checked={delivery === 'delivery'} onPress={() => setDelivery('delivery')} />
        </View>
      </View>

      {delivery === 'delivery' ? (
        <View className="gap-4">
          <Text weight="medium">Delivery address</Text>
          {address ? (
            <View accessible className="flex-row items-start gap-2.5">
              <IconBadge />
              <Text className="flex-1 text-muted">{address.line1}</Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={address ? 'Add New Address' : 'Add Address'}
            onPress={() => setSheetOpen(true)}
            className="h-[50px] flex-row items-center justify-center gap-2.5 rounded-md border-[0.5px] border-muted px-4">
            <Text weight="medium">{address ? 'Add New Address' : 'Add Address'}</Text>
            <Icon name="plusDark" size={20} />
          </Pressable>
          {tried && needsAddress ? (
            <Text accessibilityRole="alert" className="text-xs text-danger">
              Add a delivery address to continue.
            </Text>
          ) : null}
        </View>
      ) : null}

      {PAYMENTS_ENABLED ? (
      <View className="gap-4">
        <Text weight="medium">Payment Method</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Payment method">
          <RadioRow large label="Debit or Credit Card" checked={payment === 'card'} onPress={() => setPayment('card')} />
          <RadioRow large label="Bank Transfer" checked={payment === 'transfer'} onPress={() => setPayment('transfer')} />
        </View>
        {payment === 'card' ? (
          <CardForm value={card} onChange={setCardFields} errors={cardErrors} />
        ) : (
          <Text className="text-muted">You will get the bank details after you place your order.</Text>
        )}
      </View>
      ) : null}

      <AddressSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </FlowScreen>
  );
}
