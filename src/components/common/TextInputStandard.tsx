import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import { FONTS } from '../../utils/typography';

type TextInputStandardProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
};

const TextInputStandard = forwardRef<TextInput, TextInputStandardProps>(
  (
    {
      label,
      error,
      containerStyle,
      leftIcon,
      rightIcon,
      onRightIconPress,
      placeholder = 'Enter',
      placeholderTextColor,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {!!label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.field,
            focused && styles.fieldFocused,
            !!error && styles.fieldError,
          ]}
        >
          {!!leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            value={rest.value}
            ref={ref}
            style={[
              styles.input,
              { fontSize: moderateScale(rest?.value ? 15 : 14, 0.4) },
            ]}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor ?? Colors.grey_600}
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            onFocus={e => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />

          {!!rightIcon &&
            (onRightIconPress ? (
              <TouchableOpacity
                style={styles.rightIcon}
                activeOpacity={0.6}
                onPress={onRightIconPress}
              >
                {rightIcon}
              </TouchableOpacity>
            ) : (
              <View style={styles.rightIcon}>{rightIcon}</View>
            ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

TextInputStandard.displayName = 'TextInputStandard';

export default TextInputStandard;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginBottom: moderateScale(8),
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(40),
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fieldFocused: {
    borderColor: Colors.primary,
  },
  fieldError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
  },
  leftIcon: {
    marginRight: moderateScale(10),
  },
  rightIcon: {
    marginLeft: moderateScale(10),
  },
  errorText: {
    marginTop: moderateScale(6),
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.error,
  },
});
