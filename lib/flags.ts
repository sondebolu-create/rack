/**
 * Launch feature flags. All three are OFF for the web launch (Nov 20). Turn one on for a build by setting its
 * EXPO_PUBLIC_ variable to "true" in .env (or the build environment) and rebuilding:
 *
 *   EXPO_PUBLIC_RACKGPT_ENABLED=true     RackGPT chat and results (until then: a "coming soon" waitlist screen)
 *   EXPO_PUBLIC_TRYON_ENABLED=true       the "Try it on" flow (until then: a "coming soon" waitlist sheet)
 *   EXPO_PUBLIC_PAYMENTS_ENABLED=true    card / bank-transfer payment (until then: orders are reservations)
 *
 * Expo inlines EXPO_PUBLIC_* at build time, so each access must be written out in full like this.
 */
const on = (value: string | undefined) => value === 'true';

export const RACKGPT_ENABLED = on(process.env.EXPO_PUBLIC_RACKGPT_ENABLED);
export const TRYON_ENABLED = on(process.env.EXPO_PUBLIC_TRYON_ENABLED);
export const PAYMENTS_ENABLED = on(process.env.EXPO_PUBLIC_PAYMENTS_ENABLED);
