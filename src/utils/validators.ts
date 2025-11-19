export type ValidatorKey =
  | 'required'
  | 'email'
  | 'mobile'
  | 'password'
  | 'confirmPassword';

// 🔹 reusable "required" check with dynamic label
const requiredValidator = (val: string, label: string): string | null => {
  return val.trim() ? null : `${label} is required`;
};

export const inputValidators: Record<
  ValidatorKey,
  (val: string, extra?: { compareWith?: string; label?: string }) => string | null
> = {
  required: (val, { label } = {}) => {
    return requiredValidator(val, label ?? 'This field');
  },
  email: (val, { label } = {}) => {
    const required = requiredValidator(val, label ?? 'Email');
    if (required) return required;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val) ? null : `Invalid ${label ?? 'email'} address`;
  },
  mobile: (val, { label } = {}) => {
    const required = requiredValidator(val, label ?? 'Mobile number');
    if (required) return required;
    const regex = /^[0-9]{10}$/;
    return regex.test(val) ? null : `Invalid ${label ?? 'mobile number'}`;
  },
  password: (val, { label } = {}) => {
    const required = requiredValidator(val, label ?? 'Password');
    if (required) return required;
    return val.length >= 6
      ? null
      : `${label ?? 'Password'} must be at least 6 characters`;
  },
  confirmPassword: (val, { compareWith, label } = {}) => {
    const required = requiredValidator(val, label ?? 'Confirm password');
    if (required) return required;
    if (!compareWith?.trim()) return 'Password is required first';
    return val === compareWith ? null : 'Passwords do not match';
  },
};
