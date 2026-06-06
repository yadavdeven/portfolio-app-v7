import React, { useEffect } from 'react';
import { configureGoogleSignIn } from './src/utils/social-auth';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/providers/AppProvider';
// import Practice from './src/practice/Practice';
import { store } from './src/store/store';
import { Provider } from 'react-redux';

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <Provider store={store}>
      <AppProvider>
        {/* <Practice /> */}
        <RootNavigator />
      </AppProvider>
    </Provider>
  );
}
