import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';
import Colors from '../../../constants/Colors';
import { FONTS } from '../../../utils/typography';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAddLink: (url: string) => void;
};

const LinkModal: React.FC<Props> = ({ visible, onClose, onAddLink }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!visible) {
      setUrl('');
    }
  }, [visible]);

  const handleAdd = () => {
    onAddLink(url.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Add Link</Text>

          <TextInput
            placeholder="Enter URL (https://...)"
            placeholderTextColor="#999"
            value={url}
            onChangeText={setUrl}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addBtn,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  backgroundColor: url.trim()
                    ? Colors.primary
                    : Colors.grey_500,
                  opacity: url.trim() ? 1 : 0.9,
                },
              ]}
              onPress={handleAdd}
              disabled={!url.trim()}
            >
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LinkModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: DEVICE_WIDTH - moderateScale(48),
    backgroundColor: Colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(20),
  },
  title: {
    fontSize: moderateScale(16, 0.4),
    marginBottom: moderateScale(15),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary_100,
  },
  input: {
    borderWidth: moderateScale(1.2),
    borderColor: Colors.grey_300,
    borderRadius: moderateScale(4),
    padding: moderateScale(10),
    fontSize: moderateScale(14, 0.4),
    marginBottom: moderateScale(20),
    color: Colors.grey_100,
    fontFamily: FONTS.lato_bold,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    marginRight: moderateScale(10),
  },
  cancelText: {
    color: Colors.grey_100,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  addBtn: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(18),
    borderRadius: moderateScale(8),
  },
  addText: {
    color: Colors.white,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
  },
});
