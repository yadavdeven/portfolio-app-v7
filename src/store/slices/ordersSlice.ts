import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/endpoints';
import { makeApiRequest } from '../../utils/api';

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
    makeApiRequest(API_ENDPOINTS.FETCH_ORDERS, 'POST', params),
);

const initialOrdersState = {};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState: initialOrdersState,
  reducers: {},
});

export default ordersSlice.reducer;
