import { Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';

const rnBiometrics = new ReactNativeBiometrics();

const BIOMETRIC_SERVICE = 'biometric_credentials';
const DEVICE_ID_SERVICE = 'device_id';

/**
 * Persists a secret to the keychain, preferring hardware-backed storage
 * (Secure Enclave / TEE / StrongBox). Some Android devices have no hardware
 * keystore and throw when SECURE_HARDWARE is required, so we fall back to the
 * best available software-backed storage instead of failing the whole flow.
 */
const setKeychainItem = async (
  username: string,
  password: string,
  options: Keychain.SetOptions,
) => {
  try {
    await Keychain.setGenericPassword(username, password, {
      ...options,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  } catch {
    await Keychain.setGenericPassword(username, password, options);
  }
};

/**
 * RFC-4122 v4 UUID. Math.random is fine here: a deviceId is a stable, opaque
 * label for a device row, not a secret or a security boundary.
 */
const generateUuidV4 = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

/**
 * Returns a stable identifier for this physical device, generating and
 * persisting one on first use. Survives logout/re-enrollment (unlike the
 * biometric credential), so the backend can dedupe credentials per device.
 */
const getDeviceId = async (): Promise<string> => {
  const existing = await Keychain.getGenericPassword({
    service: DEVICE_ID_SERVICE,
  });
  if (existing && existing.password) return existing.password;

  const deviceId = generateUuidV4();
  await setKeychainItem('device', deviceId, {
    service: DEVICE_ID_SERVICE,
    // Readable at launch (even before first interactive unlock) and never
    // synced off this device.
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  return deviceId;
};

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
) => {
  try {
    const data = { publicKey, credentialId, email };

    await setKeychainItem(userId, JSON.stringify(data), {
      service: BIOMETRIC_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
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
    };
  } catch (error) {
    console.log('Error loading biometric credentials:', error);
    return null;
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
  getDeviceId,
  saveBiometricCredentials,
  getBiometricCredentials,
  isBiometricEnabled,
};
