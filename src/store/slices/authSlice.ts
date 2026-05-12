import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { makeApiRequest, makeApiRequestPreLogin } from '../../utils/api';

interface RegisterPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export const register = createAsyncThunk(
  'auth/register',
  async (params: RegisterPayload) =>
    makeApiRequestPreLogin(API_ENDPOINTS.REGISTER, 'POST', params),
);

interface LoginPayload {
  email: string;
  password: string;
  authProvider: 'email';
}

export const login = createAsyncThunk(
  'auth/login',
  async (params: LoginPayload) =>
    makeApiRequestPreLogin(API_ENDPOINTS.LOGIN, 'POST', params),
);

interface GoogleAuthPayload {
  idToken: string;
}

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (params: GoogleAuthPayload) =>
    makeApiRequestPreLogin(API_ENDPOINTS.GOOGLE_AUTH, 'POST', params),
);

export const biometricRegisterStart = createAsyncThunk(
  'biometric/registerStart',
  async () => makeApiRequest(API_ENDPOINTS.BIOMETRIC_REGISTER_START, 'POST'),
);

export const biometricRegisterVerify = createAsyncThunk(
  'biometric/registerVerify',
  async (payload: {
    publicKey?: string;
    signature: string;
    deviceName: string;
  }) =>
    makeApiRequest(API_ENDPOINTS.BIOMETRIC_REGISTER_VERIFY, 'POST', payload),
);

export const biometricLoginStart = createAsyncThunk(
  'biometric/loginStart',
  async (payload: { email: string }) =>
    makeApiRequestPreLogin(
      API_ENDPOINTS.BIOMETRIC_LOGIN_START,
      'POST',
      payload,
    ), // ✅
);

export const biometricLoginVerify = createAsyncThunk(
  'biometric/loginVerify',
  async (payload: {
    email: string;
    signature: string;
    credentialId: string;
    counter: number;
  }) =>
    makeApiRequestPreLogin(
      API_ENDPOINTS.BIOMETRIC_LOGIN_VERIFY,
      'POST',
      payload,
    ), // ✅
);

export const biometricDisable = createAsyncThunk(
  'biometric/disable',
  async (payload: { credentialId: string }) =>
    makeApiRequest(API_ENDPOINTS.BIOMETRIC_DISABLE, 'POST', payload),
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
