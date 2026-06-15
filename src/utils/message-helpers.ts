import { BiometryTypes } from 'react-native-biometrics';

export const getBiometricDisabledMessage = (
  biometricInfo: {
    available: boolean;
    biometryType: string | null | undefined;
    error?: string;
  },
  type: 'face' | 'fingerprint',
) => {
  const { available, biometryType, error } = biometricInfo;

  // ❌ No hardware OR not setup
  if (!available) {
    // ⚠️ Hardware exists but no biometrics enrolled yet
    if (error === 'BIOMETRIC_ERROR_NONE_ENROLLED') {
      return 'Please set up biometrics in device settings';
    }

    // 🔥 No usable hardware (absent, or temporarily unavailable)
    if (!biometryType) {
      return 'Biometric authentication is not supported on this device';
    }

    // ⚠️ Hardware exists but not configured
    return 'Please set up biometrics in device settings';
  }

  // ❌ Face ID not supported on this device
  if (type === 'face' && biometryType !== BiometryTypes.FaceID) {
    return 'Face ID is not available on this device';
  }

  // ❌ Fingerprint not supported
  if (
    type === 'fingerprint' &&
    biometryType !== BiometryTypes.TouchID &&
    biometryType !== BiometryTypes.Biometrics
  ) {
    return 'Fingerprint is not available on this device';
  }

  return 'Biometric authentication is not available';
};
