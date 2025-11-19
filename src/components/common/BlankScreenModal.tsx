import React from 'react';
import {StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';

interface BlankScreenModalProps {
  showModal: boolean;
}

const BlankScreenModal = ({showModal}: BlankScreenModalProps) => {
  return (
    <View style={styles.container}>
      <Modal
        isVisible={showModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        useNativeDriver
        useNativeDriverForBackdrop
        children={undefined}
        backdropOpacity={0.2}
      />
    </View>
  );
};

export default BlankScreenModal;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
