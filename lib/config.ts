/** Where "Report this listing" emails go. Set EXPO_PUBLIC_REPORT_EMAIL; with none set, the link is not shown. */
export const REPORT_EMAIL = process.env.EXPO_PUBLIC_REPORT_EMAIL?.trim() || null;

/**
 * The public web address, no trailing slash (for example https://rack.ng). Share previews need absolute URLs.
 * TODO(launch): set EXPO_PUBLIC_SITE_URL to the production domain.
 */
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '');
