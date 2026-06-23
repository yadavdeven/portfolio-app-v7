import React, { useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import {
  BackHandler,
  SectionList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { categories as rawCategories } from '../../data/home-categories';
import { navigate } from '../../navigation/navigation-utils';
import BlankScreenModal from '../../components/common/BlankScreenModal';
import { moderateScale } from 'react-native-size-matters';
import HomeHeader from '../../components/home/HomeHeader';
import { useToast } from '../../providers/ToastProvider';
import { useAppSelector } from '../../store/hooks';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import { createStyles } from './styles';

// Window (ms) within which a second back press exits the app.
const BACK_EXIT_WINDOW = 2000;

type SubItem = {
  id: string;
  name: string;
};

type CategorySection = {
  id: string;
  title: string;
  data: SubItem[];
};

const categories: CategorySection[] = rawCategories;

const HomeScreen: React.FC = () => {
  const { isAppLoading } = useAppSelector(state => state.app);
  const { theme, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { showToast } = useToast();
  const lastBackPress = useRef(0);

  // Android hardware back on Home: first press warns via toast, a second press
  // within BACK_EXIT_WINDOW exits the app. Only active while Home is focused.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPress.current < BACK_EXIT_WINDOW) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPress.current = now;
        showToast('Press back again to exit', 'default', BACK_EXIT_WINDOW, true);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [showToast]),
  );

  const SectionSeparator = () => <View style={styles.sectionSeparator} />;

  const handleSubCategoryPress = item => {
    navigate(item.routeTo);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <View style={styles.contentContainer}>
        <BlankScreenModal showModal={isAppLoading} />
        <HomeHeader />
        <SectionList
          sections={categories}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.sectionListContainer}
          stickySectionHeadersEnabled
          SectionSeparatorComponent={SectionSeparator}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <Animated.View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </Animated.View>
          )}
          renderItem={({ item, index, section }) => (
            <TouchableOpacity
              onPress={() => handleSubCategoryPress(item)}
              style={[
                styles.subCategoryContainer,
                index !== section.data.length - 1 && {
                  marginBottom: moderateScale(2),
                },
              ]}
            >
              <Text style={styles.subCategoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
