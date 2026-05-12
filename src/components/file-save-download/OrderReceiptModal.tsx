import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import ViewShot from 'react-native-view-shot';
import Modal from 'react-native-modal';
import CopyRightSvg from '../../assets/svgs/copyright_24dp_300.svg';
import DownloadSvg from '../../assets/svgs/download_24dp_300.svg';
import CloseSvg from '../../assets/svgs/cancel_24dp_300.svg';
import ShareSvg from '../../assets/svgs/share_24dp_300.svg';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { isAndroid } from '../../utils/helperFunctions';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';
import AppToast from '../common/AppToast';

export type OrderType = {
  orderId?: string;
  orderDate?: string;
  productName?: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  totalAmount?: string | number;
  currStatus?: string;
};

export type OrderReceiptModalProps = OrderType & {
  showReceiptModal?: boolean;
  receiptRef: any;
  onBackButtonPress: () => void;
  onDownloadPress: () => Promise<boolean>;
  onSharePress: () => void;
  onClosePress: () => void;
};

export default function OrderReceiptModal({
  showReceiptModal,
  onBackButtonPress,
  receiptRef,
  orderId,
  orderDate,
  customerName,
  customerMobile,
  totalAmount,
  currStatus,
  customerEmail,
  productName,
  onDownloadPress,
  onSharePress,
  onClosePress,
}: OrderReceiptModalProps) {
  const [toast, setToast] = useState<{
    text: string;
    type?: 'info' | 'error' | 'default';
  } | null>(null);

  const showToast = (
    text: string,
    type: 'info' | 'error' | 'default' = 'default',
  ) => {
    setToast({ text, type });
  };

  return (
    <Modal
      backdropOpacity={isAndroid ? 0.3 : 0.4}
      isVisible={showReceiptModal}
      animationInTiming={500}
      animationOutTiming={400}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      animationIn="slideInUp"
      animationOut="fadeOut"
      onBackButtonPress={onBackButtonPress}
    >
      <View style={styles.container}>
        {toast && (
          <AppToast
            text={toast.text}
            type={toast.type}
            onHide={() => setToast(null)}
            positionFromBottom={100}
          />
        )}
        <ViewShot ref={receiptRef} style={styles.viewshot_container}>
          <View style={styles.logo_container}>
            <Image
              resizeMode="contain"
              source={require('../../assets/images/global/logo_full.png')}
              style={styles.logo}
            />
            <Text
              style={{
                fontSize: moderateScale(16),
                fontFamily: FONTS.josefin_bold,
                color: Colors.primary,
              }}
            >
              Order Receipt
            </Text>
          </View>

          <View style={styles.rowContainer}>
            <Text style={styles.label}>Order Id</Text>
            <Text style={styles.value}>{orderId}</Text>
          </View>

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
            <Text style={styles.label}>Customer Email</Text>
            <Text style={styles.value}>{customerEmail}</Text>
          </View>

          <View style={styles.rowContainer}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.value}>
              ₹ {Number(totalAmount).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.rowContainer}>
            <Text style={styles.label}>Order Status</Text>
            <Text style={styles.value}>{currStatus}</Text>
          </View>

          <View style={styles.rights_text_container}>
            <CopyRightSvg
              fill={Colors.grey_200}
              width={moderateScale(18)}
              height={moderateScale(18)}
            />
            <Text style={{ color: Colors.grey_200 }}>
              2023 All Rights Reserved
            </Text>
          </View>

          <Text style={styles.text2}>
            This is a system generated receipt. Hence, no seal or signature
            required.
          </Text>
        </ViewShot>

        <View style={styles.btnsContainer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={async () => {
              const success = await onDownloadPress();
              if (success) showToast('Receipt downloaded successfully');
              else showToast('Failed to download receipt', 'error');
            }}
          >
            <Text style={styles.btnText}>Download</Text>
            <DownloadSvg
              fill={Colors.white}
              width={moderateScale(20)}
              height={moderateScale(20)}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSharePress}
            style={[styles.btn, { backgroundColor: Colors.primary_200 }]}
          >
            <Text style={styles.btnText}>Share</Text>
            <ShareSvg
              fill={Colors.white}
              width={moderateScale(14)}
              height={moderateScale(14)}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClosePress}
            style={[styles.btn, { backgroundColor: Colors.error }]}
          >
            <Text style={styles.btnText}>Close</Text>
            <CloseSvg
              fill={Colors.white}
              width={moderateScale(18)}
              height={moderateScale(18)}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    width: DEVICE_WIDTH,
    alignSelf: 'center',
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(25),
    maxWidth: 600,
  },
  viewshot_container: {
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    backgroundColor: Colors.white,
    paddingBottom: moderateScale(20),
  },
  logo_container: {
    width: DEVICE_WIDTH * 0.92,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(12),
    marginTop: moderateScale(8),
  },
  logo: {
    width: DEVICE_WIDTH * 0.4,
    height: moderateScale(50),
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(10),
  },
  label: {
    color: Colors.grey_400,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  value: {
    color: Colors.grey_200,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  text2: {
    color: Colors.grey_200,
    textAlign: 'center',
  },
  rights_text_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),
    columnGap: moderateScale(4),
  },
  btnsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: DEVICE_WIDTH * 0.04,
    alignSelf: 'center',
  },
  btn: {
    height: moderateScale(30),
    backgroundColor: Colors.green_shade,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: moderateScale(5),
    borderRadius: 5,
    width: '28%',
  },
  btnText: {
    color: Colors.white,
    fontFamily: FONTS.lato_bold,
    fontSize: moderateScale(12, 0.4),
  },
});
