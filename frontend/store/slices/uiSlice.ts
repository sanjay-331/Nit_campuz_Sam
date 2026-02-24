import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';

interface ToastState {
    message: string;
    type: 'success' | 'error';
    title?: string;
}

export interface UiState {
  toast: ToastState | null;
}

const initialState: UiState = {
  toast: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ToastState>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    }
  },
});

export const { showToast, hideToast } = uiSlice.actions;
export const selectToast = (state: RootState) => state.ui.toast;
export default uiSlice.reducer;
