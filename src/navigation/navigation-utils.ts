import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {
  GlobalParamList,
  RootStackParamList,
} from '../types/navigation/RootStackParamList';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <RouteName extends keyof GlobalParamList>(
  name: RouteName,
  params?: GlobalParamList[RouteName],
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate(name as string, params),
    );
  }
};

export const navigateBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

export const resetNavigation = (
  routes: Array<{ name: keyof RootStackParamList; params?: object }>,
  index = 0,
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  }
};
