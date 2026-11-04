import { create } from 'zustand';
import type { ImageSource } from '@/lib/types';

export type Request = { text: string; attachment: ImageSource | null };

type RackgptState = {
  /** True while the shopper is writing a request; false once it has been sent. */
  composing: boolean;
  draft: string;
  attachment: ImageSource | null;
  /** The request that was last sent. */
  request: Request | null;
  /** Index of the active processing step. Equal to the step count when all are done. */
  step: number;

  setDraft: (text: string) => void;
  setAttachment: (source: ImageSource | null) => void;
  /** Send the current draft and photo, and start processing. */
  submit: () => void;
  /** Move to the next processing step. */
  advance: () => void;
  /** Back to the composer with the last request filled in. */
  editRequest: () => void;
};

/**
 * RackGPT session (G1-G4). Local UI state only; nothing here is persisted or sent to the server.
 * What is "Added" is not kept here: it is read from the cart store.
 */
export const useRackgptStore = create<RackgptState>((set, get) => ({
  composing: true,
  draft: '',
  attachment: null,
  request: null,
  step: 0,

  setDraft: (draft) => set({ draft }),
  setAttachment: (attachment) => set({ attachment }),

  submit: () => {
    const { draft, attachment } = get();
    if (draft.trim().length === 0 && attachment === null) return;
    set({
      request: { text: draft.trim(), attachment },
      draft: '',
      attachment: null,
      step: 0,
      composing: false,
    });
  },

  advance: () => set((s) => ({ step: s.step + 1 })),

  editRequest: () => {
    const { request } = get();
    set({
      composing: true,
      ...(request ? { draft: request.text, attachment: request.attachment } : {}),
    });
  },
}));
