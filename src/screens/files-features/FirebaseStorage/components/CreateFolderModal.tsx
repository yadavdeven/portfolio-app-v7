import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../../../constants/Dimensions';
import { FONTS } from '../../../../utils/typography';
import Colors from '../../../../constants/Colors';

interface Props {
  isVisible: boolean;
  /** Name of the folder the new folder will be created inside. */
  parentName: string;
  /** True while the create request is in flight. */
  loading?: boolean;
  onCreate: (name: string) => void;
  onCancel: () => void;
  /** Fires once the hide animation has fully completed. */
  onModalHide?: () => void;
}

const isAndroid = Platform.OS === 'android';

export default function CreateFolderModal({
  isVisible,
  parentName,
  loading = false,
  onCreate,
  onCancel,
  onModalHide,
}: Props) {
  const [name, setName] = useState('');

  // Reset the field each time the modal opens.
  useEffect(() => {
    if (isVisible) {
      setName('');
    }
  }, [isVisible]);

  const trimmed = name.trim();
  const canCreate = trimmed.length > 0 && !loading;

  return (
    <Modal
      isVisible={isVisible}
      onModalHide={onModalHide}
      backdropOpacity={isAndroid ? 0.3 : 0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={250}
      animationOutTiming={200}
      avoidKeyboard
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      onBackdropPress={onCancel}
      onBackButtonPress={onCancel}
    >
      <View style={styles.card}>
        <Text style={styles.title}>New folder</Text>
        <Text style={styles.info} numberOfLines={2}>
          Creating inside{' '}
          <Text style={styles.infoStrong}>{parentName}</Text>
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Folder name"
          placeholderTextColor={Colors.grey_400}
          autoFocus
          maxLength={120}
          returnKeyType="done"
          onSubmitEditing={() => canCreate && onCreate(trimmed)}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={onCancel}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={[styles.btnText, styles.cancelText]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.confirmBtn, !canCreate && styles.btnDisabled]}
            onPress={() => onCreate(trimmed)}
            activeOpacity={0.7}
            disabled={!canCreate}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={[styles.btnText, styles.confirmText]}>
                Create folder
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: DEVICE_WIDTH * 0.82,
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
  },
  info: {
    marginTop: moderateScale(8),
    color: Colors.grey_400,
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(18),
    fontFamily: FONTS.lato_regular,
  },
  infoStrong: {
    color: Colors.grey_200,
    fontFamily: FONTS.lato_bold,
  },
  input: {
    marginTop: moderateScale(16),
    height: moderateScale(44),
    borderWidth: moderateScale(1),
    borderColor: Colors.offWhite_400,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    fontSize: moderateScale(14),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_primary,
  },
  actions: {
    flexDirection: 'row',
    columnGap: moderateScale(12),
    marginTop: moderateScale(20),
  },
  btn: {
    flex: 1,
    height: moderateScale(38),
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
  btnDisabled: {
    opacity: 0.5,
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
