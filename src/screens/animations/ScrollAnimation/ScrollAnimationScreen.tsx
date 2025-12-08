import React from 'react';
import { Image, StatusBar, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ScrollAnimationData as DATA } from '../../../data/scroll-animation';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/common/HeaderBar';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';
import styles from './styles';

const CARD_HEIGHT_WITH_PADDING = moderateScale(100, 0.4);

type ScrollAnimationCardPropTypes = {
  item: {
    id: string;
    name: string;
    jobTitle: string;
    email: string;
    image: string;
  };
  index: number;
  scrollY: SharedValue<number>;
};

const Card = ({ item, index, scrollY }: ScrollAnimationCardPropTypes) => {
  const inputRangeScale = [
    -1,
    0,
    index * CARD_HEIGHT_WITH_PADDING,
    (index + 2) * CARD_HEIGHT_WITH_PADDING,
  ];
  const inputRangeOpacity = [
    -1,
    0,
    index * CARD_HEIGHT_WITH_PADDING,
    (index + 1) * CARD_HEIGHT_WITH_PADDING,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      inputRangeScale,
      [1, 1, 1, 0],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      inputRangeOpacity,
      [1, 1, 1, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Image
        resizeMode="contain"
        source={{ uri: item.image }}
        style={styles.image}
      />
      <View style={{}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
        <Text style={styles.email} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
    </Animated.View>
  );
};

const ScrollAnimationScreen = () => {
  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_700} barStyle="dark-content" />
      <HeaderBar title="Scroll Animation" bgColor={Colors.bg_700} />
      <View style={styles.contentContainer}>
        <Animated.FlatList
          data={DATA}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.cardsContainer}
          onScroll={handleScroll}
          renderItem={({ item, index }) => (
            <Card item={item} index={index} scrollY={scrollY} />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default ScrollAnimationScreen;
