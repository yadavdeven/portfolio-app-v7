import React from 'react';
import {
  NativeModules,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import ButtonStandard from '../../../components/common/ButtonStandard';
import HeaderBar from '../../../components/common/HeaderBar';
import { useToast } from '../../../providers/ToastProvider';
import Colors from '../../../constants/Colors';

const { ToastAndAlertModule } = NativeModules;

const WelcomeAlertScreen = () => {
  const { showToast } = useToast();

  const [name, setName] = React.useState('');

  const handleShowAlert = () => {
    if (!name) return showToast('Please enter a name');
    try {
      ToastAndAlertModule.showAlert(name);
    } catch (error) {
      console.log('Error showing alert:', error);
      showToast('Error showing alert');
    }
  };

  const handleShowToast = async () => {
    if (!name) return showToast('Please enter a name');
    try {
      const greetMessage = await ToastAndAlertModule.getGreetMessage(name);
      showToast(greetMessage);
    } catch (error) {
      console.log('Error showing toast message:', error);
      showToast('Error showing toast message');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HeaderBar title="Welcome Alert" bgColor={Colors.bg_600} />
      <View style={styles.contentContainer}>
        <TextInput
          placeholder="Enter Name"
          value={name}
          onChangeText={setName}
        />
        <ButtonStandard btnLabel="Show Toast" onPress={handleShowToast} />
        <ButtonStandard btnLabel="Show Alert" onPress={handleShowAlert} />
      </View>
    </SafeAreaView>
  );
};

export default WelcomeAlertScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg_600,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(16),
  },
});
