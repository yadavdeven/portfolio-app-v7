import { StyleSheet } from 'react-native';
import { dynamicHeight } from '../../utils/layout';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '65%',
    height: dynamicHeight(60),
  },
});

export default styles;
