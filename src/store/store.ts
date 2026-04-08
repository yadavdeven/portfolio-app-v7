import { configureStore } from '@reduxjs/toolkit';
import ordersSlice from './slices/ordersSlice';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    orders: ordersSlice,
  },
});

// Types for RootState & AppDispatch (handy with TS + hooks)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
