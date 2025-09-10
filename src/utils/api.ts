import { BASE_API_URL } from '@env';

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};

export default makeApiRequestPreLogin;
