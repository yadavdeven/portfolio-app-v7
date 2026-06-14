import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/end-points';
import axiosClient from '../../api/axiosClient';

// What the screen sends: `body` is echoed back under responseData.body, `query`
// becomes the query string and is echoed under responseData.query.
export interface EchoRequestPayload {
  body: Record<string, string | number>;
  query: Record<string, string>;
}

export interface EchoResponse {
  isSuccess: boolean;
  message: string;
  responseData: {
    query: Record<string, string>;
    body: Record<string, string | number>;
    timestamp: string;
  };
}

export const echoRequest = createAsyncThunk<EchoResponse, EchoRequestPayload>(
  'sslPinning/echoRequest',
  async ({ body, query }) =>
    axiosClient
      .post(API_ENDPOINTS.SSL_PINNING_ECHO, body, {
        params: query,
        requiresAuth: false,
      })
      .then(r => r.data),
);

interface SslPinningState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  response: EchoResponse | null;
  error: string | null;
}

const initialState: SslPinningState = {
  status: 'idle',
  response: null,
  error: null,
};

export const sslPinningSlice = createSlice({
  name: 'sslPinning',
  initialState,
  reducers: {
    resetEcho: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(echoRequest.pending, state => {
        state.status = 'loading';
        state.error = null;
        state.response = null;
      })
      .addCase(echoRequest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.response = action.payload;
      })
      .addCase(echoRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Request failed';
      });
  },
});

export const { resetEcho } = sslPinningSlice.actions;
export default sslPinningSlice.reducer;
