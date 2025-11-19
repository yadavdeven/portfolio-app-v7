import { Platform } from 'react-native';

// check if device is iOS
const isIOS = Platform.OS === 'ios';

// check if device is Android
const isAndroid = Platform.OS === 'android';

/**
 * Returns a promise that resolves after a specified amount of time in milliseconds.
 * @param {number} ms - The amount of time in milliseconds to wait before resolving the promise.
 * @returns {Promise<void>} - A promise that resolves after the specified amount of time.
 */
const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export { isIOS, isAndroid, delay };
