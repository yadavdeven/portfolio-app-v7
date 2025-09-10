import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';
import {RootStackParamList} from '../types/navigation/RootStackParamList';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: name as string,
        params,
      }),
    );
  }
};

export const goBack = () => {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
};

export const reset = (
  routes: Array<{name: keyof RootStackParamList; params?: object}>,
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
