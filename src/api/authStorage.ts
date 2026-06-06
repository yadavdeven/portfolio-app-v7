import * as Keychain from 'react-native-keychain';

// Namespaces the stored entry in the device keychain/keystore so these
// auth credentials don't collide with any other secrets the app saves.
const SERVICE = 'auth-credentials';

// Shape of the credential set we persist and return to callers.
export interface AuthCredentials {
  userId: string;
  accessToken: string;
  refreshToken: string;
  guid: string;
  email: string;
}

/**
 * Securely persists the user's auth credentials in the device keychain.
 * The userId is stored as the keychain "username" and the remaining fields
 * are JSON-encoded into the "password" slot since the keychain only exposes
 * those two string fields per entry.
 */
export const saveAuthCredentials = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  guid: string,
  email: string,
): Promise<void> => {
  const data = { accessToken, refreshToken, guid, email };
  await Keychain.setGenericPassword(userId, JSON.stringify(data), {
    service: SERVICE,
    // Only accessible while the device is unlocked, and never synced/backed up
    // off this device.
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    // Prefer hardware-backed storage (Secure Enclave / TEE) when available.
    securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  });
};

/**
 * Reads the stored credentials back out of the keychain.
 * Returns null when nothing is stored or if reading/parsing fails, so callers
 * can simply treat a null result as "not logged in".
 */
export const getAuthCredentials = async (): Promise<AuthCredentials | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE });
    // No entry found for this service (e.g. fresh install or after logout).
    if (!credentials) return null;

    // Unpack the userId from "username" and the JSON-encoded blob from "password".
    const { username: userId, password } = credentials;
    const parsed = JSON.parse(password);

    return {
      userId,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      guid: parsed.guid,
      email: parsed.email,
    };
  } catch (error) {
    console.log('Error loading credentials:', error);
    return null;
  }
};

/**
 * Removes the stored credentials from the keychain. Call this on logout
 * or whenever the session needs to be invalidated.
 */
export const clearAuthCredentials = async (): Promise<void> => {
  await Keychain.resetGenericPassword({ service: SERVICE });
};
