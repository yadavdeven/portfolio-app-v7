import React, { useEffect } from 'react';
import { Image, Switch, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeBiometrics, {
  BiometryType,
  BiometryTypes,
} from 'react-native-biometrics';
import {
  biometricDisable,
  biometricRegisterStart,
  biometricRegisterVerify,
} from '../../../store/slices/authSlice';
import {
  getBiometricCredentials,
  getDeviceId,
  isBiometricEnabled,
  saveBiometricCredentials,
} from '../../../utils/helper-functions';
import { getBiometricDisabledMessage } from '../../../utils/message-helpers';
import { ERROR_MESSAGES } from '../../../constants/messages';
import { getAuthCredentials } from '../../../api/authStorage';
import { useToast } from '../../../providers/ToastProvider';
import Wrapper from '../../../components/common/Wrapper';
import Loader from '../../../components/common/Loader';
import { useAppDispatch } from '../../../store/hooks';
import * as Keychain from 'react-native-keychain';
import Colors from '../../../constants/Colors';
import styles from './styles';

// At the top of your file
const icons = {
  faceId: require('../../../assets/images/face-id.png'),
  fingerprint: require('../../../assets/images/fingerprint.png'),
};

type ToggleRowProps = {
  iconSource: any;
  label: string;
  subLabel: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  onDisabledPress?: () => void;
};

const ToggleRow = ({
  iconSource,
  label,
  subLabel,
  value,
  onValueChange,
  disabled,
  onDisabledPress,
}: ToggleRowProps) => (
  <TouchableOpacity
    style={[styles.row, disabled && styles.rowDisabled]}
    onPress={disabled ? onDisabledPress : () => onValueChange(!value)}
    activeOpacity={disabled ? 0.6 : 1}
  >
    <View style={styles.rowIconWrap}>
      <Image source={iconSource} style={styles.rowIconImg} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowSub}>{subLabel}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={disabled ? undefined : onValueChange}
      trackColor={{ false: Colors.bg_300, true: Colors.primary }}
      thumbColor={Colors.white}
      ios_backgroundColor={Colors.bg_300}
      pointerEvents="none"
    />
  </TouchableOpacity>
);

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export default function BiometricScreen() {
  const dispatch = useAppDispatch();

  const { showToast } = useToast();

  const [loading, setLoading] = React.useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = React.useState(false);

  const [biometricInfo, setBiometricInfo] = React.useState<{
    available: boolean;
    biometryType: BiometryType | null | undefined;
  }>({
    available: false,
    biometryType: null,
  });

  useEffect(() => {
    const checkSensor = async () => {
      try {
        const { available, biometryType } =
          await rnBiometrics.isSensorAvailable();

        setBiometricInfo({
          available,
          biometryType: available ? biometryType : null,
        });
      } catch (e) {
        console.log('Biometric sensor check error', e);
        setBiometricInfo({
          available: false,
          biometryType: null,
        });
      }
    };

    const checkBiometricStatus = async () => {
      const enabled = await isBiometricEnabled();
      setBiometricsEnabled(enabled);
    };

    checkSensor();
    checkBiometricStatus();
  }, []);

  const handleEnableBiometric = async () => {
    try {
      setLoading(true);
      const startResponse = await dispatch(biometricRegisterStart()).unwrap();

      const { challenge } = startResponse.responseData;
      const { keysExist } = await rnBiometrics.biometricKeysExist();

      let publicKey: string | undefined;
      if (!keysExist) {
        const result = await rnBiometrics.createKeys();
        publicKey = result.publicKey;
      } else {
        const stored = await getBiometricCredentials();

        if (!stored?.publicKey) {
          console.log('⚠️ Keys exist but no stored publicKey → resetting');

          // ❗ reset invalid state
          await rnBiometrics.deleteKeys();

          const result = await rnBiometrics.createKeys();
          publicKey = result.publicKey;
        } else {
          publicKey = stored.publicKey;
        }
      }

      if (!publicKey) {
        console.log('Public key not found after key creation/retrieval');
        throw new Error(ERROR_MESSAGES.BIOMETRIC_SETUP_FAILED);
      }

      const { signature } = await rnBiometrics.createSignature({
        promptMessage: 'Enable Biometric Authentication',
        payload: challenge,
      });

      if (!signature) {
        throw new Error('Biometric authentication was cancelled');
      }

      const deviceId = await getDeviceId();

      const finishRes = await dispatch(
        biometricRegisterVerify({
          publicKey,
          signature,
          deviceName: 'My Phone',
          deviceId,
        }),
      ).unwrap();

      const credentialId = finishRes.responseData?.credentialId;

      if (!credentialId) {
        throw new Error('Credential ID missing');
      }

      // 🔥 get userId from auth
      const auth = await getAuthCredentials();

      if (!auth?.userId) {
        throw new Error('User not found');
      }
      if (!auth?.email) throw new Error('Email not found'); // ✅ add

      // 🔥 ensure publicKey exists
      if (!publicKey) {
        const stored = await getBiometricCredentials();
        publicKey = stored?.publicKey || undefined;
      }

      if (!publicKey) {
        throw new Error('Public key missing');
      }

      // ✅ SAVE

      await saveBiometricCredentials(
        auth.userId,
        publicKey,
        credentialId,
        auth.email,
      );
      setBiometricsEnabled(true);
      showToast('Biometrics enabled successfully');
    } catch (error: any) {
      console.log(error);
      showToast(error?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableBiometric = async () => {
    try {
      setLoading(true);

      // 1️⃣ get stored credential (VERY IMPORTANT)
      const stored = await getBiometricCredentials();

      if (!stored?.credentialId) {
        throw new Error('No biometric credential found');
      }

      // 2️⃣ call backend → delete ONLY this device
      await dispatch(
        biometricDisable({
          credentialId: stored.credentialId,
        }),
      ).unwrap();

      // 3️⃣ delete device keys (secure enclave)
      await rnBiometrics.deleteKeys();

      // 4️⃣ clear local storage
      await Keychain.resetGenericPassword({
        service: 'biometric_credentials',
      });

      // 5️⃣ update UI
      setBiometricsEnabled(false);

      showToast('Biometrics disabled successfully');
    } catch (error: any) {
      console.log(error);
      showToast(error?.message || 'Failed to disable biometrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricToggle = async () => {
    if (biometricsEnabled) {
      await handleDisableBiometric();
    } else {
      await handleEnableBiometric();
    }
  };

  return (
    <>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Loader color={Colors.primary_200} />
        </View>
      )}
      <Wrapper headerTitle="Biometrics">
        {/* Auth section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Authentication</Text>
          <View style={styles.card}>
            <View style={styles.masterRow}>
              <View style={styles.masterText}>
                <Text style={styles.masterLabel}>Enable biometrics</Text>
                <Text style={styles.masterSub}>
                  {biometricsEnabled
                    ? 'On — biometrics active'
                    : 'Off — password only'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />

            <ToggleRow
              iconSource={icons.faceId}
              label="Face ID"
              subLabel="Recognize by face scan"
              value={
                biometricInfo.biometryType === BiometryTypes.FaceID &&
                biometricsEnabled
              }
              onValueChange={handleBiometricToggle}
              disabled={
                !biometricInfo.available ||
                biometricInfo.biometryType !== BiometryTypes.FaceID
              }
              onDisabledPress={() => {
                const message = getBiometricDisabledMessage(
                  biometricInfo,
                  'face',
                );
                console.log('Face ID disabled press:', message);

                showToast(message, 'info');
              }}
            />

            <View style={styles.divider} />

            <ToggleRow
              iconSource={icons.fingerprint}
              label="Fingerprint"
              subLabel="Recognize by fingerprint"
              value={
                (biometricInfo.biometryType === BiometryTypes.TouchID ||
                  biometricInfo.biometryType === BiometryTypes.Biometrics) &&
                biometricsEnabled
              }
              onValueChange={handleBiometricToggle}
              disabled={
                !biometricInfo.available ||
                (biometricInfo.biometryType !== BiometryTypes.TouchID &&
                  biometricInfo.biometryType !== BiometryTypes.Biometrics)
              }
              onDisabledPress={() =>
                showToast(
                  getBiometricDisabledMessage(biometricInfo, 'fingerprint'),
                  'info',
                )
              }
            />
          </View>

          {/* Info banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {biometricsEnabled
                ? 'Biometrics are enabled. You can use biometrics for login.'
                : "Biometrics are disabled. You'll need to enter your password each time for login."}
            </Text>
          </View>
        </View>
      </Wrapper>
    </>
  );
}
