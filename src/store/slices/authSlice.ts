import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { saveAuthCredentials } from '../../api/authStorage';
import { API_ENDPOINTS } from '../../constants/end-points';
import { ERROR_MESSAGES } from '../../constants/messages';
import axiosClient from '../../api/axiosClient';

interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export const register = createAsyncThunk(
  'auth/register',
  async (params: RegisterPayload) => {
    const res = await axiosClient
      .post(API_ENDPOINTS.REGISTER, params, { requiresAuth: false })
      .then(r => r.data);

    const { id, token, refreshToken, guid, email } = res.responseData;
    if (id && token && refreshToken) {
      await saveAuthCredentials(id, token, refreshToken, guid, email);
    }
    return res;
  },
);

interface LoginPayload {
  email: string;
  password: string;
  authProvider: 'email';
}

export const login = createAsyncThunk(
  'auth/login',
  async (params: LoginPayload) => {
    const res = await axiosClient
      .post(API_ENDPOINTS.LOGIN, params, { requiresAuth: false })
      .then(r => r.data);

    const { id, token, refreshToken, guid, email } = res.responseData;
    if (id && token && refreshToken) {
      await saveAuthCredentials(id, token, refreshToken, guid, email);
    } else {
      throw new Error(ERROR_MESSAGES.LOGIN_FAILED);
    }
    return res;
  },
);

interface GoogleAuthPayload {
  idToken: string;
}

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (params: GoogleAuthPayload) => {
    // POST the Firebase ID token to the backend (public route — no app session yet).
    // The backend verifies it and returns OUR tokens in responseData.
    const res = await axiosClient
      .post(API_ENDPOINTS.GOOGLE_AUTH, params, { requiresAuth: false })
      .then(r => r.data);

    // Persist the backend-issued session to the keychain so the axios interceptor
    // can attach it to every authenticated request from here on.
    const { id, token, refreshToken, guid, email } = res.responseData;
    if (id && token && refreshToken) {
      await saveAuthCredentials(id, token, refreshToken, guid, email);
    }
    return res;
  },
);

export const biometricRegisterStart = createAsyncThunk(
  'biometric/registerStart',
  async () =>
    axiosClient.post(API_ENDPOINTS.BIOMETRIC_REGISTER_START).then(r => r.data),
);

export const biometricRegisterVerify = createAsyncThunk(
  'biometric/registerVerify',
  async (payload: {
    publicKey?: string;
    signature: string;
    deviceName: string;
    deviceId: string;
  }) =>
    axiosClient
      .post(API_ENDPOINTS.BIOMETRIC_REGISTER_VERIFY, payload)
      .then(r => r.data),
);

export const biometricLoginStart = createAsyncThunk(
  'biometric/loginStart',
  async (payload: { email: string }) =>
    axiosClient
      .post(API_ENDPOINTS.BIOMETRIC_LOGIN_START, payload, {
        requiresAuth: false,
      })
      .then(r => r.data),
);

export const biometricLoginVerify = createAsyncThunk(
  'biometric/loginVerify',
  async (payload: { email: string; signature: string; credentialId: string }) =>
    axiosClient
      .post(API_ENDPOINTS.BIOMETRIC_LOGIN_VERIFY, payload, {
        requiresAuth: false,
      })
      .then(r => r.data),
);

export const biometricDisable = createAsyncThunk(
  'biometric/disable',
  async (payload: { credentialId: string }) =>
    axiosClient
      .post(API_ENDPOINTS.BIOMETRIC_DISABLE, payload)
      .then(r => r.data),
);

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    email: null as string | null,
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.email = action.payload?.responseData?.email || null;
    });

    builder.addCase(googleAuth.fulfilled, (state, action) => {
      state.email = action.payload?.responseData?.email || null;
    });
  },
});

export default authSlice.reducer;
