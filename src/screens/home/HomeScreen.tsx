import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from './styles';
import HomeHeader from '../../components/home/HomeHeader';
import {StatusBar} from 'react-native';
import Colors from '../../constants/Colors';

const CATEGOGIES = [
  {
    id: '1',
    categoryName: 'Animations',
    subCategories: ['Cards Rotate', 'Cards Swipe'],
  },
  {
    id: '2',
    categoryName: 'Native Modules',
    subCategories: ['Camera', 'Location'],
  },
  {
    id: '4',
    categoryName: 'Device Features',
    subCategories: ['Sensors', 'Bluetooth'],
  },
  {
    id: '3',
    categoryName: 'UI Components',
    subCategories: ['Buttons', 'Inputs', 'Sliders'],
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HomeHeader />
    </SafeAreaView>
  );
}
