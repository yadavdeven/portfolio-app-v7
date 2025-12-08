import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/common/HeaderBar';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import ButtonStandard from '../../../components/common/ButtonStandard';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';
import { Image, View } from 'react-native';
import styles from './styles';

const CARDS = [
  { id: 1, path: require('../../../assets/images/animations/card1.png') },
  { id: 2, path: require('../../../assets/images/animations/card2.png') },
  { id: 3, path: require('../../../assets/images/animations/card3.png') },
];

interface CardProps {
  source: any;
  index: number;
  rotationZ: SharedValue<number>;
}

const Card = ({ source, index, rotationZ }: CardProps) => {
  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: -DEVICE_WIDTH * 0.4 },
        { rotateZ: `${(index - 1) * rotationZ.value}deg` },
        { translateX: DEVICE_WIDTH * 0.4 },
      ],
    };
  });

  return (
    <Animated.View style={[rStyle, styles.cardWrapper]}>
      <Image source={source} resizeMode="contain" style={styles.card} />
    </Animated.View>
  );
};

const CardsRotateScreen = () => {
  const [transition, setTransition] = useState(false);
  const rotationZ = useSharedValue(0);

  const handleBtnPress = () => {
    const next = !transition;
    setTransition(next);
    rotationZ.value = withSpring(next ? 30 : 0, {
      damping: 12,
      stiffness: 120,
      mass: 1,
      overshootClamping: false,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="Cards Rotate" />
      <View style={styles.contentContainer}>
        <View style={styles.cardsContainer}>
          {CARDS.map((card, index) => (
            <Card
              key={card.id}
              source={card.path}
              index={index}
              rotationZ={rotationZ}
            />
          ))}
        </View>
        <View style={styles.btnContainer}>
          <ButtonStandard
            btnLabel={transition ? 'Restore' : 'Rotate'}
            btnWidth={DEVICE_WIDTH * 0.8}
            onPress={handleBtnPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CardsRotateScreen;
