import { BASE_API_URL } from '@env';
import * as Keychain from 'react-native-keychain';

export const saveAuthCredentials = async (
  userId: string,
  token: string,
  guid: string,
) => {
  try {
    const data = { token, guid };

    await Keychain.setGenericPassword(userId, JSON.stringify(data), {
      service: 'auth_credentials',
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });

    console.log('User ID, token, and GUID saved securely');
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

  try {
    const response = await fetch(url, options);

    const responseJson = await response.json();

    if (!response.ok) {
      const errorMessage =
        responseJson?.message ||
        `Request failed with status ${responseJson.status}`;

      throw new Error(errorMessage);
    }

    const responseData = responseJson?.responseData;
    if (responseData) {
      const { id, token, guid } = responseData;
      await saveAuthCredentials(id, token, guid);
    }
    return responseJson;
  } catch (error: any) {
    console.log('inside catch', error);
    throw new Error(error?.message || 'Something went wrong');
  }
};

export default makeApiRequestPreLogin;
