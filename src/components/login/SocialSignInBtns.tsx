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

type SocialSignInIconsPropsType = {
  verifyFirebaseIdToken: (idToken: string) => void;
};

export default function SocialSignInIcons({
  verifyFirebaseIdToken,
}: SocialSignInIconsPropsType) {
  const { showToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      console.log('result: ', result);

      const user = result?.user;
      const idToken = await user?.getIdToken();
      console.log('firebase idToken: ', idToken);
      if (!idToken) {
        showToast('Google sign-in failed. No ID token found.', 'error');
        return;
      }
      verifyFirebaseIdToken(idToken);
    } catch (error) {
      console.log('error: ', error);

      let message = 'Google sign-in failed. Please try again.';
      if (error instanceof Error) message = error.message;
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
    marginTop: moderateScale(24),
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
