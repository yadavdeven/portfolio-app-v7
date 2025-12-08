import { StyleSheet } from 'react-native';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  cardsContainer: {
    marginTop: moderateScale(150),
  },
  cardWrapper: {
    position: 'absolute',
    left: DEVICE_WIDTH * 0.12,
  },
  card: {
    width: DEVICE_WIDTH * 0.76,
    height: moderateScale(200),
  },
  btnContainer: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: moderateScale(120),
  },
});

export default styles;
