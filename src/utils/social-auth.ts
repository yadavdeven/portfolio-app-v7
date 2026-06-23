import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import { ERROR_MESSAGES } from '../constants/messages';

// Configure once, lazily, on first use. configure() is synchronous and cheap,
// and the `isConfigured` flag avoids redundant calls. Keeping this self-contained
// means App.tsx (and every caller) never has to wire up Google setup — the
// feature carries its own initialization. The web client ID comes from the build
// env (.env.*) rather than being hardcoded, so dev/prod can diverge safely.
let isConfigured = false;

const ensureGoogleConfigured = () => {
  if (isConfigured) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  isConfigured = true;
};

/**
 * Tears down the current session at the provider level: revokes the native
 * Google session (so the next sign-in re-prompts the account picker) and signs
 * the user out of Firebase. Both steps are best-effort — a user who logged in
 * with email/password has no Google/Firebase session, so failures here are
 * swallowed and never block logout. Clearing the local keychain is the caller's
 * responsibility (see clearAuthCredentials).
 */
export const signOutFromSocial = async (): Promise<void> => {
  try {
    ensureGoogleConfigured();
    await GoogleSignin.signOut();
  } catch (error) {
    console.log('Google sign-out skipped:', error);
  }
  try {
    await auth().signOut();
  } catch (error) {
    console.log('Firebase sign-out skipped:', error);
  }
};

/**
 * Runs the native Google account picker and exchanges the Google ID token for a
 * Firebase credential.
 *
 * @returns the Firebase {@link FirebaseAuthTypes.UserCredential} on success, or
 *   `null` when the user cancels the picker (not an error — callers should quietly
 *   do nothing). Any genuine failure (no Play Services, network, missing token) is
 *   thrown with a user-readable message.
 */
export const signInWithGoogle =
  async (): Promise<FirebaseAuthTypes.UserCredential | null> => {
    try {
      // STAGE 1 — register the web client ID with the native SDK (no network).
      ensureGoogleConfigured();

      // STAGE 2 — gate on Google Play Services (Android). Rejects if it's missing
      // or out of date; on iOS this resolves immediately.
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // STAGE 3 — open the native account picker. Returns the Google profile plus
      // a Google-issued ID token. Throws SIGN_IN_CANCELLED if the user dismisses it.
      const userInfo = await GoogleSignin.signIn();

      // STAGE 4 — pull out Google's ID token. Absent here almost always means a
      // config problem (wrong/undefined client ID, missing SHA-1 on Android).
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error(ERROR_MESSAGES.GOOGLE_SIGN_IN_FAILED);
      }

      // STAGE 5 — wrap Google's token in a Firebase credential (still no network).
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // STAGE 6 — exchange it with Firebase. This creates/looks up the Firebase
      // user and returns a UserCredential (uid, isNewUser, getIdToken()).
      return await auth().signInWithCredential(googleCredential);
    } catch (error) {
      console.log('Google sign-in failed:', error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          // User dismissed the account picker — not a real failure.
          case statusCodes.SIGN_IN_CANCELLED:
            return null;
          case statusCodes.IN_PROGRESS:
            throw new Error('A Google sign-in is already in progress.');
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new Error(
              'Google Play Services is unavailable or out of date.',
            );
        }
      }
      throw new Error(ERROR_MESSAGES.GOOGLE_SIGN_IN_FAILED);
    }
  };
