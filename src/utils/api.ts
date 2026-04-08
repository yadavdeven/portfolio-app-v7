import { BASE_API_URL } from '@env';
import * as Keychain from 'react-native-keychain';

const refreshAccessToken = async () => {
  const credentials = await getAuthCredentials();
  if (!credentials?.refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      refreshToken: credentials.refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error('Session expired. Please login again.');
  }

  const json = await response.json();
  const { token, refreshToken } = json.responseData;

  // save NEW tokens
  await saveAuthCredentials(
    credentials.userId,
    token,
    refreshToken,
    credentials.guid,
  );

  return token;
};

const saveAuthCredentials = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  guid: string,
) => {
  try {
    const data = { accessToken, refreshToken, guid };

    await Keychain.setGenericPassword(userId, JSON.stringify(data), {
      service: 'auth_credentials',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });

    console.log('Tokens saved securely');
  } catch (error) {
    console.log('Error saving credentials to keychain:', error);
    throw error;
  }
};

const makeApiRequestPreLogin = async (
  endpoint: string,
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'POST',
  body?: object,
) => {
  const url = `${BASE_API_URL}/${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  console.log('body', body);

  try {
    const response = await fetch(url, options);

    const responseJson = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseJson?.message ||
        `Request failed with status ${response.status}`;

      throw new Error(errorMessage);
    }

    const responseData = responseJson?.responseData;
    if (responseData) {
      const { id, token, refreshToken, guid } = responseData;
      await saveAuthCredentials(id, token, refreshToken, guid);
    }
    return responseJson;
  } catch (error: any) {
    console.log('inside catch', error);
    throw new Error(error?.message || 'Something went wrong');
  }
};

// Load stored token + guid
const getAuthCredentials = async () => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: 'auth_credentials',
    });

    if (!credentials) return null;

    const { username: userId, password } = credentials;
    const parsed = JSON.parse(password);

    return {
      userId,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      guid: parsed.guid,
    };
  } catch (error) {
    console.log('Error loading credentials:', error);
    return null;
  }
};

/**
 * Unified API Request Function (for authenticated APIs)
 */
const makeApiRequest = async (
  endpoint: string,
  method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
) => {
  try {
    const credentials = await getAuthCredentials();

    if (!credentials?.accessToken) {
      throw new Error('Authentication required. Please login again.');
    }

    const { accessToken, guid } = credentials;

    const executeRequest = async (tokenToUse: string) => {
      let url = `${BASE_API_URL}/${endpoint}`;

      if (method === 'GET' && body) {
        const queryString = new URLSearchParams(body).toString();
        url += `?${queryString}`;
      }

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
          'x-guid': guid,
        },
      };

      if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
      }

      return fetch(url, options);
    };

    // 🔹 first attempt
    let response = await executeRequest(accessToken);

    // 🔥 if access token expired → refresh and retry
    if (response.status === 401) {
      console.log('Access token expired. Refreshing...');

      const newAccessToken = await refreshAccessToken();
      response = await executeRequest(newAccessToken);
    }

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.message || 'Request failed');
    }

    return json;
  } catch (err: any) {
    console.log('API Error:', err);
    throw new Error(err?.message || 'Something went wrong');
  }
};

export { makeApiRequest, makeApiRequestPreLogin };
