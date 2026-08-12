import { NativeModules } from 'react-native';

// Mirrors the @ReactMethod signatures in ShowAlertModule.kt.
// Hand-written — nothing verifies this matches the Kotlin side.
interface ShowAlertInterface {
  showAlert(name: string): void;
}

// Key must equal getName() in ShowAlertModule.kt.
const { ShowAlertModule } = NativeModules;

export default ShowAlertModule as ShowAlertInterface;
