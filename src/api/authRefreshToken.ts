import axios from 'axios';
import { getAuthCredentials, saveAuthCredentials } from './authStorage';
import { API_ENDPOINTS } from '../constants/end-points';
import { baseURL } from './axiosClient';

// ── Single-flight guard ───────────────────────────────────────────────────
// When a token expires, several authed requests typically 401 at the same time.
// Without this, each one would fire its OWN refresh call: they race, the backend
// rotates the refresh token on the first success and invalidates it, so the rest
// refresh with a now-stale token and fail — forcing a spurious logout. We instead
// share ONE in-flight refresh promise across all concurrent callers; everyone
// awaits the same result. Reset to null once it settles so the next genuine
// expiry can refresh again.
let inFlightRefresh: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (!inFlightRefresh) {
    inFlightRefresh = doRefreshAccessToken().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
};

const doRefreshAccessToken = async (): Promise<string> => {
  const credentials = await getAuthCredentials();
  if (!credentials?.refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(
    `${baseURL}/${API_ENDPOINTS.REFRESH_TOKEN}`,
    { refreshToken: credentials.refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  );

  const { token, refreshToken } = response.data.responseData;

  await saveAuthCredentials(
    credentials.userId,
    token,
    refreshToken,
    credentials.guid,
    credentials.email,
  );

  return token;
};
