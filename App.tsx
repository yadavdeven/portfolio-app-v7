import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/providers/AppProvider';
import { store } from './src/store/store';
import { StyleSheet } from 'react-native';
import { Provider } from 'react-redux';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
