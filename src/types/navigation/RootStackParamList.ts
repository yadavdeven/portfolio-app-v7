import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AppStackParamList } from './AppStackParamList';
import type { AuthStackParamList } from './AuthStackParamList';

export type RootStackParamList = {
  SplashScreen: undefined;
  AppNavigator: NavigatorScreenParams<AppStackParamList>;
  AuthNavigator: NavigatorScreenParams<AuthStackParamList>;
};

/**
 * Flat list of every reachable route across all navigators. Used by the global
 * navigation helpers, which navigate to nested screens directly by their
 * (unique) route name rather than via nested navigator params.
 */
export type GlobalParamList = RootStackParamList &
  AppStackParamList &
  AuthStackParamList;