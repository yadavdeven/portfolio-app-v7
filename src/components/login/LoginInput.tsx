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
import { moderateScale } from 'react-native-size-matters';
import { inputValidators } from '../../utils/validators';
import { FONTS } from '../../utils/typography';
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
          {isRequired && <Text style={{ color: Colors.error }}> *</Text>}
        </Text>
        <View
          style={[
            styles.field,
            focused && styles.fieldFocused,
            !!error && styles.fieldError,
          ]}
        >
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            placeholderTextColor={Colors.grey_600}
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
              { fontSize: moderateScale(value ? 15 : 14, 0.4) },
            ]}
          />
        </View>
        <Text style={styles.err_text}>{error || ''}</Text>
      </View>
    );
  },
);

export default LoginInput;

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
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
    color: Colors.grey_primary,
    fontFamily: FONTS.lato_bold,
  },
  err_text: {
    marginTop: moderateScale(6),
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.error,
  },
});
