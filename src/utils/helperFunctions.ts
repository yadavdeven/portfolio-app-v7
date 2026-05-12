import { Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const rnBiometrics = new ReactNativeBiometrics();

const BIOMETRIC_SERVICE = 'biometric_credentials';

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

const saveBiometricCredentials = async (
  userId: string,
  publicKey: string,
  credentialId: string,
  email: string,
  counter: number = 0,
) => {
  try {
    const data = { publicKey, credentialId, email, counter };

    await Keychain.setGenericPassword(userId, JSON.stringify(data), {
      service: BIOMETRIC_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });

    console.log('Biometric credentials saved securely');
  } catch (error) {
    console.log('Error saving biometric credentials:', error);
    throw error;
  }
};

const getBiometricCredentials = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: BIOMETRIC_SERVICE,
    });

    if (!credentials) return null;

    const parsed = JSON.parse(credentials.password);

    return {
      userId: credentials.username,
      publicKey: parsed.publicKey,
      credentialId: parsed.credentialId,
      email: parsed.email,
      counter: parsed.counter || 0,
    };
  } catch (error) {
    console.log('Error loading biometric credentials:', error);
    return null;
  }
};

const getAuthCredentials = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'auth_credentials',
    });

    if (!credentials) return null;

    const { username: userId, password } = credentials;
    const parsed = JSON.parse(password);

    return {
      userId,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      guid: parsed.guid,
      email: parsed.email, // ✅ add
    };
  } catch (error) {
    console.log('Error loading credentials:', error);
    return null;
  }
};

const saveAuthCredentials = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  guid: string,
  email: string, // ✅ add
) => {
  try {
    const data = { accessToken, refreshToken, guid, email }; // ✅ add email
    await Keychain.setGenericPassword(userId, JSON.stringify(data), {
      service: 'auth_credentials',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  } catch (error) {
    console.log('Error saving credentials to keychain:', error);
    throw error;
  }
};

const isBiometricEnabled = async () => {
  try {
    // 1️⃣ check device support
    const { available } = await rnBiometrics.isSensorAvailable();
    if (!available) return false;

    // 2️⃣ check keys
    const { keysExist } = await rnBiometrics.biometricKeysExist();
    if (!keysExist) return false;

    // 3️⃣ check stored credential
    const stored = await getBiometricCredentials();
    if (!stored?.credentialId || !stored?.publicKey) return false;

    return true;
  } catch (err) {
    console.log('biometric check error', err);
    return false;
  }
};

export {
  isIOS,
  isAndroid,
  delay,
  saveBiometricCredentials,
  getBiometricCredentials,
  getAuthCredentials,
  saveAuthCredentials,
  isBiometricEnabled,
};
