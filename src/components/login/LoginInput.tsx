import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LoginInputProps } from '../../types/components/login';
import { dynamicHeight } from '../../utils/layout';
import { FONTS } from '../../utils/typography';
import Colors from '../../constants/Colors';

export default function LoginInput({
  inputLabel,
  value,
  onChange,
  placeholder,
  marginBottom,
  secureTextEntry,
}: LoginInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: marginBottom }}>
      <Text style={styles.inputLabel}>{inputLabel}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholderTextColor={Colors.grey_700}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={secureTextEntry}
        style={[
          styles.input,
          {
            borderColor: focused ? Colors.primary_300 : Colors.grey_800,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: dynamicHeight(18),
    color: Colors.grey_200,
    fontFamily: FONTS.lato_bold,
    marginBottom: dynamicHeight(8),
  },
  input: {
    width: '100%',
    height: dynamicHeight(50),
    borderRadius: 5,
    padding: 0,
    fontFamily: FONTS.lato_bold,
    color: Colors.black,
    borderWidth: dynamicHeight(2),
    fontSize: dynamicHeight(18),
    paddingLeft: dynamicHeight(10),
  },
  err_text: {
    fontFamily: FONTS.lato_regular,
    color: Colors.alert_red,
    fontSize: dynamicHeight(14),
    marginTop: dynamicHeight(4),
  },
});
