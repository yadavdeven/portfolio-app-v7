import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BlankScreenModal from './BlankScreenModal';
import {useAppSelector} from '../../store/hooks';
import Colors from '../../constants/Colors';

interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({children}: ContainerProps) {
  const {isAppLoading} = useAppSelector(state => state.app);

  console.log('isAppLoading in Container:', isAppLoading);

  return (
    <SafeAreaView style={styles.container}>
      <BlankScreenModal showModal={isAppLoading} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
