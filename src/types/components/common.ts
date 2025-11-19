export interface ButtonStandardProps {
  btnLabel: string;
  marginTop?: number;
  onPress: () => void;
  btnWidth?: number | `${number}%` | undefined;
}