import axios from 'axios';
import { clearAuthCredentials, getAuthCredentials } from './authStorage';
import { resetNavigation } from '../navigation/navigation-utils';
import { ERROR_MESSAGES } from '../constants/messages';
import NetInfo from '@react-native-community/netinfo';
import { refreshAccessToken } from './authRefreshToken';
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

// Local backend used for SSL-pinning testing. `localhost` won't resolve from a
// real device or emulator, so point at the dev machine's LAN IP (update this to
// match your machine; Android emulator can also use http://10.0.2.2:5002).
const LOCAL_BASE_URL = 'http://192.168.2.4:5002/api/v1';

// Toggle for local-vs-deployed backend: set USE_LOCAL_BACKEND to false to fall
// back to the deployed env URL. Referencing BASE_API_URL here also keeps the
// import in use either way.
const USE_LOCAL_BACKEND = true; // set to true to test local backend (SSL pinning)
const baseURL = USE_LOCAL_BACKEND ? LOCAL_BASE_URL : BASE_API_URL;
// Single shared axios instance for all API calls so config (base URL, timeout,
// headers, and any future interceptors) lives in one place.
const axiosClient = axios.create({
  // Root URL every request is resolved against.
  baseURL,
  // Abort requests that hang for more than 15s on the wire.
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach access token + x-guid from keychain to every request.
axiosClient.interceptors.request.use(async config => {
  console.log('Base URL:', config.baseURL, 'Endpoint:', config.url);

  // ── STEP 1: internet check FIRST, on its own. Nothing about the server is
  // considered here — if the device has no connectivity we fail fast with a
  // "no internet" error before even attempting the request.
  // NOTE: unreliable on the iOS Simulator (its `isConnected` flag stays true
  // even with the host offline); verify offline behavior on a real device/APK.
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
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
    console.log('API request failed:', error);
    const originalRequest = error.config;

    // No `error.response` means the request never got a response back. The
    // request interceptor already rejects genuinely-offline requests via
    // NetInfo, so by here the device was online — the likely causes are a
    // timeout, a true network drop (ERR_NETWORK), or the server being
    // unreachable (down, refused, DNS, or SSL-pin rejection).
    if (!error.response) {
      if (
        error.code === 'ECONNABORTED' ||
        error.message === ERROR_MESSAGES.TIMEOUT
      ) {
        return Promise.reject(new Error(ERROR_MESSAGES.TIMEOUT));
      }
      // ERR_NETWORK is ambiguous: axios reports it both for a genuine internet
      // drop AND for a reachable network where the server refused the connection
      // (down/refused/DNS/SSL-pin). Re-check NetInfo to tell them apart — only
      // call it "no internet" when the device is actually offline; otherwise the
      // network is fine and the server is the problem.
      if (error.code === 'ERR_NETWORK') {
        const netInfo = await NetInfo.fetch();
        const isOffline =
          !netInfo.isConnected || netInfo.isInternetReachable === false;
        return Promise.reject(
          new Error(
            isOffline
              ? ERROR_MESSAGES.NETWORK_ERROR
              : ERROR_MESSAGES.SERVER_UNREACHABLE,
          ),
        );
      }
      return Promise.reject(new Error(ERROR_MESSAGES.SERVER_UNREACHABLE));
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
        return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED));
      }
    }

    // Any other error response (400, 403, 404, 5xx…). The backend's real
    // message lives in error.response.data — surface it as the Error's message
    // so it survives Redux Toolkit's error serialization (which drops
    // `error.response`). Callers can then just read error.message everywhere.
    // TEMP DEBUG: log the full backend error body (includes `stack` in dev) so
    // we can see what actually failed server-side. Remove once diagnosed.
    console.log(
      '[API ERROR]',
      error.config?.url,
      error.response.status,
      JSON.stringify(error.response.data, null, 2),
    );
    const backendMessage = (error.response.data as { message?: string })
      ?.message;
    return Promise.reject(new Error(backendMessage ?? error.message));
  },
);

export default axiosClient;
