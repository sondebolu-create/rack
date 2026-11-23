import { appStorage } from '@/lib/storage';

const ID_KEY = 'rack-anon-id';
let cached: Promise<string> | null = null;

/** A random id, made once per device and remembered. It identifies a browser or install, never a person. */
export function getAnonId(): Promise<string> {
  cached ??= (async () => {
    try {
      const saved = await appStorage.getItem(ID_KEY);
      if (saved) return saved;
    } catch {}
    const fresh =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    try {
      await appStorage.setItem(ID_KEY, fresh);
    } catch {}
    return fresh;
  })();
  return cached;
}

/** Deletes the id from the device. Called when someone declines analytics, so nothing is left behind. */
export async function forgetAnonId() {
  cached = null;
  try {
    await appStorage.removeItem(ID_KEY);
  } catch {}
}
