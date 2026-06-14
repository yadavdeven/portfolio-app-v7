import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import FacebookLogo from '../../assets/images/global/facebook.svg';
import GithubLogo from '../../assets/images/global/github.svg';
import GoogleLogo from '../../assets/images/global/google.svg';
import AppleLogo from '../../assets/images/global/apple.svg';
import { signInWithGoogle } from '../../utils/social-auth';
import { moderateScale } from 'react-native-size-matters';
import { useToast } from '../../providers/ToastProvider';
import Colors from '../../constants/Colors';
import { ERROR_MESSAGES } from '../../constants/messages';

type SocialSignInIconsPropsType = {
  verifyFirebaseIdToken: (idToken: string) => void;
};

export default function SocialSignInIcons({
  verifyFirebaseIdToken,
}: SocialSignInIconsPropsType) {
  const { showToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      // Run the native Google → Firebase exchange (stages 1–6 in social-auth.ts).
      const result = await signInWithGoogle();

      // null = the user cancelled the picker → do nothing, no error toast.
      if (!result) return;

      // STAGE 7 — mint a fresh FIREBASE ID token (different from Google's token).
      // This is the only token our backend knows how to verify.
      const idToken = await result.user.getIdToken();
      if (!idToken) {
        showToast(ERROR_MESSAGES.GOOGLE_SIGN_IN_FAILED, 'error');
        return;
      }

      // STAGE 8 — hand the Firebase token to the screen, which POSTs it to our
      // backend to exchange for our own app session. This component's job ends here.
      verifyFirebaseIdToken(idToken);
    } catch (error) {
      // Real failure (config/network/token) — surface the actual message, which
      // propagates up from signInWithGoogle instead of being swallowed.
      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.GOOGLE_SIGN_IN_FAILED;
      showToast(message, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logo_wrapper}
        onPress={handleGoogleSignIn}
      >
        <GoogleLogo width={moderateScale(24)} height={moderateScale(24)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <AppleLogo width={moderateScale(32)} height={moderateScale(32)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <FacebookLogo width={moderateScale(28)} height={moderateScale(28)} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.logo_wrapper}>
        <GithubLogo width={moderateScale(24)} height={moderateScale(24)} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(24),
    marginTop: moderateScale(16),
    alignSelf: 'center',
  },
  logo_wrapper: {
    width: moderateScale(32),
    aspectRatio: 1,
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite_100,
    elevation: 0.5,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
});
