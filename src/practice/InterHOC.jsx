import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { useNavigation } from '@react-navigation/native';

const withAuth = WrappedComponent => {
  const EnhancedComponent = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const credentials = await Keychain.getGenericPassword();
          setAuthenticated(!!credentials);
        } catch (error) {
          console.log('Auth check failed:', error);
          setAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      };
      checkAuth();
    }, []);

    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!authenticated) {
      navigation.replace('Login');
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // For React DevTools — shows as withAuth(ProfileScreen) instead of EnhancedComponent
  EnhancedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return EnhancedComponent;
};

export default withAuth;
