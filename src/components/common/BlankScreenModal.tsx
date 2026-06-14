import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

interface BlankScreenModalProps {
  showModal: boolean;
}

const BlankScreenModal = ({ showModal }: BlankScreenModalProps) => {
  return (
    <Modal visible={showModal} animationType="fade" transparent>
      <View style={styles.backdrop} />
    </Modal>
  );
};

export default BlankScreenModal;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
});
