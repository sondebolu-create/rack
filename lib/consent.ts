import { create } from 'zustand';
import { forgetAnonId } from '@/lib/analyticsId';
import { appStorage } from '@/lib/storage';

const KEY = 'rack-analytics-consent';

/** `null` means they haven't been asked yet (or the saved choice hasn't loaded). Analytics sends only on 'granted'. */
export type ConsentChoice = 'granted' | 'denied' | null;

type ConsentState = {
  choice: ConsentChoice;
  /** The saved choice has been read from the device. Until then we don't know whether to ask. */
  hydrated: boolean;
  /** The "Privacy choices" sheet is open. */
  sheetOpen: boolean;
  accept: () => void;
  decline: () => void;
  openChoices: () => void;
  closeChoices: () => void;
};

const save = (v: 'granted' | 'denied') => void appStorage.setItem(KEY, v).catch(() => undefined);

/**
 * The visitor's analytics choice, kept on the device. Nothing is sent to PostHog until it is 'granted'. Declining
 * (or changing your mind later) also deletes the anonymous analytics id from the device.
 */
export const useConsent = create<ConsentState>((set) => ({
  choice: null,
  hydrated: false,
  sheetOpen: false,
  accept: () => {
    save('granted');
    set({ choice: 'granted' });
  },
  decline: () => {
    save('denied');
    void forgetAnonId();
    set({ choice: 'denied' });
  },
  openChoices: () => set({ sheetOpen: true }),
  closeChoices: () => set({ sheetOpen: false }),
}));

/** Reads the saved choice. Call once, in the root layout, on the client. */
export async function hydrateConsent() {
  let saved: string | null = null;
  try {
    saved = await appStorage.getItem(KEY);
  } catch {}
  useConsent.setState({ choice: saved === 'granted' || saved === 'denied' ? saved : null, hydrated: true });
}
