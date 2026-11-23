import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { IS_SERVER, appStorage } from '@/lib/storage';

/**
 * Analytics through PostHog's capture API, called directly with fetch. No SDK: the same few lines work on web and
 * iOS, add nothing to the bundle, and set no cookies. Every call site goes through track() and usePageViews().
 *
 * Privacy (Rack handles names, phones and addresses, so the Nigeria Data Protection Act applies):
 *  - Anonymous only. The id is a random string kept on the device. It is never linked to an account, and we never
 *    call identify, so there are no person profiles.
 *  - No autocapture, no session recording, no geolocation lookup. Only the events listed below.
 *  - Never put an email, name, phone number, address, or user/order id in `props`. Counts and categories only.
 *  - Nothing is sent when the browser's Do Not Track is on, or when no key is configured.
 *
 * Turn it on with EXPO_PUBLIC_POSTHOG_KEY (the project API key: it is public by design) and, if your project is not
 * on the EU cloud, EXPO_PUBLIC_POSTHOG_HOST. Also switch on "Discard client IP data" in the PostHog project settings.
 */
export type AnalyticsEvent =
  | 'sign_up'
  | 'vendor_application_submitted'
  | 'add_to_cart'
  | 'reservation_placed'
  | 'waitlist_signup';

type Props = Record<string, string | number | boolean>;

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim();
const HOST = (process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || 'https://eu.i.posthog.com').replace(/\/+$/, '');
const ID_KEY = 'rack-anon-id';

let anonId: Promise<string> | null = null;

/** A random id, made once per device and remembered. It identifies a browser or install, never a person. */
function getAnonId(): Promise<string> {
  anonId ??= (async () => {
    try {
      const saved = await appStorage.getItem(ID_KEY);
      if (saved) return saved;
    } catch {}
    const fresh = globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    try {
      await appStorage.setItem(ID_KEY, fresh);
    } catch {}
    return fresh;
  })();
  return anonId;
}

const doNotTrack = () => Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.doNotTrack === '1';

function send(event: string, props: Props = {}) {
  if (__DEV__) console.debug('[analytics]', event, props);
  // Nothing on the web server (it renders pages, it isn't a visitor), without a key, or if they asked not to be tracked.
  if (IS_SERVER || !KEY || doNotTrack()) return;
  void getAnonId().then((distinct_id) =>
    fetch(`${HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        api_key: KEY,
        event,
        distinct_id,
        properties: {
          ...props,
          platform: Platform.OS,
          $process_person_profile: false, // events only: no person profile is created
          $geoip_disable: true,
          $lib: 'rack-http',
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => undefined), // analytics must never break the app
  );
}

export function track(event: AnalyticsEvent, props?: Props) {
  send(event, props);
}

/** Reports a page view whenever the route changes. Call once, in the root layout. */
export function usePageViews() {
  const pathname = usePathname();
  useEffect(() => {
    // Route patterns, not ids: /product/<uuid> would make every product its own "page".
    const path = pathname.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
    send('$pageview', { $pathname: path, $current_url: path });
  }, [pathname]);
}
