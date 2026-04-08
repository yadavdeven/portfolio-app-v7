import React, { useEffect, useRef } from 'react';
import { DeviceEventEmitter, StyleSheet, TextInput, View } from 'react-native';
import { FONTS } from '../utils/typography';
import Colors from '../constants/Colors';
import { DEVICE_WIDTH } from '../constants/Dimensions';

const TextArea = ({ handleChange, isBlocked }) => {
  const [value, setValue] = React.useState(''); // ✅ fix: __React__ → React
  const cursor = React.useRef(0); // ✅ track cursor reliably with ref
  const isBackspace = useRef(false);
  const prevText = useRef('');

  useEffect(() => {
    const handler = DeviceEventEmitter.addListener('facts_changed', data => {
      setValue(data.value);
      setTimeout(() => {
        isBlocked.current = false; // 👈 unblock when event received
      }, 2000);
    });

    return () => {
      handler.remove(); // 👈 just call .remove() on the listener directly
    };
  }, [isBlocked]);

  console.log('value:', value); // ✅ log current value

  return (
    <View>
      <TextInput
        onKeyPress={e => {
          isBackspace.current = e.nativeEvent.key === 'Backspace'; // 👈 set before onChange fires
        }}
        onChange={e => {
          if (isBlocked?.current) return;
          const text = e.nativeEvent.text; // 👈 text AFTER deletion

          // example:
          // user had "hello @Adam John"
          // user backspaces
          // text        = "hello @Adam Joh"  ← letter already gone
          // prevText    = "hello @Adam John" ← full word still intact

          handleChange(
            text,
            cursor.current,
            isBackspace.current,
            prevText.current,
          ); // 👈 pass prevText
          prevText.current = text; // 👈 update AFTER handleChange
          setValue(text);
        }}
        onSelectionChange={e => {
          cursor.current = e.nativeEvent.selection.start; // 👈 always reliable
        }}
        multiline={true}
        autoCorrect={false}
        style={styles.input}
        value={value}
      />
    </View>
  );
};

export default TextArea;

const styles = StyleSheet.create({
  input: {
    width: DEVICE_WIDTH * 0.92,
    height: 140,
    borderRadius: 5,
    padding: 5,
    color: Colors.grey_200,
    borderWidth: 1.2,
    paddingLeft: 10,
    fontFamily: FONTS.lato_bold,
    backgroundColor: Colors.white,
    borderColor: Colors.primary_200,
  },
});
