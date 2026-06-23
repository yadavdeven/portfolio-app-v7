import React from 'react';
import { StyleSheet, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import ButtonStandard from '../../../components/common/ButtonStandard';
import TextInputStandard from '../../../components/common/TextInputStandard';
import Wrapper from '../../../components/common/Wrapper';
import { useToast } from '../../../providers/ToastProvider';
// The TurboModule spec's default export — a typed, JSI-backed module.
import ToastAndAlertTurbo from '../../../native/NativeToastAndAlertTurbo';

const ToastAndAlertNativeModuleScreen = () => {
  const { showToast } = useToast();

  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');

  const validate = () => {
    if (!name.trim()) {
      setError('Please enter a name');
      return false;
    }
    setError('');
    return true;
  };

  const handleShowAlert = () => {
    if (!validate()) return;
    if (!ToastAndAlertTurbo) {
      showToast('Native module not available on this platform yet');
      return;
    }
    try {
      ToastAndAlertTurbo.showAlert(name);
    } catch (err) {
      console.log('Error showing alert:', err);
      showToast('Error showing alert');
    }
  };

  const handleShowToast = () => {
    if (!validate()) return;
    if (!ToastAndAlertTurbo) {
      showToast('Native module not available on this platform yet');
      return;
    }
    try {
      // Synchronous JSI call. The native module itself shows the Toast and
      // returns the greeting string — so we DON'T also call the JS `showToast`
      // provider here, otherwise two toasts appear (native + in-app).
      const greetMessage = ToastAndAlertTurbo.showToast(name);
      console.log('Native toast greeting:', greetMessage);
    } catch (err) {
      console.log('Error showing toast message:', err);
      showToast('Error showing toast message');
    }
  };

  return (
    <Wrapper headerTitle="Welcome Alert">
      <View style={styles.content}>
        <TextInputStandard
          label="Name"
          placeholder="Enter Name"
          value={name}
          onChangeText={text => {
            setName(text);
            if (error) setError('');
          }}
          error={error}
        />
        <ButtonStandard btnLabel="Show Toast" onPress={handleShowToast} />
        <ButtonStandard btnLabel="Show Alert" onPress={handleShowAlert} />
      </View>
    </Wrapper>
  );
};

export default ToastAndAlertNativeModuleScreen;

const styles = StyleSheet.create({
  content: {
    gap: moderateScale(16),
  },
});
