import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../constants/Dimensions';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

export interface CustomAlertProps {
  isVisible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Tints the confirm button red for irreversible actions. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Fires once the hide animation has fully completed. */
  onModalHide?: () => void;
}

const isAndroid = Platform.OS === 'android';

export default function CustomAlert({
  isVisible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  onModalHide,
}: CustomAlertProps) {
  return (
    <Modal
      isVisible={isVisible}
      onModalHide={onModalHide}
      backdropOpacity={isAndroid ? 0.3 : 0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={250}
      animationOutTiming={200}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {!!message && <Text style={styles.message}>{message}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, styles.cancelText]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btn,
              destructive ? styles.destructiveBtn : styles.confirmBtn,
            ]}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnText, styles.confirmText]}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: DEVICE_WIDTH * 0.75,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    paddingTop: moderateScale(22),
    paddingHorizontal: moderateScale(22),
    paddingBottom: moderateScale(18),
  },
  title: {
    color: Colors.grey_primary,
    fontSize: moderateScale(17),
    fontFamily: FONTS.lato_bold,
    textAlign: 'center',
  },
  message: {
    marginTop: moderateScale(10),
    color: Colors.grey_200,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    fontFamily: FONTS.lato_regular,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    columnGap: moderateScale(12),
    marginTop: moderateScale(22),
  },
  btn: {
    flex: 1,
    height: moderateScale(32),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.offWhite_400,
  },
  confirmBtn: {
    backgroundColor: Colors.primary_100,
  },
  destructiveBtn: {
    backgroundColor: Colors.error,
  },
  btnText: {
    fontSize: moderateScale(13.5),
    fontFamily: FONTS.lato_bold,
  },
  cancelText: {
    color: Colors.grey_200,
  },
  confirmText: {
    color: Colors.white,
  },
});
