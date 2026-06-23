import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../../../utils/typography';
import Colors from '../../../../constants/Colors';
import ButtonStandard from '../../../../components/common/ButtonStandard';
import CameraSvg from '../../../../assets/svgs/add_a_photo_24dp_300.svg';
import ImageSvg from '../../../../assets/svgs/image_24dp_300.svg';

interface Props {
  isVisible: boolean;
  onSelect: (from: 'camera' | 'gallery') => void;
  onClose: () => void;
  /** Fires once the hide animation completes (used to launch the picker). */
  onModalHide?: () => void;
}

export default function MediaPickerSheet({
  isVisible,
  onSelect,
  onClose,
  onModalHide,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      isVisible={isVisible}
      onModalHide={onModalHide}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.4}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={260}
      animationOutTiming={220}
      useNativeDriver
      useNativeDriverForBackdrop
      style={styles.modal}
    >
      <View
        style={[
          styles.sheet,
          { paddingBottom: moderateScale(12) + insets.bottom },
        ]}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>Add photo or video</Text>

        <TouchableOpacity
          style={styles.option}
          activeOpacity={0.7}
          onPress={() => onSelect('camera')}
        >
          <View style={styles.iconWrap}>
            <CameraSvg
              width={moderateScale(22)}
              height={moderateScale(22)}
              fill={Colors.primary}
            />
          </View>
          <Text style={styles.optionText}>Take photo / video</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.option}
          activeOpacity={0.7}
          onPress={() => onSelect('gallery')}
        >
          <View style={styles.iconWrap}>
            <ImageSvg
              width={moderateScale(22)}
              height={moderateScale(22)}
              fill={Colors.primary}
            />
          </View>
          <Text style={styles.optionText}>Choose from gallery</Text>
        </TouchableOpacity>

        <ButtonStandard
          btnLabel="Cancel"
          btnWidth="100%"
          marginTop={moderateScale(14)}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: moderateScale(18),
    borderTopRightRadius: moderateScale(18),
    paddingTop: moderateScale(14),
    paddingHorizontal: moderateScale(18),
  },
  handle: {
    alignSelf: 'center',
    width: moderateScale(40),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: Colors.bg_400,
    marginBottom: moderateScale(14),
  },
  title: {
    fontSize: moderateScale(13, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_400,
    marginBottom: moderateScale(6),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(14),
  },
  iconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    backgroundColor: Colors.bg_700,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(14),
  },
  optionText: {
    fontSize: moderateScale(14.5, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bg_500,
  },
});
