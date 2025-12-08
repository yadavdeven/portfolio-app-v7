import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import {
  SectionList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { categories as rawCategories } from '../../data/home-categories';
import { navigate } from '../../navigation/navigation-utils';
import Container from '../../components/common/Container';
import { moderateScale } from 'react-native-size-matters';
import HomeHeader from '../../components/home/HomeHeader';
import Colors from '../../constants/Colors';
import styles from './styles';

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

const SectionSeparator = () => <View style={styles.sectionSeparator} />;

const HomeScreen: React.FC = () => {
  const handleSubCategoryPress = item => {
    navigate(item.routeTo);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <Container containerStyle={styles.contentContainer}>
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
      </Container>
    </SafeAreaView>
  );
};

export default HomeScreen;
