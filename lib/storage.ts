import AsyncStorage from '@react-native-async-storage/async-storage';

/** True while the web server is rendering pages (there is no `window` there). */
export const IS_SERVER = typeof window === 'undefined';

const noop = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
};

/**
 * Key-value storage for the Supabase session and the cart. AsyncStorage maps to localStorage on web and to native
 * storage on iOS. On the web server (server rendering) there is no storage, so it does nothing: nobody is signed
 * in and the cart is empty while the first HTML is built, and the browser fills both in once it loads.
 */
export const appStorage = IS_SERVER ? noop : AsyncStorage;
