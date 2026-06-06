import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/end-points';
import axiosClient from '../../api/axiosClient';

// Payload sent TO the API
export interface FetchOrdersPayload {
  page?: number;
  numberOfRecords?: number;
  fromDate?: string | null;
  toDate?: string | null;
  productName?: string;
  orderId?: string;
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: FetchOrdersPayload) =>
    axiosClient.post(API_ENDPOINTS.FETCH_ORDERS, params).then(r => r.data),
);

const initialOrdersState = {};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: initialOrdersState,
  reducers: {},
});

export default ordersSlice.reducer;
