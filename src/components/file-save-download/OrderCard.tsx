import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EyeIcon from '../../assets/svgs/visibility_24dp_300.svg';
import { UIActivityIndicator } from 'react-native-indicators';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

export type OrderCardPropsType = {
  orderId: string;
  orderDate: string;
  productName: string;
  totalAmount: number;
  customerName: string;
  customerMobile: string;
  currStatus: string;
  btnLoading: boolean;
  isSelected: boolean;
  onViewPress: () => void;
};

// RAW height (before scaling) we computed earlier
export const ORDER_CARD_RAW_HEIGHT = 233;
export const ORDER_CARD_HEIGHT = moderateScale(ORDER_CARD_RAW_HEIGHT);

const OrderCard: React.FC<OrderCardPropsType> = ({
  orderId,
  orderDate,
  productName,
  totalAmount,
  customerName,
  customerMobile,
  currStatus,
  btnLoading,
  isSelected,
  onViewPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.titleText, { width: '45%' }]}>Order Id</Text>
        <Text style={styles.titleText}>{orderId}</Text>
      </View>

      {/* Divider after Order Id */}
      <View style={styles.divider} />

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Order Date</Text>
        <Text style={styles.value}>{orderDate}</Text>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Product Name</Text>
        <Text style={styles.value}>{productName}</Text>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Customer Name</Text>
        <Text style={styles.value}>{customerName}</Text>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Customer Mobile</Text>
        <Text style={styles.value}>{customerMobile}</Text>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Total Amount</Text>
        <Text style={styles.value}>
          {'\u20B9'} {Number(totalAmount).toLocaleString('en-IN')}
        </Text>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>Current Status</Text>
        <Text style={styles.value}>{currStatus}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onViewPress}>
        <Text style={styles.buttonText}>View Order</Text>
        {isSelected && btnLoading ? (
          <UIActivityIndicator
            color={Colors.white}
            size={moderateScale(12)}
            count={12}
            style={styles.loader}
          />
        ) : (
          <EyeIcon
            fill={Colors.white}
            width={moderateScale(16)}
            height={moderateScale(16)}
            style={styles.eyeIcon}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: Colors.white,
    marginBottom: moderateScale(16),
    padding: moderateScale(16),
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: moderateScale(14, 0.4),
    color: Colors.primary_100,
    fontFamily: FONTS.geom_medium,
  },
  rowContainer: {
    flexDirection: 'row',
    height: moderateScale(24, 0.4),
  },
  label: {
    fontSize: moderateScale(14, 0.4),
    color: Colors.grey_400,
    fontFamily: FONTS.geom_regular,
    width: '45%',
  },
  value: {
    fontSize: moderateScale(14, 0.4),
    color: Colors.grey_200,
    fontFamily: FONTS.geom_regular,
    textAlign: 'left',
  },
  divider: {
    height: moderateScale(1),
    backgroundColor: Colors.grey_500,
    marginTop: moderateScale(12, 0.4),
    marginBottom: moderateScale(10, 0.4),
    opacity: 0.3,
  },
  button: {
    width: DEVICE_WIDTH * 0.4,
    height: moderateScale(32),
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.primary_100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(4),
    marginTop: moderateScale(12),
    position: 'relative',
  },
  buttonText: {
    fontSize: moderateScale(12, 0.4),
    color: Colors.white,
    fontFamily: FONTS.lato_bold,
  },
  loader: {
    position: 'absolute',
    right: moderateScale(22),
  },
  eyeIcon: {
    position: 'absolute',
    right: moderateScale(22),
  },
});
