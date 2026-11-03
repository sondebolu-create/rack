import { useCallback, useEffect } from 'react';
import { PROCESSING_STEPS, rackgptMatches } from '@/lib/mock/rackgpt';
import type { OutfitMatch } from '@/lib/types';
import { pickPhoto, type PhotoSource } from './pickPhoto';
import { useRackgptStore } from './store';

export type { Request } from './store';
export type RackgptPhase = 'compose' | 'analyzing' | 'results';

/** How long each processing step stays active. Mock timing until the vision model is wired up. */
export const STEP_MS = 1100;
export const STEP_COUNT = PROCESSING_STEPS.length;

/** What the RackGPT screen needs: the store, the derived phase, the step timer and the photo picker. */
export function useRackgptSession() {
  const s = useRackgptStore();

  const canSend = s.draft.trim().length > 0 || s.attachment !== null;
  // Results are simply "every step is done", so there is no phase to keep in sync.
  const phase: RackgptPhase = s.composing ? 'compose' : s.step >= STEP_COUNT ? 'results' : 'analyzing';

  // Advance one step at a time while analyzing. The store is read directly so the callback stays stable.
  const { advance } = s;
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const t = setTimeout(advance, STEP_MS);
    return () => clearTimeout(t);
  }, [phase, s.step, advance]);

  const attach = useCallback(async (from: PhotoSource) => {
    const photo = await pickPhoto(from);
    if (photo) useRackgptStore.getState().setAttachment(photo);
  }, []);

  const removeAttachment = useCallback(() => useRackgptStore.getState().setAttachment(null), []);

  const matches: OutfitMatch[] = rackgptMatches;

  return {
    phase,
    draft: s.draft,
    setDraft: s.setDraft,
    attachment: s.attachment,
    attach,
    removeAttachment,
    canSend,
    submit: s.submit,
    request: s.request,
    step: s.step,
    matches,
    added: s.added,
    toggleAdded: s.toggleAdded,
    editRequest: s.editRequest,
  };
}
