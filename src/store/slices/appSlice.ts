import {createSlice} from '@reduxjs/toolkit';

interface AppState {
  isAppLoading: boolean;
  isAppError: boolean;
}

const initialAppState: AppState = {
  isAppLoading: false,
  isAppError: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    setAppLoading: (state, action) => {
      return {...state, isAppLoading: action.payload};
    },
    setAppError: (state, action) => {
      return {...state, isAppError: action.payload};
    },
  },
});

export const {setAppLoading, setAppError} = appSlice.actions;

export default appSlice.reducer;
