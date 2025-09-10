export interface LoginInputProps {
  inputLabel: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  marginBottom?: number;
  secureTextEntry: boolean;
}
