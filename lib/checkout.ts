import { create } from 'zustand';
import type { CardSummary } from '@/lib/card';

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'card' | 'transfer';

export type Address = { id: string; line1: string; line2: string };

// TEMPORARY address book (M7). Replaced by the shopper's saved addresses once Supabase has them.
const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-1', line1: '90, ifekowajo street via kemta', line2: 'Lagos' },
  { id: 'addr-2', line1: '14 Admiralty Way, Lekki Phase 1', line2: 'Lekki, Lagos' },
  { id: 'addr-3', line1: '7 Allen Avenue', line2: 'Ikeja, Lagos' },
];

type CheckoutState = {
  delivery: DeliveryMethod;
  addresses: Address[];
  addressId: string | null;
  payment: PaymentMethod;
  /** Brand and last 4 only. The full card number and CVV never leave the form. */
  card: CardSummary | null;

  setDelivery: (m: DeliveryMethod) => void;
  selectAddress: (id: string) => void;
  /** Saves a typed address, selects it and returns it. */
  addAddress: (line1: string) => Address;
  setPayment: (m: PaymentMethod) => void;
  setCard: (card: CardSummary | null) => void;
  reset: () => void;
};

/** The choices made on Checkout, read again on Review Order (M7, M8). */
export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  delivery: 'delivery',
  addresses: MOCK_ADDRESSES,
  addressId: null,
  payment: 'card',
  card: null,

  setDelivery: (delivery) => set({ delivery }),
  selectAddress: (addressId) => set({ addressId }),
  addAddress: (line1) => {
    const address: Address = { id: `addr-${get().addresses.length + 1}-${Date.now()}`, line1: line1.trim(), line2: '' };
    set((s) => ({ addresses: [address, ...s.addresses], addressId: address.id }));
    return address;
  },
  setPayment: (payment) => set({ payment }),
  setCard: (card) => set({ card }),
  // Keeps the address book; clears what belongs to one order.
  reset: () => set({ delivery: 'delivery', addressId: null, payment: 'card', card: null }),
}));

export function useSelectedAddress(): Address | null {
  return useCheckoutStore((s) => s.addresses.find((a) => a.id === s.addressId) ?? null);
}
