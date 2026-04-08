import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { makeApiRequestPreLogin } from '../../utils/api';

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

const initialAuthState = {};

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {},
});

export default authSlice.reducer;
