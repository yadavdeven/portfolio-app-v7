import { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { inputValidators } from '../../utils/validators';

export interface LoginInputProps {
  inputLabel: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  marginBottom?: number;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;

  // ✅ validation
  validateFor?: keyof typeof inputValidators;
  onValidationChange?: (isValid: boolean) => void;
  compareWith?: string;

  // ✅ navigation
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  isLastField?: boolean;

  // ✅ autofill / autocomplete
  textContentType?: TextInputProps['textContentType']; // iOS
  autoComplete?: TextInputProps['autoComplete']; // Android
  isRequired?: boolean;
}
