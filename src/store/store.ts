import { configureStore } from '@reduxjs/toolkit';
import ordersSlice from './slices/ordersSlice';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import sslPinningReducer from './slices/sslPinningSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    orders: ordersSlice,
    sslPinning: sslPinningReducer,
  },
});

// Types for RootState & AppDispatch (handy with TS + hooks)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
