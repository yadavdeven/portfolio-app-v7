export const ERROR_MESSAGES = {
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  NETWORK_ERROR:
    'No internet connection. Please check your network and try again.',
  SERVER_UNREACHABLE: 'Unable to reach the server. Please try again in a moment.',
  TIMEOUT: 'The request took too long. Please try again.',
  LOGIN_FAILED: 'Login failed. Please try again.',
  BIOMETRIC_SETUP_FAILED: "Couldn't set up biometrics. Please try again.",
  GOOGLE_SIGN_IN_FAILED: 'Google sign-in failed. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful!',
} as const;
