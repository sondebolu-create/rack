import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { getAnonId } from '@/lib/analyticsId';
import { useConsent } from '@/lib/consent';
import { IS_SERVER } from '@/lib/storage';

/**
 * Analytics through PostHog's capture API, called directly with fetch. No SDK: the same few lines work on web and
 * iOS, add nothing to the bundle, and set no cookies. Every call site goes through track() and usePageViews().
 *
 * Privacy (Rack handles names, phones and addresses, so the Nigeria Data Protection Act applies):
 *  - Anonymous only. The id is a random string kept on the device. It is never linked to an account, and we never
 *    call identify, so there are no person profiles.
 *  - No autocapture, no session recording, no geolocation lookup. Only the events listed below.
 *  - Never put an email, name, phone number, address, or user/order id in `props`. Counts and categories only.
 *  - Nothing is sent until the visitor taps Accept (lib/consent.ts), when the browser's Do Not Track is on, or when no
 *    key is configured. Declining deletes the id from the device.
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
/** A PostHog key is set, so there is something to ask consent for. */
export const ANALYTICS_CONFIGURED = !!KEY;

export const doNotTrack = () => Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.doNotTrack === '1';

function send(event: string, props: Props = {}) {
  if (__DEV__) console.debug('[analytics]', event, props);
  // Nothing on the web server (it renders pages, it isn't a visitor), without a key, if the browser says Do Not Track,
  // or until the visitor has tapped Accept.
  if (IS_SERVER || !KEY || doNotTrack() || useConsent.getState().choice !== 'granted') return;
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
  // Also re-runs when the choice changes, so the page they are on is counted the moment they accept.
  const consent = useConsent((c) => c.choice);
  useEffect(() => {
    // Route patterns, not ids: /product/<uuid> would make every product its own "page".
    const path = pathname.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
    send('$pageview', { $pathname: path, $current_url: path });
  }, [pathname, consent]);
}
