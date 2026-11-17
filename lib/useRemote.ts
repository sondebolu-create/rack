import { useEffect, useState } from 'react';

/** Loads once per `key`, and again when the key changes. `loading` is true until that key has answered. */
export function useRemote<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<{ key: string; data: T } | null>(null);
  useEffect(() => {
    let live = true;
    void load().then((data) => {
      if (live) setState({ key, data });
    });
    return () => {
      live = false;
    };
    // `load` is a fresh closure every render; the key stands for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const ready = state?.key === key;
  return { loading: !ready, data: ready ? state.data : undefined };
}
