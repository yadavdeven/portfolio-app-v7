import axios from 'axios';
import { getAuthCredentials, saveAuthCredentials } from './authStorage';
import { API_ENDPOINTS } from '../constants/end-points';
import { BASE_API_URL } from '@env';

export const refreshAccessToken = async (): Promise<string> => {
  const credentials = await getAuthCredentials();
  if (!credentials?.refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(
    `${BASE_API_URL}/${API_ENDPOINTS.REFRESH_TOKEN}`,
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
