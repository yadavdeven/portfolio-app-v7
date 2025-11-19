import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInput as RNTextInput,
  Keyboard,
} from 'react-native';
import { LoginInputProps } from '../../types/components/login';
import { FONTS } from '../../utils/typography';
import { moderateScale } from 'react-native-size-matters';
import { inputValidators } from '../../utils/validators';
import Colors from '../../constants/Colors';

export type LoginInputRef = {
  focus: () => void;
  validate: () => boolean;
};

const LoginInput = forwardRef<LoginInputRef, LoginInputProps>(
  (
    {
      inputLabel,
      value,
      onChange,
      placeholder,
      marginBottom,
      secureTextEntry,
      keyboardType,
      validateFor,
      onValidationChange,
      onSubmitEditing,
      returnKeyType = 'next',
      isLastField = false,
      compareWith,
      textContentType = 'none',
      autoComplete = 'off',
      isRequired = false,
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false); // ✅ track if validation started

    const inputRef = useRef<RNTextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      validate: () => {
        setTouched(true);
        return runValidation(value);
      },
    }));

    const runValidation = (text: string) => {
      // required
      if (isRequired && !text.trim()) {
        setError(`${inputLabel} is required`);
        onValidationChange?.(false);
        return false;
      }

      // custom validator
      if (validateFor) {
        const errorMsg =
          inputValidators[validateFor]?.(text, {
            label: inputLabel,
            compareWith,
          }) || null;
        setError(errorMsg);
        onValidationChange?.(!errorMsg);
        return !errorMsg;
      }

      setError(null);
      onValidationChange?.(true);
      return true;
    };

    const handleChange = (text: string) => {
      onChange(text);
      if (touched) {
        runValidation(text); // ✅ only validate after touched
      }
    };

    const handleBlur = () => {
      if (touched) {
        runValidation(value); // re-validate on blur if touched
      }
      setFocused(false);
    };

    const handleSubmit = () => {
      if (isLastField) {
        inputRef.current?.blur();
        Keyboard.dismiss();
      } else {
        onSubmitEditing?.();
      }
    };

    return (
      <View style={{ marginBottom: marginBottom ?? moderateScale(14) }}>
        <Text style={styles.inputLabel}>
          {inputLabel}
          {isRequired && <Text style={{ color: Colors.alert_red }}> *</Text>}
        </Text>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          placeholderTextColor={Colors.grey_700}
          placeholder={placeholder}
          keyboardType={keyboardType}
          returnKeyType={isLastField ? 'done' : returnKeyType}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={handleSubmit}
          textContentType={textContentType}
          autoComplete={autoComplete}
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="none"
          style={[
            styles.input,
            {
              borderColor: error
                ? Colors.alert_red
                : focused
                ? Colors.primary_300
                : Colors.grey_800,
              fontSize: !value
                ? moderateScale(15, 0.4)
                : moderateScale(16, 0.4),
            },
          ]}
        />
        <Text style={styles.err_text}>{error || ''}</Text>
      </View>
    );
  },
);

export default LoginInput;

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: moderateScale(15, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
    marginBottom: moderateScale(5),
  },
  input: {
    width: '100%',
    height: moderateScale(36),
    borderRadius: 5,
    padding: 0,
    color: Colors.grey_200,
    borderWidth: moderateScale(1),
    paddingLeft: moderateScale(10),
    fontFamily: FONTS.lato_bold,
  },
  err_text: {
    fontFamily: FONTS.lato_regular,
    color: Colors.alert_red,
    fontSize: moderateScale(12, 0.4),
    marginTop: moderateScale(4),
  },
});
