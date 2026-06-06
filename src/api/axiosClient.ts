import axios from 'axios';
import { clearAuthCredentials, getAuthCredentials } from './authStorage';
import { resetNavigation } from '../navigation/navigation-utils';
import { ERROR_MESSAGES } from '../constants/messages';
import NetInfo from '@react-native-community/netinfo';
import { refreshAccessToken } from './authApi';
import { ROUTES } from '../navigation/routes';
import { BASE_API_URL } from '@env';

// ── Module augmentation: allow a custom `requiresAuth` field on request config.
// Defaults to true; public endpoints (login/register) pass `{ requiresAuth: false }`.
declare module 'axios' {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
    _retry?: boolean;
  }
}

// Single shared axios instance for all API calls so config (base URL, timeout,
// headers, and any future interceptors) lives in one place.
const axiosClient = axios.create({
  // Root URL every request is resolved against; injected from the build env.
  baseURL: BASE_API_URL,
  // Abort requests that hang for more than 15s rather than waiting forever.
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach access token + x-guid from keychain to every request.
axiosClient.interceptors.request.use(async config => {
  const netInfo = await NetInfo.fetch();
  const isOffline =
    !netInfo.isConnected || netInfo.isInternetReachable === false;

  if (isOffline) {
    return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
  }

  // Default to true — most calls need auth; public calls opt OUT explicitly.
  const requiresAuth = config.requiresAuth !== false;

  if (requiresAuth) {
    const credentials = await getAuthCredentials();
    if (credentials?.accessToken) {
      config.headers.Authorization = `Bearer ${credentials.accessToken}`;
      config.headers['x-guid'] = credentials.guid;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // No `error.response` means the request never reached the server:
    // a timeout (axios aborts after `timeout` ms) or a network failure.
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error(ERROR_MESSAGES.TIMEOUT));
      }
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        // refresh failed (no/expired refresh token) → can't recover
        await clearAuthCredentials(); // wipe dead creds
        resetNavigation([{ name: ROUTES.AUTH_NAVIGATOR }]);
        return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED)); // re-reject so caller knows
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
