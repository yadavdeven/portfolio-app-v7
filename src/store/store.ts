import { configureStore } from '@reduxjs/toolkit';
import sslPinningReducer from './slices/sslPinningSlice';
import ordersSlice from './slices/ordersSlice';
import driveReducer from './slices/driveSlice';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    orders: ordersSlice,
    sslPinning: sslPinningReducer,
    drive: driveReducer,
  },
});

// Types for RootState & AppDispatch (handy with TS + hooks)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
